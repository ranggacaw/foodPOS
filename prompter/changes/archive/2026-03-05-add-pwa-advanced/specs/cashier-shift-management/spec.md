## MODIFIED Requirements

### Requirement: Shift Close

The system SHALL allow a Cashier or Admin to close their open shift,
recording the closing cash and optional notes. The system SHALL prevent
shift closure while there are unsynced (pending) transactions in the
client-side offline queue.

#### Scenario: Cashier closes their open shift (online, no pending queue)

- **WHEN** a Cashier submits a close-shift request with a valid `closing_cash` amount (≥ 0)
  and the local offline queue has zero pending orders
- **THEN** the shift record is updated: `status = closed`, `closed_at = now()`,
  `closing_cash`, `notes`
- **AND** the Cashier is redirected to the shift summary page

#### Scenario: Shift close blocked with pending offline orders

- **WHEN** a Cashier attempts to close their shift while the local IndexedDB queue has
  one or more `pending` orders
- **THEN** the close shift button is disabled in the UI
- **AND** a warning message informs the cashier to wait for sync to complete before closing
- **AND** no close request is sent to the server

#### Scenario: Cashier attempts to close a shift they do not own

- **WHEN** a Cashier submits a close request for a shift belonging to another user
- **THEN** the system returns a `403 Forbidden` response

#### Scenario: Admin closes any cashier's shift

- **WHEN** an Admin submits a close request for any open shift
- **THEN** the shift is closed successfully regardless of owner
