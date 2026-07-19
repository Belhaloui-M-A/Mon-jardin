package com.plantverde.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Protection anti-brute-force légère (en mémoire) sur les endpoints d'authentification.
 *
 * Limite le nombre de requêtes par IP et par endpoint sur une fenêtre glissante.
 * Suffisant pour un projet mono-instance ; en production multi-instances, préférer
 * une solution distribuée (Redis / Bucket4j).
 *
 * Instancié explicitement dans SecurityConfig (pas de @Component) pour éviter
 * une double exécution via l'auto-enregistrement des filtres Spring Boot.
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int  MAX_REQUESTS = 10;        // par fenêtre
    private static final long WINDOW_MS    = 60_000;    // 1 minute

    private final Map<String, Window> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if (isProtected(request) && !allow(key(request))) {
            response.setStatus(429); // Too Many Requests
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"Trop de tentatives. Réessayez dans une minute.\",\"status\":429}");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private boolean isProtected(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.endsWith("/auth/login") || uri.endsWith("/auth/refresh");
    }

    private String key(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        String ip = (xff != null && !xff.isEmpty()) ? xff.split(",")[0].trim() : request.getRemoteAddr();
        return ip + ":" + request.getRequestURI();
    }

    private boolean allow(String key) {
        long now = System.currentTimeMillis();
        Window window = buckets.compute(key, (k, w) -> {
            if (w == null || now - w.start >= WINDOW_MS) {
                return new Window(now);
            }
            return w;
        });
        return window.count.incrementAndGet() <= MAX_REQUESTS;
    }

    /** Fenêtre de comptage par clé (IP + endpoint). */
    private static final class Window {
        final long start;
        final AtomicInteger count = new AtomicInteger(0);
        Window(long start) { this.start = start; }
    }
}
