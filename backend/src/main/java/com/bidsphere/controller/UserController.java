package com.bidsphere.controller;

import com.bidsphere.dto.response.AuctionResponse;
import com.bidsphere.dto.response.MyBidResponse;
import com.bidsphere.dto.response.UserResponse;
import com.bidsphere.service.AuctionService;
import com.bidsphere.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Users", description = "User profile and activity endpoints")
public class UserController {

    private final UserService userService;
    private final AuctionService auctionService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getCurrentUser(userDetails.getUsername()));
    }

    @GetMapping("/me/bids")
    @Operation(summary = "Get all auctions on which current user has bid")
    public ResponseEntity<List<MyBidResponse>> getMyBids(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(auctionService.getMyBids(userDetails.getUsername()));
    }

    @GetMapping("/me/listings")
    @Operation(summary = "Get all auctions created by the current user")
    public ResponseEntity<List<AuctionResponse>> getMyListings(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(auctionService.getMyListings(userDetails.getUsername()));
    }
}
