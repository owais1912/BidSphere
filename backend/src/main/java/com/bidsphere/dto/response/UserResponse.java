package com.bidsphere.dto.response;

import com.bidsphere.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private UserRole role;
    private boolean enabled;
    private LocalDateTime createdAt;
}
