## MODIFIED Requirements

### Requirement: Shift Open

The system SHALL allow a Cashier or Admin to open a shift before taking
orders, recording the opening cash amount and locking the session to
that shift for reporting purposes. Every shift SHALL be stamped with the
creating user's `branch_id` at the time of opening.

#### Scenario: Cashier opens a shift successfully

- **WHEN** a Cashier submits an open-shift request with a valid `opening_cash` amount (≥ 0)
- **THEN** a new `Shift` record is created with `status = open`, `opened_at = now()`,
  `user_id = auth user`, and `branch_id = auth user's branch_id`
- **AND** the Cashier is redirected to the POS terminal

#### Scenario: Cashier attempts to open a second shift while one is active

- **WHEN** a Cashier submits an open-shift request while they already have an `open` shift
- **THEN** the system returns a `422 Unprocessable Entity` response
- **AND** no new shift is created
- **AND** an error message is displayed indicating an active shift already exists

### Requirement: Shift Close

The system SHALL allow a Cashier or Admin to close their open shift,
recording the closing cash and optional notes.

#### Scenario: Cashier closes their open shift

- **WHEN** a Cashier submits a close-shift request with a valid `closing_cash` amount (≥ 0)
- **THEN** the shift record is updated: `status = closed`, `closed_at = now()`,
  `closing_cash`, `notes`
- **AND** the Cashier is redirected to the shift summary page

#### Scenario: Cashier attempts to close a shift they do not own

- **WHEN** a Cashier submits a close request for a shift belonging to another user
- **THEN** the system returns a `403 Forbidden` response

#### Scenario: Admin closes any cashier's shift

- **WHEN** an Admin submits a close request for any open shift
- **THEN** the shift is closed successfully regardless of owner

### Requirement: Shift Summary

The system SHALL display a shift summary including all orders processed
during the shift, total revenue, payment method breakdown, and expected
closing cash (opening cash + cash payments).

#### Scenario: Cashier views shift summary

- **WHEN** a Cashier views the detail page for one of their shifts
- **THEN** the system displays: shift open/close times, opening cash, closing cash, notes,
  order count, total revenue, cash/card/QRIS breakdown, and expected closing cash

#### Scenario: Admin views any shift summary

- **WHEN** an Admin views the detail page for any shift
- **THEN** the system displays the full shift summary including cashier name

### Requirement: Shift Order Association

The system SHALL associate every new order with the active shift of the
creating cashier at the time the order is placed.

#### Scenario: Order created during open shift

- **WHEN** a Cashier places an order and they have an open shift
- **THEN** the order's `shift_id` is set to the active shift's `id`

#### Scenario: Order created without an open shift

- **WHEN** a Cashier places an order and they have no open shift
- **THEN** the order is created with `shift_id = null`
- **AND** no error is raised (shift is optional for backward compatibility)
