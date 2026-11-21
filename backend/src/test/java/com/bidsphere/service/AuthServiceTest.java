package com.bidsphere.service;

import com.bidsphere.dto.request.RegisterRequest;
import com.bidsphere.dto.response.AuthResponse;
import com.bidsphere.entity.User;
import com.bidsphere.exception.BadRequestException;
import com.bidsphere.repository.UserRepository;
import com.bidsphere.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks private AuthService authService;

    private RegisterRequest validRequest;

    @BeforeEach
    void setup() {
        validRequest = new RegisterRequest();
        validRequest.setFullName("Test User");
        validRequest.setEmail("test@example.com");
        validRequest.setPassword("Password123");
        validRequest.setConfirmPassword("Password123");
    }

    @Test
    void register_withValidRequest_shouldSucceed() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u = User.builder()
                    .id(1L).fullName(u.getFullName())
                    .email(u.getEmail()).passwordHash(u.getPasswordHash())
                    .role(u.getRole()).enabled(true).build();
            return u;
        });
        when(jwtTokenProvider.generateToken(anyString())).thenReturn("test-jwt-token");

        AuthResponse response = authService.register(validRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("test-jwt-token");
        assertThat(response.getUser().getEmail()).isEqualTo("test@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withMismatchedPasswords_shouldThrow() {
        validRequest.setConfirmPassword("WrongPassword");

        assertThatThrownBy(() -> authService.register(validRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Passwords do not match");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_withDuplicateEmail_shouldThrow() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(validRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already registered");

        verify(userRepository, never()).save(any());
    }
}
