package com.bidsphere.controller;

import com.bidsphere.dto.response.AuctionResponse;
import com.bidsphere.dto.response.UserResponse;
import com.bidsphere.enums.AuctionStatus;
import com.bidsphere.repository.AuctionRepository;
import com.bidsphere.repository.UserRepository;
import com.bidsphere.service.AuctionService;
import com.bidsphere.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin", description = "Admin-only management endpoints")
public class AdminController {

    private final UserService userService;
    private final AuctionService auctionService;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final com.bidsphere.service.AuctionSchedulerService auctionSchedulerService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<DashboardStats> getDashboard() {
        long totalUsers = userRepository.count();
        long totalAuctions = auctionRepository.count();
        long activeAuctions = auctionRepository
                .findFeaturedAuctions(AuctionStatus.ACTIVE, PageRequest.of(0, Integer.MAX_VALUE))
                .size();
        long endedAuctions = auctionRepository
                .findExpiredAuctions(AuctionStatus.ACTIVE, java.time.LocalDateTime.now().minusYears(100))
                .size();

        DashboardStats stats = DashboardStats.builder()
                .totalUsers(totalUsers)
                .totalAuctions(totalAuctions)
                .activeAuctions(activeAuctions)
                .endedAuctions(endedAuctions)
                .build();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    @Operation(summary = "Get all registered users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Enable or disable a user account")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean enabled = body.get("enabled");
        if (enabled == null) {
            throw new com.bidsphere.exception.BadRequestException("'enabled' field is required");
        }
        return ResponseEntity.ok(userService.setUserEnabled(id, enabled));
    }

    @GetMapping("/auctions")
    @Operation(summary = "Get all auctions (admin view)")
    public ResponseEntity<List<AuctionResponse>> getAllAuctions() {
        return ResponseEntity.ok(auctionService.searchAuctions(
                null, null, null, "newest", 0, 1000).getContent());
    }

    @PostMapping("/auctions/{id}/remove")
    @Operation(summary = "Remove / cancel an auction listing")
    public ResponseEntity<AuctionResponse> removeAuction(@PathVariable Long id) {
        // Admin can force-cancel any auction
        com.bidsphere.entity.Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new com.bidsphere.exception.ResourceNotFoundException("Auction", id));
        auction.setStatus(AuctionStatus.CANCELLED);
        auctionRepository.save(auction);
        return ResponseEntity.ok(auctionService.getAuctionById(id));
    }

    @PostMapping("/auctions/close-expired")
    @Operation(summary = "Force trigger closing of all expired auctions immediately")
    public ResponseEntity<Map<String, String>> closeExpiredAuctions() {
        auctionSchedulerService.closeExpiredAuctions();
        return ResponseEntity.ok(Map.of("message", "Expired auctions closed and winners finalized"));
    }

    @Data
    @Builder
    public static class DashboardStats {
        private long totalUsers;
        private long totalAuctions;
        private long activeAuctions;
        private long endedAuctions;
    }
}
