# pwa-push-notifications Specification

## Purpose
TBD - created by archiving change add-pwa-advanced. Update Purpose after archive.
## Requirements
### Requirement: Push Notification Subscription
The system SHALL allow authenticated users to opt in to Web Push notifications via an
in-app permission prompt. Push subscriptions SHALL be stored per device in the database.

#### Scenario: User opts in to push notifications
- **WHEN** a user interacts with the in-app "Enable Notifications" prompt and grants browser
  permission
- **THEN** the browser generates a push subscription object (endpoint + keys)
- **AND** the subscription is sent to `POST /push-subscriptions` and stored in the
  `push_subscriptions` table linked to the authenticated user
- **AND** the prompt is hidden and replaced with a "Notifications enabled" confirmation

#### Scenario: User denies browser notification permission
- **WHEN** a user dismisses or denies the browser permission dialog
- **THEN** no subscription is stored
- **AND** the prompt is hidden for the current session
- **AND** no error is shown

#### Scenario: User unsubscribes from push notifications
- **WHEN** a user navigates to their Profile settings and disables notifications
- **THEN** the push subscription record is deleted from the database
- **AND** no further notifications are sent to that device

### Requirement: Push Notification Delivery
The system SHALL deliver Web Push notifications to subscribed users for the following
trigger events: low stock alert, shift start reminder, inventory transfer status update,
and daily sales summary.

#### Scenario: Low stock alert notification
- **WHEN** an ingredient's `quantity_on_hand` falls to or below its `restock_threshold`
  as a result of an order being placed
- **THEN** a push notification is sent to all Admin users subscribed to notifications
  for that branch
- **AND** the notification body names the ingredient and current quantity

#### Scenario: Inventory transfer status notification
- **WHEN** an inventory transfer request is approved or rejected
- **THEN** a push notification is sent to the user who created the transfer request
  (if they have an active push subscription)
- **AND** the notification states the transfer item, quantity, and new status

#### Scenario: Daily sales summary notification
- **WHEN** a scheduled job runs at 23:59 WIB each day
- **THEN** a push notification is sent to all Admin and branch-scoped Admin users
  summarising the day's total revenue and order count for their branch

#### Scenario: Notification shown when app is closed
- **WHEN** a push notification is sent to a device where the app tab is closed
- **THEN** the service worker handles the `push` event and displays the notification
  using the browser's native notification API

### Requirement: Push Notification Service Worker Handler
The system's service worker SHALL handle `push` events and display OS-level notifications
using the `showNotification` API, including the app icon and a click action that opens
the relevant app page.

#### Scenario: Service worker receives and displays a push
- **WHEN** the service worker receives a `push` event with a JSON payload containing
  `title`, `body`, and optional `url`
- **THEN** the service worker calls `self.registration.showNotification(title, { body, icon })`
- **AND** clicking the notification opens or focuses the app at the specified `url`

