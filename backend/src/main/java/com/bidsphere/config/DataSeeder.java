package com.bidsphere.config;

import com.bidsphere.entity.*;
import com.bidsphere.enums.AuctionStatus;
import com.bidsphere.enums.UserRole;
import com.bidsphere.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds the database with initial categories, an admin user,
 * and sample auction listings on first run.
 *
 * To create the admin account, the system seeds:
 *   Email: admin@bidsphere.com
 *   Password: Admin@1234
 *
 * IMPORTANT: Change this password immediately in production.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedCategories();
        seedAdminUser();
        seedSampleAuctions();
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) return;

        List<Category> categories = List.of(
            Category.builder().name("Electronics").description("Gadgets, cameras, computers, and tech").iconName("Cpu").build(),
            Category.builder().name("Watches & Accessories").description("Timepieces and fashion accessories").iconName("Watch").build(),
            Category.builder().name("Collectibles").description("Rare items, memorabilia, and antiques").iconName("Archive").build(),
            Category.builder().name("Books").description("Rare editions, first prints, and literature").iconName("BookOpen").build(),
            Category.builder().name("Home & Furniture").description("Vintage and designer home furnishings").iconName("Home").build(),
            Category.builder().name("Gaming").description("Consoles, games, and gaming peripherals").iconName("Gamepad2").build()
        );

        categoryRepository.saveAll(categories);
        log.info("Seeded {} categories", categories.size());
    }

    private void seedAdminUser() {
        if (userRepository.existsByEmail("admin@bidsphere.com")) return;

        User admin = User.builder()
                .fullName("BidSphere Admin")
                .email("admin@bidsphere.com")
                .passwordHash(passwordEncoder.encode("Admin@1234"))
                .role(UserRole.ADMIN)
                .enabled(true)
                .build();

        userRepository.save(admin);
        log.info("Seeded admin user: admin@bidsphere.com");
    }

    private void seedSampleAuctions() {
        if (auctionRepository.count() > 0) return;

        // Create a demo seller
        User seller;
        if (!userRepository.existsByEmail("seller@bidsphere.com")) {
            seller = User.builder()
                    .fullName("Alex Mercer")
                    .email("seller@bidsphere.com")
                    .passwordHash(passwordEncoder.encode("Seller@1234"))
                    .role(UserRole.USER)
                    .enabled(true)
                    .build();
            userRepository.save(seller);
        } else {
            seller = userRepository.findByEmail("seller@bidsphere.com").orElseThrow();
        }

        Category electronics = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Electronics")).findFirst().orElse(null);
        Category watches = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Watches & Accessories")).findFirst().orElse(null);
        Category collectibles = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Collectibles")).findFirst().orElse(null);
        Category books = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Books")).findFirst().orElse(null);
        Category gaming = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Gaming")).findFirst().orElse(null);

        LocalDateTime now = LocalDateTime.now();

        List<Object[]> auctionData = List.of(
            new Object[]{"Vintage Leica M3 Film Camera", "A legendary 35mm rangefinder camera from 1954, in excellent working condition. Comes with original 50mm Summicron lens and leather case. A collector's dream piece.", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format", electronics, new BigDecimal("45000"), new BigDecimal("1000"), now.minusHours(2), now.plusDays(5), AuctionStatus.ACTIVE},
            new Object[]{"Omega Seamaster Professional 300M", "Automatic diving watch, 41mm stainless steel case, blue ceramic bezel. Serviced and certified. Reference 2531.80. Circa 2005.", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format", watches, new BigDecimal("85000"), new BigDecimal("2500"), now.minusHours(1), now.plusDays(3), AuctionStatus.ACTIVE},
            new Object[]{"First Edition - The Great Gatsby", "Authentic first edition, first printing of F. Scott Fitzgerald's masterpiece (1925). Publisher's original green cloth binding. Light foxing only. Rare.", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format", books, new BigDecimal("120000"), new BigDecimal("5000"), now.plusHours(2), now.plusDays(10), AuctionStatus.SCHEDULED},
            new Object[]{"Nintendo Switch OLED - Limited Edition", "The Legend of Zelda: Tears of the Kingdom special edition. Sealed in original packaging. Never opened.", "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format", gaming, new BigDecimal("18000"), new BigDecimal("500"), now.minusHours(5), now.plusDays(2), AuctionStatus.ACTIVE},
            new Object[]{"Brass Art Deco Desk Lamp", "Stunning 1930s Art Deco table lamp in original aged brass finish. Fully rewired and PAT tested. Height 58cm.", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format", collectibles, new BigDecimal("8500"), new BigDecimal("250"), now.minusHours(3), now.plusDays(4), AuctionStatus.ACTIVE},
            new Object[]{"Sony Alpha A7R V Mirrorless Camera", "61MP full-frame mirrorless camera body only. Shutter count under 500. Includes original box and accessories.", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format", electronics, new BigDecimal("250000"), new BigDecimal("5000"), now.minusDays(1), now.plusDays(6), AuctionStatus.ACTIVE},
            new Object[]{"Rolex Datejust 36mm Ref 16234", "Stainless steel with white dial and jubilee bracelet. Box and papers from 2018. Recently serviced by authorized dealer.", "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&auto=format", watches, new BigDecimal("350000"), new BigDecimal("10000"), now.plusDays(1), now.plusDays(8), AuctionStatus.SCHEDULED},
            new Object[]{"Vintage Acoustic Guitar - 1968 Martin D-28", "All-original 1968 Martin D-28 dreadnought in outstanding condition. Light play wear, no repairs or modifications. Exceptional tone.", "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format", collectibles, new BigDecimal("95000"), new BigDecimal("3000"), now.minusDays(2), now.minusHours(1), AuctionStatus.ENDED}
        );

        for (Object[] data : auctionData) {
            Category cat = (Category) data[3];
            if (cat == null) continue;

            Product product = Product.builder()
                    .title((String) data[0])
                    .description((String) data[1])
                    .imageUrl((String) data[2])
                    .category(cat)
                    .seller(seller)
                    .build();

            Auction auction = Auction.builder()
                    .product(product)
                    .startingPrice((BigDecimal) data[4])
                    .minimumBidIncrement((BigDecimal) data[5])
                    .startTime((LocalDateTime) data[6])
                    .endTime((LocalDateTime) data[7])
                    .status((AuctionStatus) data[8])
                    .build();

            product.setAuction(auction);
            auctionRepository.save(auction);
        }

        log.info("Seeded {} sample auctions", auctionData.size());
    }
}
