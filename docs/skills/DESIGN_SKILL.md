# DESIGN_SKILL — Design system 3D / dark

Système visuel PlantVerde. Factuel, à jour.

## Principe
Interface **full dark** avec fond Three.js animé (particules, anneaux toroïdaux, icosaèdres wireframe). Le fond est initialisé **une seule fois** dans `AppComponent.ngOnInit()` via `ThreeBackgroundService`.

## Fichier central : `frontend/src/styles.css`
Contient tout le design system :
- **Variables CSS / Design Tokens** :
  * `--pv-bg`: `#071410` (Fond principal)
  * `--pv-green-400/500/600`: Nuances vert accent et CTA.
  * `--pv-text-primary`: `#ffffff` (Texte principal)
  * `--pv-text-secondary`: `rgba(255, 255, 255, 0.68)` (Texte secondaire, conforme contraste WCAG AA 4.5:1)
  * `--pv-text-muted`: `rgba(255, 255, 255, 0.48)` (Placeholders, labels secondaires)
  * `--pv-danger`: `#f87171` (Erreurs, avertissements critiques)
  * `--pv-warning`: `#fbbf24` (Alertes)
- **Mise en page** :
  * `.pv-page-container`: Largeur maximale standardisée de `1200px` centrée pour les pages générales.
  * `.pv-page-container-sm`: Largeur maximale standardisée de `600px` centrée pour les formulaires restreints (auth, profile).
  * `.pv-form-grid`: Grille réactive à 2 colonnes basculant à 1 colonne sur mobile (`max-width: 640px`).
- **Composants Reutilisables** :
  * `.pv-btn-primary`, `.pv-btn-secondary`, `.pv-btn-ghost`, `.pv-btn-danger`
  * `.pv-form-label`, `.pv-input-error-msg`
  * `.pv-shimmer`: Squelette de chargement uniforme.
  * `.pv-card`: Carte 3D avec effet hover et perspective.

## i18n & RTL (Arabe)
Pour assurer le support de l'Arabe sans casser la mise en page, n'utilisez **jamais** de propriétés CSS physiques directionnelles. Utilisez à la place les classes logiques natives de Tailwind CSS 3 :
- Marge interne : `ps-4` (padding-inline-start) / `pe-4` (padding-inline-end)
- Marge externe : `ms-2` (margin-inline-start) / `me-2` (margin-inline-end)
- Alignement du texte : `text-start` / `text-end`
- Positionnement absolu : `start-4` / `end-4`

Toutes les chaînes de caractères affichées doivent obligatoirement passer par l'injection de l'objet de traduction : `{{ t.cle_traduction }}` issu de `I18nService`.

