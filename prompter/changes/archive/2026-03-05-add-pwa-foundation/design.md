## Context
FoodPOS is a Laravel 12 + Inertia.js + React + Vite 7 application served from Laragon locally.
The build pipeline uses `laravel-vite-plugin` 2.x and `@vitejs/plugin-react` 4.x.
There is currently no service worker, manifest, or offline support.

## Goals / Non-Goals
- Goals: installable PWA on Android Chrome; Lighthouse PWA score ≥ 90; offline fallback page;
  in-app install banner
- Non-Goals: iOS Safari PWA support; offline transaction queuing (Phase 3); push notifications
  (Phase 3)

## Decisions

### Decision: vite-plugin-pwa with generateSW strategy
Use `vite-plugin-pwa` (Workbox) `generateSW` strategy rather than `injectManifest`.
`generateSW` requires zero manual service worker code for Phase 1 and produces a fully
working precache + runtime cache setup. Custom service worker logic for offline sync
(Phase 3) will require migrating to `injectManifest`; that migration is low-risk since
`vite-plugin-pwa` supports both modes.

Alternatives considered:
- Manual `sw.js` written by hand — more control but more maintenance; premature for Phase 1.
- `injectManifest` from the start — correct final target but adds authoring complexity before
  offline sync scope is confirmed.

### Decision: Icons generated from a single SVG source
A single high-resolution SVG of the FoodPOS logo is used to generate all required PNG sizes
(192×192, 512×512, and a maskable variant with padding). This avoids maintaining multiple
manually cropped images.

### Decision: Service worker registration via vite-plugin-pwa's virtual module
`vite-plugin-pwa` exports a `registerSW` virtual module. Importing and calling `registerSW`
in `resources/js/app.tsx` keeps registration idiomatic and ensures the update flow
(prompt user on new SW version) works out of the box.

### Decision: Offline fallback is a static HTML file, not an Inertia page
Inertia navigation requires JavaScript + a network round-trip to the server. When completely
offline, the server is unreachable, so an Inertia page cannot be rendered. A pre-cached
static `offline.html` file is the correct, spec-compliant pattern for navigation-level
offline fallback.

## Risks / Trade-offs
- `vite-plugin-pwa` + Vite 7 compatibility: verify with `npm install --dry-run` before
  implementation. If incompatible, pin Vite to 6.x or use the manual SW approach.
- HTTPS requirement: `beforeinstallprompt` only fires on HTTPS. In Laragon local dev the
  install prompt will not show (expected). Document this in the install guide.
- Cache invalidation: Vite hashes all asset filenames; Workbox precaches by hash.
  On deploy, the new SW will automatically take over and uncache stale assets.

## Migration Plan
No database changes. Build artefact changes only.
Rollback: remove `vite-plugin-pwa` from `package.json`, revert `vite.config.js`,
remove meta tags from `app.blade.php`. No data loss.

## Open Questions
- What brand colour should be used for `theme_color` in the manifest? (placeholder: `#1d4ed8`)
- Is a custom application logo SVG available, or should a generic food icon be used?
