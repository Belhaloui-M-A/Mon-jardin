# BACKEND_SKILL — Spring Boot 3 / Java 17

Contexte technique du backend PlantVerde. Factuel, à jour.

## Pile
Spring Boot 3.2 · Java 17 · Spring Security · JPA/Hibernate · PostgreSQL · JWT (jjwt 0.12) · Lombok · springdoc-openapi.

## Architecture en couches
```
Controller  →  Service (@Transactional)  →  Repository (JPA)  →  PostgreSQL
     ▲ JwtAuthFilter (lit le cookie access_token) + RateLimitFilter
```
- `@RestControllerAdvice` (`GlobalExceptionHandler`) centralise les erreurs : messages neutres, jamais de stack trace au client.
- DTO **records** : entrée validée (`@Valid`) et sortie séparée pour les données sensibles.

## Conventions
- Lombok `@RequiredArgsConstructor` (injection par constructeur, pas de `@Autowired`).
- Services : `@Transactional(readOnly = true)` par défaut, `@Transactional` sur les mutations.
- `@PreAuthorize("hasRole('ADMIN')")` sur les endpoints sensibles.
- Entrées : DTO records validés (`LoginRequest`, `RegisterRequest`, `UpdateProfileRequest`, `PlantRequest`, `CategoryRequest`, records imbriqués dans les contrôleurs Order/Cart). **Jamais** `@RequestBody Map` ni entité brute (anti mass-assignment).
- Sorties sensibles : DTO dédié — `UserResponse` n'expose **jamais** le hash `password`.
- Lookup utilisateur mutualisé : `UserService.getByEmail(email)` (réutilisé par Cart/Order/Review/Wishlist).
- Soft delete des plantes (`active = false`) pour préserver l'historique des commandes.
- Snapshot du prix unitaire dans `OrderItem` (prix figé à la commande).

## Sécurité (voir aussi SecurityConfig)
- JWT HMAC-SHA256, clés **distinctes** access (15 min) / refresh (7 j).
- Refresh token : JTI (UUID) stocké en BDD → **rotation** + révocation + détection de réutilisation (`AuthService`).
- Cookies **HttpOnly + SameSite=Strict** ; `Secure` activé via `app.cookie.secure` (true en prod). Écriture/lecture centralisées dans `CookieService`.
- `RateLimitFilter` : anti-brute-force (10 req/min/IP) sur `/auth/login` et `/auth/refresh`.
- CORS : origines via env (`app.cors.allowed-origins`), en-têtes restreints, `allowCredentials=true`.
- CSRF désactivé — justifié par l'auth cookie SameSite=Strict.
- BCrypt force 12. Requêtes JPQL **paramétrées** (pas d'injection SQL).

## Configuration / profils
- `application.properties` : valeurs par défaut **dev**.
- `application-prod.properties` (profil `prod`, `SPRING_PROFILES_ACTIVE=prod`) : `cookie.secure=true`, secrets **sans valeur par défaut** (fail-fast), `ddl-auto=validate`, logs `INFO`.
- Secrets : `.env` (non versionné) → injectés par docker-compose. Modèle : `.env.example`.

## Endpoints (résumé)
`/auth/*` (public) · `GET /plants`, `/categories`, `/reviews` (public) · `/cart/**` (CLIENT) · `/orders/**` (auth, contrôle d'appartenance en service) · `/wishlist/**` (CLIENT+ADMIN) · `/admin/**`, CRUD plantes/catégories, `/users` (ADMIN) · `/users/me` (auth).

## Lancer
```bash
cd backend && ./mvnw spring-boot:run          # dev (profil défaut)
docker compose up --build -d                  # stack complète (lit .env)
```
Swagger : http://localhost:8080/api/swagger-ui.html
