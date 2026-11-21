package com.bidsphere.controller;

import com.bidsphere.dto.request.CreateAuctionRequest;
import com.bidsphere.dto.request.PlaceBidRequest;
import com.bidsphere.dto.response.*;
import com.bidsphere.service.AuctionService;
import com.bidsphere.service.BidService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
@Tag(name = "Auctions", description = "Browse, create, and manage auctions")
public class AuctionController {

    private final AuctionService auctionService;
    private final BidService bidService;

    @GetMapping
    @Operation(summary = "Search and browse auctions with filters and pagination")
    public ResponseEntity<PageResponse<AuctionResponse>> searchAuctions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(
                auctionService.searchAuctions(search, categoryId, status, sortBy, page, size));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured active auctions for homepage")
    public ResponseEntity<List<AuctionResponse>> getFeaturedAuctions() {
        return ResponseEntity.ok(auctionService.getFeaturedAuctions());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get auction details by ID")
    public ResponseEntity<AuctionResponse> getAuction(@PathVariable Long id) {
        return ResponseEntity.ok(auctionService.getAuctionById(id));
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new auction listing")
    public ResponseEntity<AuctionResponse> createAuction(
            @Valid @RequestBody CreateAuctionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(auctionService.createAuction(request, userDetails.getUsername()));
    }

    @PostMapping("/{id}/cancel")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cancel an auction (seller only, no bids)")
    public ResponseEntity<AuctionResponse> cancelAuction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(auctionService.cancelAuction(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/accept-bid")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Sell to highest bidder and conclude auction early (seller only)")
    public ResponseEntity<AuctionResponse> acceptBid(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(auctionService.acceptBid(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/bids")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Place a bid on an active auction")
    public ResponseEntity<BidResponse> placeBid(
            @PathVariable Long id,
            @Valid @RequestBody PlaceBidRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bidService.placeBid(id, request, userDetails.getUsername()));
    }

    @GetMapping("/{id}/bids")
    @Operation(summary = "Get bid history for an auction")
    public ResponseEntity<List<BidResponse>> getBids(@PathVariable Long id) {
        return ResponseEntity.ok(bidService.getBidsForAuction(id));
    }
}
