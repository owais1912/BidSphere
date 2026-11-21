package com.bidsphere.repository;

import com.bidsphere.entity.AuctionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuctionResultRepository extends JpaRepository<AuctionResult, Long> {
    Optional<AuctionResult> findByAuctionId(Long auctionId);
}
