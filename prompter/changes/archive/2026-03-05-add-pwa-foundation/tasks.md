## 1. Dependency Verification
- [x] 1.1 Verify `vite-plugin-pwa` compatibility with Vite 7.x and `laravel-vite-plugin` 2.x
      (run `npm install vite-plugin-pwa --dry-run` and check peer-dep warnings)

## 2. PWA Assets
- [x] 2.1 Create or source a high-resolution FoodPOS logo SVG for icon generation
- [x] 2.2 Generate `public/icons/icon-192x192.png` (standard Android icon)
- [x] 2.3 Generate `public/icons/icon-512x512.png` (splash screen icon)
- [x] 2.4 Generate `public/icons/icon-maskable-192x192.png` (maskable variant with safe-zone padding)
- [x] 2.5 Generate `public/icons/apple-touch-icon.png` (180×180 for iOS Safari bookmarks)

## 3. Build Configuration
- [x] 3.1 Add `vite-plugin-pwa` to `package.json` devDependencies
- [x] 3.2 Update `vite.config.js` to import and register `VitePWA` with:
      - `registerType: 'autoUpdate'`
      - `manifest` block (name, short_name, start_url, display, theme_color, background_color, icons)
      - `workbox.navigateFallback: '/offline.html'`
      - `workbox.globPatterns` matching Vite-hashed JS/CSS assets
- [x] 3.3 Run `npm run build` and verify the generated `sw.js` and `manifest.webmanifest`
      appear in the `public/build/` or `public/` output

## 4. Blade Layout Updates
- [x] 4.1 Add `<link rel="manifest" href="/build/manifest.webmanifest">` to `<head>` in
      `resources/views/app.blade.php`
      (Note: manifest is emitted to `public/build/` by laravel-vite-plugin; SW scope corrected to `/`)
- [x] 4.2 Add `<meta name="theme-color" content="#1d4ed8">` (or project brand colour)
- [x] 4.3 Add `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`
- [x] 4.4 Add `<meta name="mobile-web-app-capable" content="yes">` and
      `<meta name="apple-mobile-web-app-capable" content="yes">`

## 5. Service Worker Registration
- [x] 5.1 Import `registerSW` from `virtual:pwa-register` in `resources/js/app.tsx`
- [x] 5.2 Call `registerSW({ onNeedRefresh, onOfflineReady })` with appropriate callbacks
- [x] 5.3 Create `public/offline.html` — a standalone HTML page (no JS dependencies)
      informing the user they are offline with the app name and a "Try again" button

## 6. Install Banner Component
- [x] 6.1 Create `resources/js/Components/PwaInstallBanner.tsx`
      - Listen for `beforeinstallprompt` event and store the deferred prompt
      - Render a dismissible banner with "Install App" CTA
      - Call `deferredPrompt.prompt()` on click; hide banner after user choice
- [x] 6.2 Mount `<PwaInstallBanner />` in `AuthenticatedLayout.tsx`

## 7. Verification
- [x] 7.1 Build production assets (`npm run build`) and run a local HTTPS server
- [x] 7.2 Open Chrome DevTools → Application → Manifest: verify all fields present
- [x] 7.3 Open Chrome DevTools → Application → Service Workers: verify SW registered
- [x] 7.4 Disable network in DevTools and navigate to `/pos` — verify `offline.html` appears
- [x] 7.5 Run Lighthouse PWA audit (production build over HTTPS) and confirm score ≥ 90

## Post-Implementation
- [x] Update `AGENTS.md` in the project root to reflect new PWA build infrastructure
      (vite-plugin-pwa dependency, public/icons directory, service worker strategy)
