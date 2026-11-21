package com.bidsphere.repository;

import com.bidsphere.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    @Query("SELECT b FROM Bid b WHERE b.auction.id = :auctionId ORDER BY b.amount DESC, b.createdAt ASC")
    List<Bid> findByAuctionIdOrderByAmountDesc(@Param("auctionId") Long auctionId);

    @Query("SELECT b FROM Bid b WHERE b.auction.id = :auctionId ORDER BY b.createdAt DESC")
    List<Bid> findByAuctionIdOrderByCreatedAtDesc(@Param("auctionId") Long auctionId);

    @Query("SELECT b FROM Bid b WHERE b.auction.id = :auctionId ORDER BY b.amount DESC LIMIT 1")
    Optional<Bid> findTopBidByAuctionId(@Param("auctionId") Long auctionId);

    @Query("SELECT MAX(b.amount) FROM Bid b WHERE b.auction.id = :auctionId")
    Optional<BigDecimal> findMaxAmountByAuctionId(@Param("auctionId") Long auctionId);

    @Query("SELECT COUNT(b) FROM Bid b WHERE b.auction.id = :auctionId")
    long countByAuctionId(@Param("auctionId") Long auctionId);

    @Query("SELECT b FROM Bid b WHERE b.bidder.id = :bidderId ORDER BY b.createdAt DESC")
    List<Bid> findByBidderIdOrderByCreatedAtDesc(@Param("bidderId") Long bidderId);

    @Query("SELECT MAX(b.amount) FROM Bid b WHERE b.auction.id = :auctionId AND b.bidder.id = :bidderId")
    Optional<BigDecimal> findMaxAmountByAuctionIdAndBidderId(
            @Param("auctionId") Long auctionId,
            @Param("bidderId") Long bidderId);
}
