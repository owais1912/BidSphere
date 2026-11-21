-- ====================================================================
-- BidSphere - Online Auction & Bidding Platform Database Schema
-- Target Database: MySQL 8.0+
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `bidsphere`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `bidsphere`;

-- Disable foreign key checks during table drop/creation
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `auction_results`;
DROP TABLE IF EXISTS `bids`;
DROP TABLE IF EXISTS `auctions`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'USER',
  `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Categories Table
CREATE TABLE `categories` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT NULL,
  `icon_name` VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Products Table
CREATE TABLE `products` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `image_url` VARCHAR(1000) DEFAULT NULL,
  `category_id` BIGINT NOT NULL,
  `seller_id` BIGINT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_product_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Auctions Table
CREATE TABLE `auctions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT NOT NULL UNIQUE,
  `starting_price` DECIMAL(12, 2) NOT NULL,
  `minimum_bid_increment` DECIMAL(10, 2) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_auction_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  INDEX `idx_auction_status` (`status`),
  INDEX `idx_auction_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bids Table
CREATE TABLE `bids` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `auction_id` BIGINT NOT NULL,
  `bidder_id` BIGINT NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bid_auction` FOREIGN KEY (`auction_id`) REFERENCES `auctions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bid_bidder` FOREIGN KEY (`bidder_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_bid_auction` (`auction_id`),
  INDEX `idx_bid_bidder` (`bidder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Auction Results Table
CREATE TABLE `auction_results` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `auction_id` BIGINT NOT NULL UNIQUE,
  `winning_bid_id` BIGINT DEFAULT NULL,
  `winner_id` BIGINT DEFAULT NULL,
  `final_amount` DECIMAL(12, 2) DEFAULT NULL,
  `completed_at` DATETIME NOT NULL,
  CONSTRAINT `fk_result_auction` FOREIGN KEY (`auction_id`) REFERENCES `auctions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_result_bid` FOREIGN KEY (`winning_bid_id`) REFERENCES `bids` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_result_winner` FOREIGN KEY (`winner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
