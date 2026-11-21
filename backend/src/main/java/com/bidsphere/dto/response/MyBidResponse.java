package com.bidsphere.dto.response;

import com.bidsphere.enums.AuctionStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MyBidResponse {
    private Long auctionId;
    private String productTitle;
    private String productImageUrl;
    private BigDecimal myHighestBid;
    private BigDecimal currentHighestBid;
    private AuctionStatus status;
    private LocalDateTime endTime;
    private boolean isLeading;
    private String bidConfidenceStatus;
    private String winnerName;
}
