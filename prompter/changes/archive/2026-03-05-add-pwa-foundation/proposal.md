# Change: Add PWA Foundation (Phase 1 of PWA & Branch Epic)

## Why
FoodPOS needs to be installable as a Progressive Web App on Android devices so cashiers and
branch staff can launch it directly from their home screen without a browser URL bar.
This phase lays the essential technical groundwork: a Web App Manifest, a Workbox-powered
service worker for asset caching, and a graceful offline fallback page.

## What Changes
- Add `vite-plugin-pwa` (Workbox integration) as a dev dependency
- Configure `vite.config.js` to register the PWA plugin with a `generateSW` strategy
- Produce a `manifest.webmanifest` (served from `/public`) with app name, icons, theme
  colour, and `display: standalone`
- Generate PWA icon assets in all required sizes (192×192, 512×512, maskable variant)
  under `public/icons/`
- Add `<meta name="theme-color">` and mobile touch-icon `<link>` tags to `resources/views/app.blade.php`
- Implement a static offline fallback HTML page (`public/offline.html`) served by the
  service worker when a navigation request fails due to no network
- Show an in-app **"Install App"** banner (driven by the `beforeinstallprompt` browser event)
  for eligible browsers

## Impact
- Affected specs: `pwa-foundation` (new)
- Affected code:
  - `package.json` — new dev dependency (`vite-plugin-pwa`)
  - `vite.config.js` — PWA plugin configuration
  - `resources/views/app.blade.php` — meta/link tags for PWA
  - `resources/js/app.tsx` — service worker registration hook
  - `resources/js/Components/PwaInstallBanner.tsx` (new component)
  - `public/` — icons, `offline.html`
- **No backend schema changes**; purely frontend/build infrastructure
- Existing POS transaction flow is unaffected

## Pre-implementation Risks
- `vite-plugin-pwa` must be verified for compatibility with Vite 7.x and `laravel-vite-plugin` 2.x before starting
- Service worker cache-busting strategy must align with Vite's content-hashed asset filenames
- HTTPS is required in production for the install prompt; local Laragon dev can use HTTP for
  development testing (install prompt will not show on plain HTTP, but the app will still cache)
