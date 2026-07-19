package com.plantverde.service;

import com.plantverde.entity.RefreshToken;
import com.plantverde.entity.User;
import com.plantverde.exception.BusinessException;
import com.plantverde.repository.RefreshTokenRepository;
import com.plantverde.repository.UserRepository;
import com.plantverde.security.CookieService;
import com.plantverde.security.JwtService;
import com.plantverde.service.impl.AuthService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Vérifie le cœur sécurité de l'authentification : rotation du refresh token
 * et détection de réutilisation d'un token révoqué.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock CookieService cookieService;
    @Mock JwtService jwtService;
    @Mock AuthenticationManager authenticationManager;
    @Mock HttpServletRequest request;
    @Mock HttpServletResponse response;

    @InjectMocks AuthService authService;

    private RefreshToken storedToken(User user, boolean revoked, LocalDateTime expiresAt) {
        return RefreshToken.builder()
            .tokenId("jti-1").user(user).revoked(revoked).expiresAt(expiresAt)
            .build();
    }

    @Test
    void refresh_revoqueLAncienToken_etEnEmetUnNouveau() {
        User user = User.builder().email("karim@test.dz").role(User.Role.CLIENT).build();
        RefreshToken stored = storedToken(user, false, LocalDateTime.now().plusDays(1));

        Claims claims = mock(Claims.class);
        when(claims.getId()).thenReturn("jti-1");
        when(claims.getSubject()).thenReturn("karim@test.dz");

        when(cookieService.read(request, "refresh_token")).thenReturn(Optional.of("rt"));
        when(jwtService.validateRefreshToken("rt")).thenReturn(claims);
        when(refreshTokenRepository.findByTokenId("jti-1")).thenReturn(Optional.of(stored));
        when(jwtService.generateAccessToken(any(), any())).thenReturn("access");
        when(jwtService.generateRefreshToken(any()))
            .thenReturn(new JwtService.RefreshTokenData("new-rt", "jti-2", new Date(System.currentTimeMillis() + 100000)));

        var result = authService.refresh(request, response);

        assertThat(stored.isRevoked()).isTrue();                  // rotation : ancien révoqué
        verify(refreshTokenRepository, atLeastOnce()).save(any()); // nouveau persisté
        verify(cookieService).writeAuthCookies(eq(response), eq("access"), eq("new-rt"));
        assertThat(result.message()).isEqualTo("Token rafraîchi");
    }

    @Test
    void refresh_tokenDejaRevoque_revoqueToutLaSession() {
        User user = User.builder().email("karim@test.dz").role(User.Role.CLIENT).build();
        RefreshToken revoked = storedToken(user, true, LocalDateTime.now().plusDays(1));

        Claims claims = mock(Claims.class);
        when(claims.getId()).thenReturn("jti-1");
        when(claims.getSubject()).thenReturn("karim@test.dz");

        when(cookieService.read(request, "refresh_token")).thenReturn(Optional.of("rt"));
        when(jwtService.validateRefreshToken("rt")).thenReturn(claims);
        when(refreshTokenRepository.findByTokenId("jti-1")).thenReturn(Optional.of(revoked));

        assertThatThrownBy(() -> authService.refresh(request, response))
            .isInstanceOf(BusinessException.class);

        verify(refreshTokenRepository).revokeAllByUser(user); // révocation totale
        verify(cookieService).clearAllAuthCookies(response);
        verify(jwtService, never()).generateAccessToken(any(), any());
    }

    @Test
    void refresh_sansCookie_echoue() {
        when(cookieService.read(request, "refresh_token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refresh(request, response))
            .isInstanceOf(BusinessException.class);
    }
}
