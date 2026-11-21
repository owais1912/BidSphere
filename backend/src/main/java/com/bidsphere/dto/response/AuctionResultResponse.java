package com.bidsphere.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AuctionResultResponse {
    private Long winnerId;
    private String winnerName;
    private BigDecimal finalAmount;
    private LocalDateTime completedAt;
}
