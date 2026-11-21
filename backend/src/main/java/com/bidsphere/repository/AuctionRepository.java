package com.bidsphere.repository;

import com.bidsphere.entity.Auction;
import com.bidsphere.enums.AuctionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auction a WHERE a.id = :id")
    Optional<Auction> findByIdWithLock(@Param("id") Long id);

    @Query(value = """
        SELECT a FROM Auction a
        JOIN FETCH a.product p
        JOIN FETCH p.category c
        JOIN FETCH p.seller s
        WHERE (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:categoryId IS NULL OR c.id = :categoryId)
        AND (:status IS NULL OR a.status = :status)
        """,
        countQuery = """
        SELECT count(a) FROM Auction a
        JOIN a.product p
        JOIN p.category c
        WHERE (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:categoryId IS NULL OR c.id = :categoryId)
        AND (:status IS NULL OR a.status = :status)
        """)
    Page<Auction> searchAuctions(
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("status") AuctionStatus status,
            Pageable pageable);

    @Query("""
        SELECT a FROM Auction a
        JOIN FETCH a.product p
        JOIN FETCH p.category
        JOIN FETCH p.seller
        WHERE a.status = :status
        ORDER BY a.endTime ASC
        """)
    List<Auction> findFeaturedAuctions(@Param("status") AuctionStatus status, Pageable pageable);

    @Query("""
        SELECT a FROM Auction a
        JOIN FETCH a.product p
        WHERE p.seller.id = :sellerId
        ORDER BY a.createdAt DESC
        """)
    List<Auction> findBySellerIdOrderByCreatedAtDesc(@Param("sellerId") Long sellerId);

    @Query("""
        SELECT DISTINCT a FROM Auction a
        JOIN FETCH a.product p
        JOIN FETCH p.category
        JOIN FETCH p.seller
        JOIN a.bids b
        WHERE b.bidder.id = :bidderId
        ORDER BY a.endTime DESC
        """)
    List<Auction> findAuctionsWithBidsByBidderId(@Param("bidderId") Long bidderId);

    @Query("""
        SELECT a FROM Auction a
        WHERE a.status = :fromStatus
        AND a.endTime < :now
        """)
    List<Auction> findExpiredAuctions(@Param("fromStatus") AuctionStatus fromStatus,
                                      @Param("now") LocalDateTime now);

    @Query("""
        SELECT a FROM Auction a
        WHERE a.status = :fromStatus
        AND a.startTime <= :now
        """)
    List<Auction> findAuctionsToActivate(@Param("fromStatus") AuctionStatus fromStatus,
                                         @Param("now") LocalDateTime now);
}
