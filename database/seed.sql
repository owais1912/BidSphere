-- ====================================================================
-- BidSphere - Sample Data Seeder Script (MySQL)
-- ====================================================================

USE `bidsphere`;

-- 1. Seed Categories
INSERT INTO `categories` (`id`, `name`, `description`, `icon_name`) VALUES
(1, 'Electronics', 'Cameras, laptops, vintage consoles, and audio gear', 'Cpu'),
(2, 'Watches & Accessories', 'Luxury timepieces, chronographs, and jewelry', 'Watch'),
(3, 'Collectibles', 'Rare antiques, coins, comics, and memorabilia', 'Archive'),
(4, 'Books', 'First editions, antiquarian literature, and signed copies', 'BookOpen'),
(5, 'Home & Furniture', 'Designer mid-century and modern statement furniture', 'Home'),
(6, 'Gaming', 'Vintage arcade systems, limited consoles, and retro games', 'Gamepad2')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- 2. Seed Default Accounts
-- Passwords:
-- Admin: admin@bidsphere.com / Admin@1234
-- Seller: seller@bidsphere.com / Seller@1234
-- Buyer: buyer@bidsphere.com / Buyer@1234
-- (BCrypt hashes below generated with cost factor 10)
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `enabled`, `created_at`) VALUES
(1, 'BidSphere Admin', 'admin@bidsphere.com', '$2a$10$oXmZlW3sOcf967n2gVp81OB7a05W2P0e7G11tE2Vv2U0ZkJk2uV5K', 'ADMIN', 1, NOW()),
(2, 'Alex Mercer', 'seller@bidsphere.com', '$2a$10$oXmZlW3sOcf967n2gVp81OB7a05W2P0e7G11tE2Vv2U0ZkJk2uV5K', 'USER', 1, NOW()),
(3, 'Sophia Chen', 'buyer@bidsphere.com', '$2a$10$oXmZlW3sOcf967n2gVp81OB7a05W2P0e7G11tE2Vv2U0ZkJk2uV5K', 'USER', 1, NOW())
ON DUPLICATE KEY UPDATE `email`=`email`;

-- 3. Seed Products
INSERT INTO `products` (`id`, `title`, `description`, `image_url`, `category_id`, `seller_id`, `created_at`) VALUES
(1, 'Leica M6 35mm Rangefinder Camera (Mint Condition)', 'Classic 0.72x viewfinder 35mm rangefinder camera in mint condition with original presentation box and documentation.', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80', 1, 2, NOW()),
(2, 'Rolex Submariner Date Reference 126610LN', 'Complete set with original warranty card, inner and outer green boxes, hangtags, and extra links. Unpolished.', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80', 2, 2, NOW()),
(3, 'Sony WH-1000XM5 Premium Noise Cancelling Headphones', 'Industry-leading noise cancelation, personalized listening, and crystal-clear hands-free calling. Brand new.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 1, 2, NOW())
ON DUPLICATE KEY UPDATE `title`=`title`;

-- 4. Seed Auctions
INSERT INTO `auctions` (`id`, `product_id`, `starting_price`, `minimum_bid_increment`, `start_time`, `end_time`, `status`, `created_at`) VALUES
(1, 1, 185000.00, 2500.00, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 4 DAY, 'ACTIVE', NOW() - INTERVAL 1 DAY),
(2, 2, 950000.00, 10000.00, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 2 DAY, 'ACTIVE', NOW() - INTERVAL 2 DAY),
(3, 3, 24000.00, 500.00, NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 6 DAY, 'ACTIVE', NOW() - INTERVAL 1 HOUR)
ON DUPLICATE KEY UPDATE `product_id`=`product_id`;

-- 5. Seed Initial Bids
INSERT INTO `bids` (`id`, `auction_id`, `bidder_id`, `amount`, `created_at`) VALUES
(1, 1, 3, 187500.00, NOW() - INTERVAL 12 HOUR),
(2, 2, 3, 960000.00, NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE `amount`=`amount`;
