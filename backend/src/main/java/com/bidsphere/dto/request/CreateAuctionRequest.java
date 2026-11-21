package com.bidsphere.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateAuctionRequest {

    @NotBlank(message = "Product title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @NotBlank(message = "Product description is required")
    @Size(min = 10, message = "Description must be at least 10 characters")
    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String imageUrl;

    @NotNull(message = "Starting price is required")
    @DecimalMin(value = "0.01", message = "Starting price must be greater than zero")
    private BigDecimal startingPrice;

    @NotNull(message = "Minimum bid increment is required")
    @DecimalMin(value = "0.01", message = "Minimum bid increment must be greater than zero")
    private BigDecimal minimumBidIncrement;

    @NotNull(message = "Auction start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "Auction end time is required")
    private LocalDateTime endTime;
}
