package com.bidsphere.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "auction_results")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuctionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false, unique = true)
    private Auction auction;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winning_bid_id")
    private Bid winningBid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private User winner;

    @Column(precision = 12, scale = 2)
    private BigDecimal finalAmount;

    @Column(nullable = false)
    private LocalDateTime completedAt;
}
