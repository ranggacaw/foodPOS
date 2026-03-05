# pwa-foundation Specification

## Purpose
TBD - created by archiving change add-pwa-foundation. Update Purpose after archive.
## Requirements
### Requirement: Web App Manifest
The system SHALL serve a `manifest.webmanifest` file from the web root that meets the
PWA installability criteria: `name`, `short_name`, `start_url`, `display: standalone`,
`background_color`, `theme_color`, and at least one 192×192 and one 512×512 icon entry.

#### Scenario: Manifest is accessible and valid
- **WHEN** a browser requests `GET /manifest.webmanifest`
- **THEN** the server responds with `Content-Type: application/manifest+json`
- **AND** the JSON contains `name`, `short_name`, `start_url`, `display`, `background_color`,
  `theme_color`, and an `icons` array with at least 192×192 and 512×512 PNG entries

#### Scenario: Lighthouse manifest audit passes
- **WHEN** a Lighthouse PWA audit is run in production (HTTPS)
- **THEN** the manifest check passes with no errors

### Requirement: Service Worker Asset Precaching
The system SHALL register a Workbox-generated service worker that precaches all
Vite-hashed JS/CSS assets on install, ensuring subsequent page loads are served from
cache and are not blocked by network latency.

#### Scenario: Assets are served from cache after first load
- **WHEN** the service worker is installed and a user navigates to the app for a second time
- **THEN** the browser serves the precached JS and CSS assets without network requests

#### Scenario: New deployment invalidates stale cache
- **WHEN** a new build is deployed with updated asset hashes
- **THEN** the new service worker detects the changed precache manifest and updates the cache
- **AND** the user is prompted (or the SW automatically takes over) to reload for the new version

### Requirement: Offline Fallback Page
The system SHALL display a meaningful offline fallback page whenever a user attempts to
navigate to any application route while the device has no network connectivity.

#### Scenario: Navigation while offline shows fallback
- **WHEN** a user navigates to any app route while the device is offline
- **THEN** the service worker intercepts the navigation request and responds with `offline.html`
- **AND** the page informs the user they are offline and that the app will be available when
  connectivity is restored
- **AND** no browser "ERR_INTERNET_DISCONNECTED" error page is shown

#### Scenario: App resumes normally when back online
- **WHEN** the device regains connectivity and the user navigates to any route
- **THEN** the service worker allows the request to pass through to the network
- **AND** the Inertia app loads normally without requiring a manual page refresh

### Requirement: PWA Installability on Android Chrome
The system SHALL satisfy all Chrome PWA installability criteria so that Android Chrome
presents the "Add to Home Screen" install prompt to the user.

#### Scenario: Install prompt appears on Android Chrome (HTTPS)
- **WHEN** an Android Chrome user visits the app over HTTPS and meets the engagement heuristic
- **THEN** the browser fires the `beforeinstallprompt` event
- **AND** the in-app install banner is shown, offering the user the option to install the app

#### Scenario: User accepts the install prompt
- **WHEN** the user taps "Install" in the in-app banner
- **THEN** `prompt()` is called on the deferred `BeforeInstallPromptEvent`
- **AND** the app is added to the Android home screen with the correct icon and name
- **AND** the install banner is hidden after the user responds

#### Scenario: User dismisses the install prompt
- **WHEN** the user taps "Dismiss" in the in-app banner
- **THEN** the banner is hidden for the current session
- **AND** the deferred install event is discarded

### Requirement: PWA Meta Tags in Root Layout
The system SHALL include the required `<meta>` and `<link>` tags in `app.blade.php` to
support mobile browser chrome colour, Apple touch icon, and manifest linkage.

#### Scenario: Root HTML includes required PWA tags
- **WHEN** any page is rendered
- **THEN** the HTML `<head>` contains:
  - `<meta name="theme-color" content="...">` matching the manifest `theme_color`
  - `<link rel="manifest" href="/manifest.webmanifest">`
  - `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`

