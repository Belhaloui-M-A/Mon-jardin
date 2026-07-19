package com.plantverde.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

/**
 * Bonne pratique JWT :
 * - Access token court (15 min) signé avec clé dédiée
 * - Refresh token long (7j) signé avec une AUTRE clé dédiée
 * - JTI (JWT ID) unique sur chaque refresh token → stocké en BDD pour révocation
 * - Claims minimaux (pas de données sensibles dans le payload)
 */
@Service
@Slf4j
public class JwtService {

    private final SecretKey accessKey;
    private final SecretKey refreshKey;
    private final long accessExpiration;
    private final long refreshExpiration;

    public JwtService(
        @Value("${app.jwt.access-secret}") String accessSecret,
        @Value("${app.jwt.refresh-secret}") String refreshSecret,
        @Value("${app.jwt.access-expiration}") long accessExpiration,
        @Value("${app.jwt.refresh-expiration}") long refreshExpiration
    ) {
        this.accessKey = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
        this.refreshKey = Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    // ==================== ACCESS TOKEN ====================

    public String generateAccessToken(String email, String role) {
        return Jwts.builder()
            .subject(email)
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessExpiration))
            .signWith(accessKey)
            .compact();
    }

    public Claims validateAccessToken(String token) {
        return Jwts.parser()
            .verifyWith(accessKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    // ==================== REFRESH TOKEN ====================

    /**
     * Génère un refresh token avec un JTI (UUID) unique.
     * Le JTI est stocké en BDD pour permettre la révocation.
     */
    public RefreshTokenData generateRefreshToken(String email) {
        String jti = UUID.randomUUID().toString();
        Date expiresAt = new Date(System.currentTimeMillis() + refreshExpiration);

        String token = Jwts.builder()
            .subject(email)
            .id(jti)
            .issuedAt(new Date())
            .expiration(expiresAt)
            .signWith(refreshKey)
            .compact();

        return new RefreshTokenData(token, jti, expiresAt);
    }

    public Claims validateRefreshToken(String token) {
        return Jwts.parser()
            .verifyWith(refreshKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String extractEmailFromAccess(String token) {
        return validateAccessToken(token).getSubject();
    }

    public String extractJtiFromRefresh(String token) {
        return validateRefreshToken(token).getId();
    }

    public long getRefreshExpirationMs() {
        return refreshExpiration;
    }

    public record RefreshTokenData(String token, String jti, Date expiresAt) {}
}
