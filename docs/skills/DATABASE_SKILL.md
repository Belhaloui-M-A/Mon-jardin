# DATABASE_SKILL — PostgreSQL 16

Modèle de données PlantVerde. Factuel, à jour.

## Entités (9)
| Entité | Rôle | Points clés |
|--------|------|-------------|
| `User` | Comptes | `role` ∈ {ADMIN, CLIENT}, `enabled`, email unique. Mot de passe **BCrypt**. |
| `RefreshToken` | Sessions | `tokenId` (JTI/UUID) unique, `revoked`, `expiresAt`, ip/userAgent. Permet rotation + révocation. |
| `Category` | Catégories | `name` unique. `plants` (OneToMany) `@JsonIgnore`. |
| `Plant` | Catalogue | `price`, `stock`, `discountPercent`, `difficultyLevel`, `active` (soft delete). `getFinalPrice()`. Catégorie EAGER. |
| `Order` | Commandes | `status` ∈ {PENDING→CONFIRMED→SHIPPED→DELIVERED, CANCELLED}, `total`, adresse de livraison. |
| `OrderItem` | Lignes | `unitPrice` = **snapshot** du prix à la commande. `getSubtotal()`. |
| `CartItem` | Panier | **unique(user, plant)** → cumul de quantité. |
| `WishlistItem` | Favoris | **unique(user, plant)**. |
| `Review` | Avis | **unique(user, target_type)**, `target_type` ∈ {SERVICE, DELIVERY, QUALITY, OVERALL}, `rating` 1–5, `published` (modération). |

## Relations
- `User` 1—N `RefreshToken`, `Order`, `CartItem`, `WishlistItem`, `Review`.
- `Category` 1—N `Plant`.
- `Order` 1—N `OrderItem` (cascade ALL + orphanRemoval) ; `OrderItem` N—1 `Plant`.

## Conventions JPA
- IDs auto-incrémentés (`IDENTITY`).
- Audit : `@CreatedDate` / `@LastModifiedDate` (`@EnableJpaAuditing`).
- `open-in-view=false` → les collections LAZY ne doivent pas être sérialisées hors transaction (préférer un DTO ou un `JOIN FETCH` si besoin).
- Relations chargées en LAZY sauf `Plant.category` (EAGER).
- Contraintes d'unicité métier portées par `@UniqueConstraint` (cf. tableau).

## Requêtes notables
- `PlantRepository.searchPlants(...)` : filtres dynamiques en **JPQL paramétré** (catégorie, prix, recherche, stock) + tri/pagination.
- `OrderRepository` : `getTotalRevenue`, `getRevenueFrom`, `countPendingOrders`, `findTopSellingPlants`, `getDailySales` (statistiques dashboard).
- `ReviewRepository` : moyenne, distribution, moyenne par cible (stats publiques).

## Schéma / cycle de vie
- Dev : `spring.jpa.hibernate.ddl-auto=update`. Prod : `validate`.
- `DataInitializer` (CommandLineRunner) seed **au premier démarrage seulement** (`if userRepository.count() > 0 return`) : 3 comptes, 5 catégories, 15 plantes.
- Identifiants/lignes BDD : variables d'environnement (`.env`) partagées entre Postgres et le backend (cohérence garantie).
