package com.bidsphere.service;

import com.bidsphere.entity.*;
import com.bidsphere.enums.AuctionStatus;
import com.bidsphere.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuctionSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(AuctionSchedulerService.class);

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final AuctionResultRepository auctionResultRepository;

    /**
     * Activates SCHEDULED auctions whose start time has passed.
     * Runs every minute.
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void activateScheduledAuctions() {
        LocalDateTime now = LocalDateTime.now();
        List<Auction> toActivate = auctionRepository.findAuctionsToActivate(AuctionStatus.SCHEDULED, now);
        for (Auction auction : toActivate) {
            auction.setStatus(AuctionStatus.ACTIVE);
            auctionRepository.save(auction);
            log.info("Activated auction id={}", auction.getId());
        }
    }

    /**
     * Closes ACTIVE auctions whose end time has passed and determines winners.
     * Runs every minute.
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void closeExpiredAuctions() {
        LocalDateTime now = LocalDateTime.now();
        List<Auction> expired = auctionRepository.findExpiredAuctions(AuctionStatus.ACTIVE, now);
        for (Auction auction : expired) {
            auction.setStatus(AuctionStatus.ENDED);
            auctionRepository.save(auction);
            determineWinner(auction);
            log.info("Closed auction id={}", auction.getId());
        }
    }

    private void determineWinner(Auction auction) {
        // Check if result already recorded
        if (auctionResultRepository.findByAuctionId(auction.getId()).isPresent()) {
            return;
        }

        Optional<Bid> winningBid = bidRepository.findTopBidByAuctionId(auction.getId());
        AuctionResult result;

        if (winningBid.isPresent()) {
            Bid bid = winningBid.get();
            result = AuctionResult.builder()
                    .auction(auction)
                    .winningBid(bid)
                    .winner(bid.getBidder())
                    .finalAmount(bid.getAmount())
                    .completedAt(LocalDateTime.now())
                    .build();
            log.info("Winner for auction {}: user {} with bid {}",
                    auction.getId(), bid.getBidder().getEmail(), bid.getAmount());
        } else {
            // No bids — auction ended without a winner
            result = AuctionResult.builder()
                    .auction(auction)
                    .winningBid(null)
                    .winner(null)
                    .finalAmount(null)
                    .completedAt(LocalDateTime.now())
                    .build();
            log.info("Auction {} ended with no bids", auction.getId());
        }

        auctionResultRepository.save(result);
    }
}
