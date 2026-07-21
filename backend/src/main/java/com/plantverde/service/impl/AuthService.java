package com.plantverde.service.impl;

import com.plantverde.dto.request.LoginRequest;
import com.plantverde.dto.request.RegisterRequest;
import com.plantverde.dto.response.AuthResponse;
import com.plantverde.entity.RefreshToken;
import com.plantverde.entity.User;
import com.plantverde.exception.BusinessException;
import com.plantverde.repository.RefreshTokenRepository;
import com.plantverde.repository.UserRepository;
import com.plantverde.security.CookieService;
import com.plantverde.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final CookieService cookieService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SiteSettingsService siteSettingsService;

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Un compte existe déjà avec cet email");
        }

        User user = User.builder()
            .firstName(request.firstName())
            .lastName(request.lastName())
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .phone(request.phone())
            .address(request.address())
            .role(User.Role.CLIENT)
            .enabled(true)
            .build();

        userRepository.save(user);
        issueTokens(user, response, null, null);
        return buildAuthResponse(user, "Inscription réussie");
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response,
                               HttpServletRequest httpRequest) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (DisabledException e) {
            String phone = siteSettingsService.getSettings().getPhoneContact();
            String email = siteSettingsService.getSettings().getEmailContact();
            throw new BusinessException("Désolé, votre compte a été désactivé. Contactez l'admin (" + phone + " / " + email + ") pour le réactiver.");
        } catch (BadCredentialsException e) {
            throw new BusinessException("Email ou mot de passe incorrect");
        }

        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new BusinessException("Utilisateur non trouvé"));

        if (!user.isEnabled()) {
            String phone = siteSettingsService.getSettings().getPhoneContact();
            String email = siteSettingsService.getSettings().getEmailContact();
            throw new BusinessException("Désolé, votre compte a été désactivé. Contactez l'admin (" + phone + " / " + email + ") pour le réactiver.");
        }

        String ip = extractClientIp(httpRequest);
        String ua = httpRequest.getHeader("User-Agent");
        issueTokens(user, response, ip, ua);

        return buildAuthResponse(user, "Connexion réussie");
    }

    /**
     * Bonne pratique : Refresh Token Rotation
     * - Valide le refresh token depuis le cookie
     * - Révoque l'ancien (one-time use)
     * - Émet un nouveau pair access + refresh
     * - Détecte la réutilisation (token déjà révoqué → révoque tout)
     */
    @Transactional
    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = cookieService.read(request, "refresh_token").orElse(null);
        if (refreshToken == null) {
            throw new BusinessException("Refresh token manquant");
        }

        String jti;
        String email;
        try {
            var claims = jwtService.validateRefreshToken(refreshToken);
            jti = claims.getId();
            email = claims.getSubject();
        } catch (Exception e) {
            cookieService.clearAllAuthCookies(response);
            throw new BusinessException("Refresh token invalide ou expiré");
        }

        RefreshToken storedToken = refreshTokenRepository.findByTokenId(jti)
            .orElseThrow(() -> {
                cookieService.clearAllAuthCookies(response);
                return new BusinessException("Refresh token non reconnu");
            });

        // Détection de réutilisation : token déjà révoqué
        if (storedToken.isRevoked()) {
            log.warn("SÉCURITÉ : Tentative de réutilisation du refresh token pour {}", email);
            refreshTokenRepository.revokeAllByUser(storedToken.getUser());
            cookieService.clearAllAuthCookies(response);
            throw new BusinessException("Session compromise. Veuillez vous reconnecter.");
        }

        if (storedToken.isExpired()) {
            cookieService.clearAllAuthCookies(response);
            throw new BusinessException("Session expirée. Veuillez vous reconnecter.");
        }

        // Rotation : révoquer l'ancien token
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        // Émettre une nouvelle paire
        User user = storedToken.getUser();
        issueTokens(user, response, storedToken.getIpAddress(), storedToken.getUserAgent());

        return buildAuthResponse(user, "Token rafraîchi");
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = cookieService.read(request, "refresh_token").orElse(null);
        if (refreshToken != null) {
            try {
                String jti = jwtService.extractJtiFromRefresh(refreshToken);
                refreshTokenRepository.findByTokenId(jti)
                    .ifPresent(t -> {
                        t.setRevoked(true);
                        refreshTokenRepository.save(t);
                    });
            } catch (Exception e) {
                log.debug("Logout : refresh token déjà invalide");
            }
        }
        cookieService.clearAllAuthCookies(response);
    }

    // ==================== Private helpers ====================

    private void issueTokens(User user, HttpServletResponse response, String ip, String ua) {
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole().name());
        JwtService.RefreshTokenData refreshData = jwtService.generateRefreshToken(user.getEmail());

        // Persister le refresh token en BDD
        RefreshToken storedRefresh = RefreshToken.builder()
            .tokenId(refreshData.jti())
            .user(user)
            .expiresAt(refreshData.expiresAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime())
            .revoked(false)
            .ipAddress(ip)
            .userAgent(ua)
            .build();
        refreshTokenRepository.save(storedRefresh);

        // Cookies HttpOnly + SameSite=Strict (+ Secure en prod) — gérés par CookieService
        cookieService.writeAuthCookies(response, accessToken, refreshData.token());
    }

    private String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isEmpty()) ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }

    private AuthResponse buildAuthResponse(User user, String message) {
        return new AuthResponse(
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().name(),
            message
        );
    }
}
