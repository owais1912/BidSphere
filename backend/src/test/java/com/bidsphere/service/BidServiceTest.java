package com.bidsphere.service;

import com.bidsphere.dto.request.PlaceBidRequest;
import com.bidsphere.entity.*;
import com.bidsphere.enums.AuctionStatus;
import com.bidsphere.enums.UserRole;
import com.bidsphere.exception.*;
import com.bidsphere.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BidServiceTest {

    @Mock private BidRepository bidRepository;
    @Mock private AuctionRepository auctionRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private BidService bidService;

    private User seller;
    private User bidder;
    private Auction activeAuction;
    private Product product;

    @BeforeEach
    void setup() {
        seller = User.builder().id(1L).fullName("Seller One").email("seller@test.com")
                .role(UserRole.USER).enabled(true).build();

        bidder = User.builder().id(2L).fullName("Bidder One").email("bidder@test.com")
                .role(UserRole.USER).enabled(true).build();

        Category cat = Category.builder().id(1L).name("Electronics").build();

        product = Product.builder().id(1L).title("Test Item")
                .seller(seller).category(cat).build();

        activeAuction = Auction.builder()
                .id(1L).product(product)
                .startingPrice(new BigDecimal("1000"))
                .minimumBidIncrement(new BigDecimal("100"))
                .startTime(LocalDateTime.now().minusHours(1))
                .endTime(LocalDateTime.now().plusHours(24))
                .status(AuctionStatus.ACTIVE)
                .build();

        product.setAuction(activeAuction);
    }

    @Test
    void placeBid_validFirstBid_shouldSucceed() {
        PlaceBidRequest request = new PlaceBidRequest();
        request.setAmount(new BigDecimal("1000"));

        when(userRepository.findByEmail("bidder@test.com")).thenReturn(Optional.of(bidder));
        when(auctionRepository.findByIdWithLock(1L)).thenReturn(Optional.of(activeAuction));
        when(bidRepository.findMaxAmountByAuctionId(1L)).thenReturn(Optional.empty());
        when(bidRepository.save(any(Bid.class))).thenAnswer(inv -> {
            Bid b = inv.getArgument(0);
            return Bid.builder().id(1L).auction(b.getAuction()).bidder(b.getBidder())
                    .amount(b.getAmount()).build();
        });

        var response = bidService.placeBid(1L, request, "bidder@test.com");

        assertThat(response).isNotNull();
        assertThat(response.getAmount()).isEqualByComparingTo("1000");
        verify(bidRepository).save(any(Bid.class));
    }

    @Test
    void placeBid_belowMinimum_shouldThrow() {
        PlaceBidRequest request = new PlaceBidRequest();
        request.setAmount(new BigDecimal("900")); // Below starting price of 1000

        when(userRepository.findByEmail("bidder@test.com")).thenReturn(Optional.of(bidder));
        when(auctionRepository.findByIdWithLock(1L)).thenReturn(Optional.of(activeAuction));
        when(bidRepository.findMaxAmountByAuctionId(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bidService.placeBid(1L, request, "bidder@test.com"))
                .isInstanceOf(BidConflictException.class);

        verify(bidRepository, never()).save(any());
    }

    @Test
    void placeBid_sellerOnOwnAuction_shouldThrow() {
        PlaceBidRequest request = new PlaceBidRequest();
        request.setAmount(new BigDecimal("1000"));

        when(userRepository.findByEmail("seller@test.com")).thenReturn(Optional.of(seller));
        when(auctionRepository.findByIdWithLock(1L)).thenReturn(Optional.of(activeAuction));

        assertThatThrownBy(() -> bidService.placeBid(1L, request, "seller@test.com"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("own auction");

        verify(bidRepository, never()).save(any());
    }

    @Test
    void placeBid_onEndedAuction_shouldThrow() {
        activeAuction.setEndTime(LocalDateTime.now().minusHours(1));
        activeAuction.setStatus(AuctionStatus.ACTIVE); // Status not yet updated by scheduler

        PlaceBidRequest request = new PlaceBidRequest();
        request.setAmount(new BigDecimal("1000"));

        when(userRepository.findByEmail("bidder@test.com")).thenReturn(Optional.of(bidder));
        when(auctionRepository.findByIdWithLock(1L)).thenReturn(Optional.of(activeAuction));

        assertThatThrownBy(() -> bidService.placeBid(1L, request, "bidder@test.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ended");

        verify(bidRepository, never()).save(any());
    }

    @Test
    void placeBid_onCancelledAuction_shouldThrow() {
        activeAuction.setStatus(AuctionStatus.CANCELLED);

        PlaceBidRequest request = new PlaceBidRequest();
        request.setAmount(new BigDecimal("1000"));

        when(userRepository.findByEmail("bidder@test.com")).thenReturn(Optional.of(bidder));
        when(auctionRepository.findByIdWithLock(1L)).thenReturn(Optional.of(activeAuction));

        assertThatThrownBy(() -> bidService.placeBid(1L, request, "bidder@test.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cancelled");

        verify(bidRepository, never()).save(any());
    }

    @Test
    void placeBid_belowIncrementOnExistingBid_shouldThrow() {
        PlaceBidRequest request = new PlaceBidRequest();
        request.setAmount(new BigDecimal("1050")); // Needs to be at least 1100

        when(userRepository.findByEmail("bidder@test.com")).thenReturn(Optional.of(bidder));
        when(auctionRepository.findByIdWithLock(1L)).thenReturn(Optional.of(activeAuction));
        when(bidRepository.findMaxAmountByAuctionId(1L))
                .thenReturn(Optional.of(new BigDecimal("1000")));

        assertThatThrownBy(() -> bidService.placeBid(1L, request, "bidder@test.com"))
                .isInstanceOf(BidConflictException.class);

        verify(bidRepository, never()).save(any());
    }

    @Test
    void placeBid_onScheduledAuction_shouldThrow() {
        activeAuction.setStartTime(LocalDateTime.now().plusHours(2));
        activeAuction.setStatus(AuctionStatus.SCHEDULED);

        PlaceBidRequest request = new PlaceBidRequest();
        request.setAmount(new BigDecimal("1000"));

        when(userRepository.findByEmail("bidder@test.com")).thenReturn(Optional.of(bidder));
        when(auctionRepository.findByIdWithLock(1L)).thenReturn(Optional.of(activeAuction));

        assertThatThrownBy(() -> bidService.placeBid(1L, request, "bidder@test.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not started");

        verify(bidRepository, never()).save(any());
    }
}
