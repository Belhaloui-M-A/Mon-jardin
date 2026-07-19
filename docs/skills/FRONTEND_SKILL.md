# FRONTEND_SKILL — Angular 19

Contexte technique du frontend PlantVerde. Factuel, à jour.

## Pile
Angular 19 (standalone) · Signals · Control Flow (`@if`/`@for`) · Tailwind CSS 3 · PrimeNG 17 · chart.js (via `primeng/chart`) · i18n maison FR/EN/AR (+ RTL).

## Conventions
- Composants **standalone uniquement** (pas de NgModule). Bootstrap via `bootstrapApplication` (`main.ts`).
- État local en **signals** : `signal()`, `computed()`, `.update()`. Pas de RxJS pour l'état UI.
- Templates : `templateUrl` + fichier `.html` séparé (sauf `app.component.ts`).
- `@if` / `@for` / `@else` partout (pas de `*ngIf`/`*ngFor`).
- Lazy loading sur **toutes** les routes (`loadComponent`).
- Injection par constructeur (`private`/`public`).

## Cœur applicatif (`core/`)
- `services/auth.service.ts` : signals `currentUser`, `isLoggedIn`, `isAdmin`, `isClient`. **Aucun token stocké** côté JS ; `sessionStorage` ne garde que les infos d'affichage.
- `interceptors/auth.interceptor.ts` (fonctionnel) : `withCredentials` sur `/api`, refresh silencieux sur 401 avec **file d'attente** anti-cascade.
- `guards/auth.guard.ts` : `authGuard`, `adminGuard`, `guestGuard`.
- `services/plant-cart.service.ts` : `PlantService` + `CartService` (signals `items`, `count` = somme des quantités, `total` — tous `computed`).
- `services/order-wishlist.service.ts` : `OrderService` + `WishlistService` (`toggle`).
- `services/category.service.ts`, `review.service.ts`.
- `services/i18n.service.ts` : `t` (signal de traductions), `currentLang`, `isRtl()` ; effet qui pose `lang`/`dir`/police. Persistance `localStorage`.
- `models/models.ts` : interfaces TS (alignées sur les sorties API), `Page<T>` générique réutilisé partout.

## Fonctionnalités (`features/`)
home · auth (login/register) · catalogue (+ détail) · cart · checkout · orders · wishlist · profile · reviews · admin (dashboard, plants, **categories**, orders, users).

## Communication API
- Toujours via les services `core/services`, jamais d'appel HTTP direct dans les composants.
- `withCredentials` géré globalement par l'intercepteur (cookies HttpOnly).
- La sécurité réelle est **côté serveur** (`@PreAuthorize`) ; les guards ne font que masquer l'UI.

## i18n
- 3 langues : `fr` / `en` / `ar` (RTL). Clés typées dans l'interface `Translations`.
- Le header est câblé i18n ; les écrans **admin** utilisent du français en dur (convention existante).

## Lancer
```bash
cd frontend && npm install && npm start   # proxy /api → :8080
```
