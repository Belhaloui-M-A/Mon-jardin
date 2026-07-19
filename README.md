# 🌿 PlantVerde — Boutique de plantes en ligne

Application full-stack de gestion d'un magasin de plantes avec sécurité JWT robuste.

---

## 🏗️ Stack technique

| Couche      | Technologie                              |
|-------------|------------------------------------------|
| Frontend    | Angular 19, Tailwind CSS, PrimeNG 17     |
| Backend     | Spring Boot 3.2, Java 17, Spring Security |
| Base de données | PostgreSQL 16                        |
| Auth        | JWT (Access + Refresh tokens, HttpOnly cookies) |
| Conteneurs  | Docker Compose                           |

---

## 🚀 Lancement rapide (Docker)

```bash
# 1. Cloner / décompresser le projet
cd plantverde

# 2. Lancer tous les services
docker compose up --build -d

# 3. Accéder à l'application
# Frontend : http://localhost
# Backend API : http://localhost:8080/api
# Swagger UI : http://localhost:8080/api/swagger-ui.html
```

---

## 🖥️ Développement local

### Prérequis
- Java 17+
- Node.js 20+
- PostgreSQL 14+ (ou Docker)

### Backend

```bash
cd backend

# Démarrer PostgreSQL via Docker seulement
docker run -d --name plantverde-db \
  -e POSTGRES_DB=plantverde \
  -e POSTGRES_USER=plantverde \
  -e POSTGRES_PASSWORD=plantverde123 \
  -p 5432:5432 postgres:16-alpine

# Lancer Spring Boot
./mvnw spring-boot:run

# API disponible sur http://localhost:8080/api
```

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement (avec proxy vers backend)
npm start

# Application disponible sur http://localhost:4200
```

---

## 👤 Comptes de test

| Rôle   | Email                    | Mot de passe |
|--------|--------------------------|--------------|
| Admin  | admin@plantverde.dz      | admin123     |
| Client | karim@test.dz            | client123    |
| Client | amira@test.dz            | client123    |

---

## 🔐 Architecture sécurité JWT

```
┌─────────────────────────────────────────────────────────┐
│  LOGIN / REGISTER                                        │
│  POST /api/auth/login                                    │
│  → Access Token (15 min)  → Cookie HttpOnly SameSite    │
│  → Refresh Token (7 jours) → Cookie HttpOnly SameSite   │
│    Path=/api/auth/refresh (restreint !)                  │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │  Requêtes API        │
         │  Cookie access_token │
         │  envoyé automatiquement│
         └───────────┬──────────┘
                     │ 401 Access Token expiré
         ┌───────────▼──────────┐
         │  Auto-Refresh        │
         │  POST /api/auth/refresh │
         │  Cookie refresh_token│
         │  → Rotation : ancien │
         │    révoqué, nouveau  │
         │    émis              │
         └──────────────────────┘
```

### Bonnes pratiques implémentées

- ✅ **HttpOnly cookies** — tokens inaccessibles depuis JavaScript
- ✅ **SameSite=Strict** — protection CSRF sans token CSRF supplémentaire
- ✅ **Refresh Token Rotation** — chaque refresh révoque l'ancien token
- ✅ **Détection de réutilisation** — si token révoqué réutilisé → révocation totale
- ✅ **JTI stocké en BDD** — permet la révocation individuelle et le logout
- ✅ **Path restreint** pour le refresh token (`/api/auth/refresh` uniquement)
- ✅ **Nettoyage automatique** — tâche planifiée supprime tokens expirés
- ✅ **BCrypt strength 12** — hachage robuste des mots de passe
- ✅ **Clés séparées** — access et refresh tokens signés avec des clés différentes

---

## 📁 Structure du projet

```
plantverde/
├── backend/
│   ├── src/main/java/com/plantverde/
│   │   ├── config/          # SecurityConfig, DataInitializer, TokenCleanup
│   │   ├── controller/      # Auth, Plant, Order, Cart, Wishlist, User, Category
│   │   ├── entity/          # User, Plant, Order, CartItem, WishlistItem, RefreshToken
│   │   ├── repository/      # JPA repositories avec queries JPQL
│   │   ├── security/        # JwtService, JwtAuthFilter, CookieService
│   │   ├── service/impl/    # AuthService, PlantService, CartService, OrderService
│   │   └── exception/       # GlobalExceptionHandler, BusinessException
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   └── src/app/
│       ├── core/
│       │   ├── guards/      # authGuard, adminGuard, guestGuard
│       │   ├── interceptors/ # authInterceptor (withCredentials + auto-refresh)
│       │   ├── models/      # Interfaces TypeScript
│       │   └── services/    # AuthService, PlantService, CartService, OrderService...
│       ├── features/
│       │   ├── auth/        # Login, Register
│       │   ├── catalogue/   # Catalogue (filtres), PlantDetail
│       │   ├── cart/        # Panier persistant
│       │   ├── checkout/    # Tunnel de commande
│       │   ├── orders/      # Suivi commandes + barre progression
│       │   ├── wishlist/    # Liste de favoris
│       │   ├── profile/     # Profil utilisateur
│       │   ├── home/        # Page d'accueil
│       │   └── admin/       # Dashboard, Plants CRUD, Orders, Users
│       └── shared/
│           └── components/  # Header, Footer
│
├── docker-compose.yml
└── README.md
```

---

## 🌿 Données initiales (DataInitializer)

Au premier démarrage, les données suivantes sont automatiquement créées :

- **3 comptes** : 1 admin + 2 clients
- **5 catégories** : Intérieur, Extérieur, Succulentes & Cactus, Aromatiques, Tropicales
- **15 plantes** avec descriptions, conseils d'entretien et prix en DA

---

## 📡 API Endpoints principaux

| Méthode | Endpoint                    | Accès   | Description                    |
|---------|-----------------------------|---------|--------------------------------|
| POST    | /auth/login                 | Public  | Connexion                      |
| POST    | /auth/register              | Public  | Inscription                    |
| POST    | /auth/refresh               | Cookie  | Rafraîchir le token            |
| POST    | /auth/logout                | Auth    | Déconnexion + révocation       |
| GET     | /plants                     | Public  | Catalogue avec filtres         |
| GET     | /plants/{id}                | Public  | Détail plante                  |
| POST    | /plants                     | ADMIN   | Créer une plante               |
| GET     | /cart                       | CLIENT  | Voir son panier                |
| POST    | /cart/{plantId}             | CLIENT  | Ajouter au panier              |
| POST    | /orders                     | CLIENT  | Passer une commande            |
| GET     | /orders/my                  | CLIENT  | Mes commandes                  |
| GET     | /orders                     | ADMIN   | Toutes les commandes           |
| PATCH   | /orders/{id}/status         | ADMIN   | Changer le statut              |
| GET     | /admin/stats                | ADMIN   | Dashboard KPIs                 |
| GET     | /wishlist                   | Auth    | Liste de favoris               |

---

## 🔧 Variables d'environnement (production)

```env
DB_URL=jdbc:postgresql://host:5432/plantverde
DB_USERNAME=plantverde
DB_PASSWORD=<mot_de_passe_fort>
JWT_ACCESS_SECRET=<clé_aléatoire_256_bits_minimum>
JWT_REFRESH_SECRET=<autre_clé_aléatoire_256_bits_minimum>
COOKIE_SECURE=true        # true obligatoire en HTTPS
CORS_ORIGINS=https://votre-domaine.dz
```

> ⚠️ **En production** : utilisez des secrets forts (générez-les avec `openssl rand -hex 64`),
> activez HTTPS, et configurez `COOKIE_SECURE=true`.

---

## 📦 Technologies et dépendances clés

### Backend
- `spring-boot-starter-security` — Spring Security
- `jjwt-api 0.12.5` — JWT (HMAC-SHA256)
- `spring-boot-starter-data-jpa` — JPA / Hibernate
- `springdoc-openapi 2.3` — Swagger UI
- `lombok` — Réduction boilerplate

### Frontend
- `@angular/core 19` — Signals, standalone components
- `primeng 17` — DataTable, Dialog, Toast, Dropdown, Chart...
- `tailwindcss 3` — Utility-first CSS
- `rxjs 7.8` — Programmation réactive
