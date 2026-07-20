package com.plantverde.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;

/**
 * Centralise l'écriture et la lecture des cookies d'authentification.
 *
 * Bonne pratique :
 * - HttpOnly  → inaccessible depuis JavaScript (protection XSS)
 * - SameSite=Strict → protection CSRF sans token dédié
 * - Secure (activé en prod via app.cookie.secure) → cookie transmis sur HTTPS uniquement
 * - Path restreint pour le refresh token (/api/auth/refresh uniquement)
 * - MaxAge=0 pour effacer (logout)
 *
 * Note : SameSite/Secure ne sont pas supportés par l'API jakarta.servlet.http.Cookie.
 * On construit le header Set-Cookie manuellement.
 */
@Service
public class CookieService {

    private static final String ACCESS_COOKIE  = "access_token";
    private static final String REFRESH_COOKIE = "refresh_token";
    private static final String REFRESH_PATH   = "/api/auth/refresh";
    private static final long ACCESS_MAX_AGE  = 900L;    // 15 minutes
    private static final long REFRESH_MAX_AGE = 604800L; // 7 jours

    private final boolean secure;

    public CookieService(@Value("${app.cookie.secure}") boolean secure) {
        this.secure = secure;
    }

    /**
     * Lit la valeur d'un cookie par son nom (vide si absent).
     */
    public Optional<String> read(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return Optional.empty();
        return Arrays.stream(request.getCookies())
            .filter(c -> name.equals(c.getName()))
            .map(Cookie::getValue)
            .findFirst();
    }

    /**
     * Pose les deux cookies d'auth (access + refresh) après login/register/refresh.
     */
    public void writeAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        response.addHeader("Set-Cookie", build(ACCESS_COOKIE, accessToken, "/", ACCESS_MAX_AGE));
        response.addHeader("Set-Cookie", build(REFRESH_COOKIE, refreshToken, REFRESH_PATH, REFRESH_MAX_AGE));
    }

    /**
     * Efface les deux cookies d'auth (access + refresh).
     * Appelé lors du logout ou d'une session compromise.
     */
    public void clearAllAuthCookies(HttpServletResponse response) {
        // Max-Age=0 = suppression immédiate du cookie
        response.addHeader("Set-Cookie", build(ACCESS_COOKIE, "", "/", 0));
        response.addHeader("Set-Cookie", build(REFRESH_COOKIE, "", REFRESH_PATH, 0));
    }

    private String build(String name, String value, String path, long maxAge) {
        StringBuilder sb = new StringBuilder()
            .append(name).append('=').append(value)
            .append("; Max-Age=").append(maxAge)
            .append("; Path=").append(path)
            .append("; HttpOnly");
        if (secure) {
            sb.append("; SameSite=None; Secure"); // Requis pour les requêtes Cross-Origin (Vercel -> Render)
        } else {
            sb.append("; SameSite=Lax"); // Pour le développement local (localhost HTTP)
        }
        return sb.toString();
    }
}
