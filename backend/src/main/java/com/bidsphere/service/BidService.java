package com.bidsphere.service;

import com.bidsphere.dto.request.PlaceBidRequest;
import com.bidsphere.dto.response.BidResponse;
import com.bidsphere.entity.*;
import com.bidsphere.exception.*;
import com.bidsphere.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    /**
     * Places a bid on an auction with pessimistic locking to prevent race conditions.
     * The auction is locked at the database level so concurrent bids are serialized.
     */
    @Transactional
    public BidResponse placeBid(Long auctionId, PlaceBidRequest request, String bidderEmail) {
        User bidder = userRepository.findByEmail(bidderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Acquire pessimistic write lock on the auction row
        Auction auction = auctionRepository.findByIdWithLock(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction", auctionId));

        // Validate auction is accepting bids (checks current time, not just persisted status)
        if (!auction.isAcceptingBids()) {
            String msg = switch (auction.computeStatus()) {
                case SCHEDULED -> "This auction has not started yet";
                case ENDED -> "This auction has already ended";
                case CANCELLED -> "This auction has been cancelled";
                default -> "This auction is not accepting bids";
            };
            throw new BadRequestException(msg);
        }

        // Seller cannot bid on their own auction
        if (auction.getProduct().getSeller().getId().equals(bidder.getId())) {
            throw new ForbiddenException("You cannot bid on your own auction");
        }

        // Re-read the current highest bid inside the lock
        Optional<BigDecimal> currentHighest = bidRepository.findMaxAmountByAuctionId(auctionId);

        // Compute minimum valid bid
        BigDecimal minBid;
        if (currentHighest.isEmpty()) {
            minBid = auction.getStartingPrice();
        } else {
            minBid = currentHighest.get().add(auction.getMinimumBidIncrement());
        }

        if (request.getAmount().compareTo(minBid) < 0) {
            throw new BidConflictException(
                    "Bid amount must be at least " + minBid +
                    ". The current highest bid has changed — please refresh and try again.");
        }

        Bid bid = Bid.builder()
                .auction(auction)
                .bidder(bidder)
                .amount(request.getAmount())
                .build();

        bidRepository.save(bid);

        return toBidResponse(bid);
    }

    @Transactional(readOnly = true)
    public List<BidResponse> getBidsForAuction(Long auctionId) {
        if (!auctionRepository.existsById(auctionId)) {
            throw new ResourceNotFoundException("Auction", auctionId);
        }
        return bidRepository.findByAuctionIdOrderByCreatedAtDesc(auctionId)
                .stream().map(this::toBidResponse).toList();
    }

    private BidResponse toBidResponse(Bid bid) {
        return BidResponse.builder()
                .id(bid.getId())
                .auctionId(bid.getAuction().getId())
                .bidderId(bid.getBidder().getId())
                .bidderName(maskName(bid.getBidder().getFullName()))
                .amount(bid.getAmount())
                .createdAt(bid.getCreatedAt())
                .build();
    }

    private String maskName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "Anonymous";
        String[] parts = fullName.split(" ");
        if (parts.length == 1) return parts[0].charAt(0) + "***";
        return parts[0] + " " + parts[parts.length - 1].charAt(0) + "***";
    }
}
