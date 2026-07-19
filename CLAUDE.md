# CLAUDE.md — Contexte du projet PlantVerde

Ce fichier est lu automatiquement par Claude Code à chaque session.
Il décrit la structure complète et les conventions du projet.

---

## Documentation détaillée (`docs/skills/`)

Fiches de contexte par couche, factuelles et concises :

- [BACKEND_SKILL](docs/skills/BACKEND_SKILL.md) — Spring Boot : couches, conventions, sécurité, DTO, profils.
- [FRONTEND_SKILL](docs/skills/FRONTEND_SKILL.md) — Angular 19 : standalone, signals, services, i18n, intercepteur, guards.
- [DATABASE_SKILL](docs/skills/DATABASE_SKILL.md) — PostgreSQL : 9 entités, relations, contraintes, requêtes.
- [DESIGN_SKILL](docs/skills/DESIGN_SKILL.md) — design system dark/3D, palette `pv-*`, Three.js, RTL.

> Évolutions intégrées non encore reflétées dans l'arborescence ci-dessous :
> entité/feature **Review** (`/reviews`), **i18n FR/EN/AR + RTL** (`i18n.service.ts`),
> écran **admin catégories**, **DTO** d'entrée/sortie (`UserResponse`, `*Request`),
> **`UserService`**, **`RateLimitFilter`**, gestion des secrets par **`.env`** + profil **`prod`**.

---

## Projet
Boutique de plantes en ligne — Angular 19 + Spring Boot 3 + PostgreSQL + JWT HttpOnly cookies.

---

## Stack technique

| Couche       | Technologie                                          |
|--------------|------------------------------------------------------|
| Frontend     | Angular 19, standalone components, Tailwind CSS 3, PrimeNG 17 |
| Backend      | Spring Boot 3.2, Java 17, Spring Security, JPA/Hibernate |
| Base données | PostgreSQL 16                                        |
| Auth         | JWT HMAC-SHA256 — access token (15min) + refresh token (7j) en cookies HttpOnly SameSite=Strict |
| Conteneurs   | Docker Compose (postgres + backend + frontend/nginx) |


---

## UI/UX 3D — Design System

### Principe
Interface **full dark** avec fond Three.js animé (particules, anneaux toroïdaux, icosaèdres wireframe).
Le fond est initialisé une seule fois dans `AppComponent.ngOnInit()` via `ThreeBackgroundService`.

### Fichier principal : `src/styles.css`
Contient l'intégralité du design system :
- Variables CSS `--pv-*` (couleurs, backgrounds)
- Classes utilitaires : `.pv-card`, `.pv-btn-primary`, `.pv-btn-ghost`, `.pv-glass-card`
- Classes sections : `.pv-section-label`, `.pv-section-title`, `.pv-section-sub`
- Classes tags : `.pv-tag-facile`, `.pv-tag-moyen`, `.pv-diff-difficile`
- Classes infos : `.pv-info-tag-green`, `.pv-info-tag-blue`, `.pv-info-tag-amber`
- Classes admin KPI : `.pv-kpi-card`, `.pv-kpi-icon`, `.pv-kpi-value`
- Classes badges : `.pv-badge-new`, `.pv-badge-hot`, `.pv-badge-promo`
- Overrides PrimeNG complets pour thème sombre

### Three.js background
- Script CDN chargé dans `index.html` : Three.js r128
- Canvas `#pv-canvas` (position:fixed, z-index:0) dans `app.component.ts`
- Div `#pv-cursor-glow` pour l'effet de halo souris
- Service `ThreeBackgroundService` gère l'animation (particules, anneaux, caméra parallaxe)

### Palette couleurs
```
Fond principal   : #071410
Vert accent      : #4ade80 (interactions, prix, succès)
Vert CTA         : gradient(#16a34a → #22c55e)
Texte principal  : #ffffff
Texte secondaire : rgba(255,255,255,0.55)
Cards background : rgba(255,255,255,0.04)
Borders          : rgba(255,255,255,0.08)
Borders hover    : rgba(74,222,128,0.35)
```

### Effets 3D clés
- **Plant cards** : `hover → translateY(-12px) rotateX(4deg)` avec `transform-style:preserve-3d`
- **Bouton +** sur les cards : opacity 0 → 1 au hover
- **Hero plant** : animation `pv-float` (translateY 0→-16px en loop)
- **Catégories** : radial glow vert au hover
- **Navbar** : glassmorphisme `backdrop-filter:blur(24px)` + `background:rgba(7,20,16,0.75)`
---

## Structure complète des fichiers

```
plantverde/
├── CLAUDE.md                          ← ce fichier
├── README.md
├── docker-compose.yml
│
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/plantverde/
│       ├── PlantVerdeApplication.java
│       ├── config/
│       │   ├── DataInitializer.java       ← seed 15 plantes, 5 catégories, 3 comptes
│       │   ├── SecurityConfig.java        ← CORS, routes publiques/protégées, SessionStateless
│       │   └── TokenCleanupScheduler.java ← nettoyage nuit des refresh tokens expirés
│       ├── controller/
│       │   ├── AuthController.java        ← /auth/login, /register, /refresh, /logout
│       │   ├── PlantController.java       ← GET public + CRUD admin
│       │   ├── CategoryController.java
│       │   ├── CartController.java        ← CLIENT uniquement
│       │   ├── OrderController.java       ← CLIENT (ses commandes) + ADMIN (toutes)
│       │   ├── WishlistController.java
│       │   ├── UserController.java        ← /users/me (client) + /users (admin)
│       │   └── AdminStatsController.java  ← /admin/stats — dashboard KPIs
│       ├── dto/
│       │   ├── request/LoginRequest.java
│       │   ├── request/RegisterRequest.java
│       │   └── response/AuthResponse.java
│       ├── entity/
│       │   ├── User.java                  ← roles: ADMIN, CLIENT
│       │   ├── RefreshToken.java          ← JTI stocké en BDD pour révocation
│       │   ├── Plant.java                 ← prix, stock, difficultyLevel, discountPercent
│       │   ├── Category.java
│       │   ├── Order.java                 ← statuts: PENDING→CONFIRMED→SHIPPED→DELIVERED|CANCELLED
│       │   ├── OrderItem.java             ← snapshot prix unitaire au moment de la commande
│       │   ├── CartItem.java              ← unique(user, plant)
│       │   └── WishlistItem.java          ← unique(user, plant)
│       ├── exception/
│       │   ├── BusinessException.java
│       │   ├── ResourceNotFoundException.java
│       │   └── GlobalExceptionHandler.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── RefreshTokenRepository.java ← revokeAllByUser, deleteExpiredAndRevoked
│       │   ├── PlantRepository.java        ← searchPlants() JPQL avec filtres dynamiques
│       │   ├── CategoryRepository.java
│       │   ├── OrderRepository.java        ← getTotalRevenue, getDailySales, findTopSelling
│       │   ├── CartItemRepository.java
│       │   └── WishlistItemRepository.java
│       ├── security/
│       │   ├── JwtService.java             ← clés séparées access/refresh, JTI UUID
│       │   ├── JwtAuthFilter.java          ← lit access_token depuis cookie HttpOnly
│       │   ├── CookieService.java          ← Set-Cookie avec SameSite=Strict manuel
│       │   └── UserDetailsServiceImpl.java
│       └── service/impl/
│           ├── AuthService.java            ← login, register, refresh (rotation), logout
│           ├── PlantService.java
│           ├── CartService.java
│           └── OrderService.java           ← placeOrder() décrémente stock atomiquement
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf                         ← SPA fallback + proxy /api → backend:8080
    ├── proxy.conf.json                    ← dev: proxy localhost:4200 → localhost:8080
    ├── angular.json
    ├── tailwind.config.js                 ← couleurs primary (vert) + earth (brun)
    ├── tsconfig.json
    └── src/
        ├── index.html
        ├── main.ts
        ├── styles.css                     ← Tailwind + PrimeNG theme lara-light-green
        └── app/
            ├── app.component.ts           ← template inline (root, charge panier au init)
            ├── app.config.ts              ← provideRouter, provideHttpClient, provideAnimationsAsync
            ├── app.routes.ts              ← lazy loading sur toutes les routes
            ├── core/
            │   ├── guards/
            │   │   └── auth.guard.ts      ← authGuard, adminGuard, guestGuard
            │   ├── interceptors/
            │   │   └── auth.interceptor.ts ← withCredentials + auto-refresh sur 401 avec file d'attente
            │   ├── models/
            │   │   └── models.ts          ← toutes les interfaces TypeScript du projet
            │   └── services/
            │       ├── auth.service.ts    ← signal currentUser, isLoggedIn, isAdmin
            │       ├── plant-cart.service.ts ← PlantService + CartService (signal count/items/total)
            │       ├── order-wishlist.service.ts ← OrderService + WishlistService
            │       └── category.service.ts
            ├── features/
            │   ├── home/
            │   │   ├── home.component.ts
            │   │   └── home.component.html   ← hero, stats, catégories, plantes vedettes, CTA
            │   ├── auth/
            │   │   ├── login/
            │   │   │   ├── login.component.ts
            │   │   │   └── login.component.html
            │   │   └── register/
            │   │       ├── register.component.ts
            │   │       └── register.component.html
            │   ├── catalogue/
            │   │   ├── catalogue/
            │   │   │   ├── catalogue.component.ts  ← filtres réactifs debounce, pagination
            │   │   │   └── catalogue.component.html
            │   │   └── plant-detail/
            │   │       ├── plant-detail.component.ts ← quantité, ajout panier, wishlist toggle
            │   │       └── plant-detail.component.html
            │   ├── cart/
            │   │   ├── cart.component.ts
            │   │   └── cart.component.html         ← quantités modifiables, résumé sticky
            │   ├── checkout/
            │   │   ├── checkout.component.ts
            │   │   └── checkout.component.html     ← formulaire livraison + récap, page succès
            │   ├── orders/
            │   │   ├── orders.component.ts         ← barre progression statut
            │   │   └── orders.component.html
            │   ├── wishlist/
            │   │   ├── wishlist.component.ts
            │   │   └── wishlist.component.html
            │   ├── profile/
            │   │   ├── profile.component.ts
            │   │   └── profile.component.html
            │   └── admin/
            │       ├── dashboard/
            │       │   ├── dashboard.component.ts  ← KPIs, graphique ventes, top plantes, alertes stock
            │       │   └── dashboard.component.html
            │       ├── plants/
            │       │   ├── admin-plants.component.ts  ← DataTable + Dialog CRUD
            │       │   └── admin-plants.component.html
            │       ├── orders/
            │       │   ├── admin-orders.component.ts  ← expand row, changement statut dropdown
            │       │   └── admin-orders.component.html
            │       └── users/
            │           ├── admin-users.component.ts   ← activer/désactiver comptes
            │           └── admin-users.component.html
            └── shared/
                └── components/
                    ├── header/
                    │   ├── header.component.ts
                    │   └── header.component.html   ← nav responsive, badge panier, menu user
                    └── footer/
                        ├── footer.component.ts
                        └── footer.component.html
```

---

## Conventions de code

### Angular
- Composants **standalone** UNIQUEMENT — pas de NgModule
- **Signals Angular 19** pour l'état : `signal()`, `computed()`, `.update()`
- Syntaxe **Control Flow** : `@if`, `@for`, `@else` (Angular 17+)
- **templateUrl + fichier .html séparé** pour tous les composants (sauf app.component.ts)
- Services injectés via constructeur avec `private`/`public`
- `withCredentials: true` géré globalement par `authInterceptor`
- Lazy loading sur toutes les routes via `loadComponent`

### Spring Boot
- **Records Java** pour DTOs (`LoginRequest`, `RegisterRequest`, `AuthResponse`)
- `@Transactional(readOnly = true)` par défaut sur les services, `@Transactional` sur les mutations
- `@PreAuthorize("hasRole('ADMIN')")` sur les endpoints sensibles
- **Lombok** : `@RequiredArgsConstructor` (pas de `@Autowired`)
- Soft delete sur les plantes (`active = false`)
- Snapshot du prix unitaire dans `OrderItem` (prix au moment de la commande)

---

## Sécurité JWT — points clés

```
Access Token  : 15 min  | Cookie HttpOnly | Path=/          | Clé dédiée
Refresh Token : 7 jours | Cookie HttpOnly | Path=/api/auth/refresh | Clé dédiée ≠
```

- JTI (UUID) de chaque refresh token **stocké en BDD** → permet révocation individuelle
- **Rotation** : à chaque refresh, l'ancien token est révoqué, un nouveau est émis
- **Détection de réutilisation** : token révoqué réutilisé → révocation totale de la session
- `TokenCleanupScheduler` : nettoyage chaque nuit à 2h des tokens expirés/révoqués
- SameSite=Strict positionné manuellement dans le header `Set-Cookie` (Spring Boot limitation)

---

## Données initiales (DataInitializer)

Créées au **premier démarrage** uniquement (`if (userRepository.count() > 0) return`).

| Type       | Contenu                                              |
|------------|------------------------------------------------------|
| Comptes    | admin@plantverde.dz / admin123 · karim@test.dz / client123 · amira@test.dz / client123 |
| Catégories | Intérieur, Extérieur, Succulentes & Cactus, Aromatiques, Tropicales |
| Plantes    | 15 plantes avec descriptions, prix DZD, conseils d'entretien |

---

## Ports

| Service    | URL                                       |
|------------|-------------------------------------------|
| Frontend   | http://localhost:4200 (dev) / http://localhost (Docker) |
| Backend    | http://localhost:8080/api                 |
| Swagger UI | http://localhost:8080/api/swagger-ui.html |
| PostgreSQL | localhost:5432                            |

---

## Commandes utiles

```bash
# Développement local
cd backend  && ./mvnw spring-boot:run
cd frontend && npm install && npm start

# Docker (tout en un)
docker compose up --build -d
docker compose logs -f backend

# Reset BDD (recrée les données initiales)
docker compose down -v && docker compose up -d
```

---

## API Endpoints résumé

| Méthode | Endpoint                  | Accès        |
|---------|---------------------------|--------------|
| POST    | /auth/login               | Public       |
| POST    | /auth/register            | Public       |
| POST    | /auth/refresh             | Cookie       |
| POST    | /auth/logout              | Authentifié  |
| GET     | /plants                   | Public       |
| GET     | /plants/{id}              | Public       |
| POST    | /plants                   | ADMIN        |
| PUT     | /plants/{id}              | ADMIN        |
| DELETE  | /plants/{id}              | ADMIN        |
| GET     | /categories               | Public       |
| GET     | /cart                     | CLIENT       |
| POST    | /cart/{plantId}           | CLIENT       |
| PUT     | /cart/{plantId}           | CLIENT       |
| DELETE  | /cart/{plantId}           | CLIENT       |
| POST    | /orders                   | CLIENT       |
| GET     | /orders/my                | CLIENT       |
| GET     | /orders                   | ADMIN        |
| PATCH   | /orders/{id}/status       | ADMIN        |
| POST    | /orders/{id}/cancel       | CLIENT       |
| GET     | /wishlist                 | Authentifié  |
| POST    | /wishlist/{plantId}       | Authentifié  |
| DELETE  | /wishlist/{plantId}       | Authentifié  |
| GET     | /users/me                 | Authentifié  |
| PUT     | /users/me                 | Authentifié  |
| GET     | /users                    | ADMIN        |
| PATCH   | /users/{id}/toggle        | ADMIN        |
| GET     | /admin/stats              | ADMIN        |
