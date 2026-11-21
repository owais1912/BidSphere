package com.bidsphere.dto.response;

import com.bidsphere.enums.AuctionStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AuctionResponse {
    private Long id;
    private Long productId;
    private String productTitle;
    private String productDescription;
    private String productImageUrl;
    private CategoryResponse category;
    private SellerInfo seller;
    private BigDecimal startingPrice;
    private BigDecimal minimumBidIncrement;
    private BigDecimal currentHighestBid;
    private BigDecimal minimumNextBid;
    private Long bidCount;
    private String currentHighestBidderName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AuctionStatus status;
    private LocalDateTime createdAt;
    private AuctionResultResponse result;

    @Data
    @Builder
    public static class SellerInfo {
        private Long id;
        private String fullName;
    }
}
