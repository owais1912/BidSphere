package com.bidsphere.service;

import com.bidsphere.dto.request.CreateAuctionRequest;
import com.bidsphere.dto.response.*;
import com.bidsphere.entity.*;
import com.bidsphere.enums.AuctionStatus;
import com.bidsphere.exception.*;
import com.bidsphere.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;
    private final AuctionResultRepository auctionResultRepository;

    @Transactional(readOnly = true)
    public PageResponse<AuctionResponse> searchAuctions(
            String search, Long categoryId, String statusStr, String sortBy,
            int page, int size) {

        AuctionStatus status = null;
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                status = AuctionStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Sort sort = switch (sortBy != null ? sortBy : "newest") {
            case "endingSoon" -> Sort.by(Sort.Direction.ASC, "endTime");
            case "priceLow" -> Sort.by(Sort.Direction.ASC, "startingPrice");
            case "priceHigh" -> Sort.by(Sort.Direction.DESC, "startingPrice");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Auction> auctionPage = auctionRepository.searchAuctions(
                (search != null && !search.isBlank()) ? search : null,
                categoryId, status, pageable);

        List<AuctionResponse> content = auctionPage.getContent().stream()
                .map(this::toResponse)
                .toList();

        return PageResponse.<AuctionResponse>builder()
                .content(content)
                .pageNumber(auctionPage.getNumber())
                .pageSize(auctionPage.getSize())
                .totalElements(auctionPage.getTotalElements())
                .totalPages(auctionPage.getTotalPages())
                .last(auctionPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AuctionResponse> getFeaturedAuctions() {
        Pageable pageable = PageRequest.of(0, 8);
        return auctionRepository.findFeaturedAuctions(AuctionStatus.ACTIVE, pageable)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AuctionResponse getAuctionById(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction", id));
        return toResponse(auction);
    }

    @Transactional
    public AuctionResponse createAuction(CreateAuctionRequest request, String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        validateAuctionTimes(request.getStartTime(), request.getEndTime());

        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .category(category)
                .seller(seller)
                .build();

        AuctionStatus initialStatus = request.getStartTime().isAfter(LocalDateTime.now())
                ? AuctionStatus.SCHEDULED
                : AuctionStatus.ACTIVE;

        Auction auction = Auction.builder()
                .product(product)
                .startingPrice(request.getStartingPrice())
                .minimumBidIncrement(request.getMinimumBidIncrement())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(initialStatus)
                .build();

        product.setAuction(auction);
        auction = auctionRepository.save(auction);

        return toResponse(auction);
    }

    @Transactional
    public AuctionResponse cancelAuction(Long id, String sellerEmail) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction", id));

        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!auction.getProduct().getSeller().getId().equals(seller.getId())) {
            throw new ForbiddenException("You can only cancel your own auctions");
        }

        long bidCount = bidRepository.countByAuctionId(id);
        if (bidCount > 0) {
            throw new BadRequestException("Cannot cancel an auction that already has bids");
        }

        if (auction.computeStatus() == AuctionStatus.ENDED || auction.getStatus() == AuctionStatus.CANCELLED) {
            throw new BadRequestException("Auction cannot be cancelled in its current state");
        }

        auction.setStatus(AuctionStatus.CANCELLED);
        auctionRepository.save(auction);
        return toResponse(auction);
    }

    @Transactional
    public AuctionResponse acceptBid(Long id, String sellerEmail) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction", id));

        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!auction.getProduct().getSeller().getId().equals(seller.getId())) {
            throw new ForbiddenException("You can only accept bids on your own auctions");
        }

        if (auction.computeStatus() != AuctionStatus.ACTIVE) {
            throw new BadRequestException("Can only accept bids on an active auction");
        }

        Bid winningBid = bidRepository.findTopBidByAuctionId(id)
                .orElseThrow(() -> new BadRequestException("Cannot sell without any bids placed"));

        // End auction now
        auction.setStatus(AuctionStatus.ENDED);
        auction.setEndTime(LocalDateTime.now());
        auctionRepository.save(auction);

        // Record or update result
        AuctionResult result = auctionResultRepository.findByAuctionId(id)
                .orElseGet(() -> AuctionResult.builder().auction(auction).build());

        result.setWinningBid(winningBid);
        result.setWinner(winningBid.getBidder());
        result.setFinalAmount(winningBid.getAmount());
        result.setCompletedAt(LocalDateTime.now());

        auctionResultRepository.save(result);
        return toResponse(auction);
    }

    @Transactional(readOnly = true)
    public List<AuctionResponse> getMyListings(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return auctionRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MyBidResponse> getMyBids(String bidderEmail) {
        User bidder = userRepository.findByEmail(bidderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Auction> auctions = auctionRepository.findAuctionsWithBidsByBidderId(bidder.getId());
        return auctions.stream().map(auction -> {
            Optional<BigDecimal> myHighestBid = bidRepository
                    .findMaxAmountByAuctionIdAndBidderId(auction.getId(), bidder.getId());
            Optional<BigDecimal> currentHighest = bidRepository
                    .findMaxAmountByAuctionId(auction.getId());

            BigDecimal myBid = myHighestBid.orElse(BigDecimal.ZERO);
            BigDecimal currentBid = currentHighest.orElse(BigDecimal.ZERO);
            boolean isLeading = myBid.compareTo(currentBid) == 0 && myBid.compareTo(BigDecimal.ZERO) > 0;

            AuctionStatus computedStatus = auction.computeStatus();
            String confidenceStatus;
            String winnerName = null;

            if (computedStatus == AuctionStatus.ACTIVE) {
                confidenceStatus = isLeading ? "LEADING" : "OUTBID";
            } else if (computedStatus == AuctionStatus.ENDED) {
                Optional<AuctionResult> resultOpt = auctionResultRepository.findByAuctionId(auction.getId());
                if (resultOpt.isPresent()) {
                    AuctionResult result = resultOpt.get();
                    if (result.getWinner() != null) {
                        winnerName = result.getWinner().getFullName();
                        confidenceStatus = result.getWinner().getId().equals(bidder.getId()) ? "WON" : "LOST";
                    } else {
                        confidenceStatus = "ENDED_NO_WINNER";
                    }
                } else {
                    if (currentBid.compareTo(BigDecimal.ZERO) <= 0) {
                        confidenceStatus = "ENDED_NO_WINNER";
                    } else if (isLeading) {
                        confidenceStatus = "WON";
                        winnerName = bidder.getFullName();
                    } else {
                        confidenceStatus = "LOST";
                    }
                }
            } else if (computedStatus == AuctionStatus.CANCELLED) {
                confidenceStatus = "CANCELLED";
            } else {
                confidenceStatus = "UPCOMING";
            }

            return MyBidResponse.builder()
                    .auctionId(auction.getId())
                    .productTitle(auction.getProduct().getTitle())
                    .productImageUrl(auction.getProduct().getImageUrl())
                    .myHighestBid(myBid)
                    .currentHighestBid(currentBid)
                    .status(computedStatus)
                    .endTime(auction.getEndTime())
                    .isLeading(isLeading)
                    .bidConfidenceStatus(confidenceStatus)
                    .winnerName(winnerName)
                    .build();
        }).toList();
    }

    public AuctionResponse toResponse(Auction auction) {
        Product product = auction.getProduct();
        Category category = product.getCategory();
        User seller = product.getSeller();

        Optional<BigDecimal> highestBid = bidRepository.findMaxAmountByAuctionId(auction.getId());
        long bidCount = bidRepository.countByAuctionId(auction.getId());

        BigDecimal currentHighest = highestBid.orElse(null);
        BigDecimal minNextBid;
        if (currentHighest == null) {
            minNextBid = auction.getStartingPrice();
        } else {
            minNextBid = currentHighest.add(auction.getMinimumBidIncrement());
        }

        String highestBidderName = null;
        if (currentHighest != null) {
            Optional<Bid> topBid = bidRepository.findTopBidByAuctionId(auction.getId());
            highestBidderName = topBid.map(b -> maskName(b.getBidder().getFullName())).orElse(null);
        }

        AuctionResultResponse resultResponse = null;
        AuctionResult ar = auction.getAuctionResult();
        if (ar == null) {
            ar = auctionResultRepository.findByAuctionId(auction.getId()).orElse(null);
        }
        if (ar != null) {
            resultResponse = AuctionResultResponse.builder()
                    .winnerId(ar.getWinner() != null ? ar.getWinner().getId() : null)
                    .winnerName(ar.getWinner() != null ? ar.getWinner().getFullName() : null)
                    .finalAmount(ar.getFinalAmount())
                    .completedAt(ar.getCompletedAt())
                    .build();
        } else if (auction.computeStatus() == AuctionStatus.ENDED) {
            Optional<Bid> topBid = bidRepository.findTopBidByAuctionId(auction.getId());
            resultResponse = AuctionResultResponse.builder()
                    .winnerId(topBid.map(b -> b.getBidder().getId()).orElse(null))
                    .winnerName(topBid.map(b -> b.getBidder().getFullName()).orElse(null))
                    .finalAmount(topBid.map(Bid::getAmount).orElse(null))
                    .completedAt(auction.getEndTime())
                    .build();
        }

        return AuctionResponse.builder()
                .id(auction.getId())
                .productId(product.getId())
                .productTitle(product.getTitle())
                .productDescription(product.getDescription())
                .productImageUrl(product.getImageUrl())
                .category(CategoryResponse.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .description(category.getDescription())
                        .iconName(category.getIconName())
                        .build())
                .seller(AuctionResponse.SellerInfo.builder()
                        .id(seller.getId())
                        .fullName(seller.getFullName())
                        .build())
                .startingPrice(auction.getStartingPrice())
                .minimumBidIncrement(auction.getMinimumBidIncrement())
                .currentHighestBid(currentHighest)
                .minimumNextBid(minNextBid)
                .bidCount(bidCount)
                .currentHighestBidderName(highestBidderName)
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .status(auction.computeStatus())
                .createdAt(auction.getCreatedAt())
                .result(resultResponse)
                .build();
    }

    private String maskName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "Anonymous";
        String[] parts = fullName.split(" ");
        if (parts.length == 1) {
            return parts[0].charAt(0) + "***";
        }
        return parts[0] + " " + parts[parts.length - 1].charAt(0) + "***";
    }

    private void validateAuctionTimes(LocalDateTime startTime, LocalDateTime endTime) {
        if (endTime.isBefore(startTime) || endTime.isEqual(startTime)) {
            throw new BadRequestException("End time must be after start time");
        }
        if (endTime.isBefore(startTime.plusMinutes(30))) {
            throw new BadRequestException("Auction must run for at least 30 minutes");
        }
    }
}
