package com.bidsphere.service;

import com.bidsphere.dto.request.LoginRequest;
import com.bidsphere.dto.request.RegisterRequest;
import com.bidsphere.dto.response.AuthResponse;
import com.bidsphere.dto.response.UserResponse;
import com.bidsphere.entity.User;
import com.bidsphere.enums.UserRole;
import com.bidsphere.exception.BadRequestException;
import com.bidsphere.repository.UserRepository;
import com.bidsphere.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address is already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .enabled(true)
                .build();

        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getEmail());
        return buildAuthResponse(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!user.isEnabled()) {
            throw new DisabledException("Your account has been disabled");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail());
        return buildAuthResponse(token, user);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(UserMapper.toResponse(user))
                .build();
    }

    public static class UserMapper {
        public static UserResponse toResponse(User user) {
            return UserResponse.builder()
                    .id(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .enabled(user.isEnabled())
                    .createdAt(user.getCreatedAt())
                    .build();
        }
    }
}
