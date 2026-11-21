package com.bidsphere.entity;

import com.bidsphere.enums.AuctionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "auctions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal startingPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal minimumBidIncrement;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuctionStatus status = AuctionStatus.SCHEDULED;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Bid> bids = new ArrayList<>();

    @OneToOne(mappedBy = "auction", cascade = CascadeType.ALL)
    private AuctionResult auctionResult;

    /**
     * Determines the effective status based on timestamps and persisted state.
     * The persisted status takes precedence for CANCELLED.
     * Otherwise, derive from timestamps.
     */
    public AuctionStatus computeStatus() {
        if (this.status == AuctionStatus.CANCELLED) {
            return AuctionStatus.CANCELLED;
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(startTime)) {
            return AuctionStatus.SCHEDULED;
        } else if (now.isAfter(endTime)) {
            return AuctionStatus.ENDED;
        } else {
            return AuctionStatus.ACTIVE;
        }
    }

    public boolean isAcceptingBids() {
        return computeStatus() == AuctionStatus.ACTIVE;
    }
}
