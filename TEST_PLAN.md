# Test Plan: QuickCart Checkout

**Scope:** the single checkout page (`index.html`): cart, totals, name validation, order confirmation.
**Out of scope:** payments, backend, persistence, performance, cross-device layout.
**Environment:** Chromium via Playwright (automated); any desktop browser (manual).

## 1. Risk prioritisation

| Priority | Risk | Why it matters | Covered by |
|---|---|---|---|
| P1 | Wrong total shown or charged | Direct money impact, destroys trust | Auto test 3; TC-05 |
| P1 | Duplicate order from double-click | Customer charged/shipped twice | Auto test 5; M2 |
| P1 | Order placed with empty cart | Meaningless or free order | Auto test 4; M1 |
| P1 | No clear confirmation on success | Customer retries, creating duplicates | Auto test 1 |
| P2 | Required field blank accepted | Unfulfillable order | Auto test 2 |
| P2 | Validation wipes cart or typed input | Customer frustration, abandonment | Auto tests 2 and 4 |
| P3 | Invalid quantity (0, negative, blank, huge) | Negative or zero totals | TC-06 |
| P3 | Cart can still be edited after ordering | Confirmation no longer matches cart | TC-07 |
| P3 | Error messages unclear or inaccessible | Customer cannot self-correct | TC-02, TC-03 |

## 2. Test cases

| ID | Type | Steps | Expected |
|---|---|---|---|
| TC-01 | Auto 1 | Add Mouse, enter name, Place Order | One confirmation with `ORD-XXXXXX`, name, total $25.00 |
| TC-02 | Auto 2 | Add Keyboard, name = spaces, Place Order | Name error, no confirmation, cart still $60.00; then valid name succeeds |
| TC-03 | Auto 4 / M1 | Empty cart, enter name, Place Order | Cart error shown, no confirmation, name preserved |
| TC-04 | Auto 5 / M2 | Valid cart + name, double-click Place Order | Exactly one confirmation |
| TC-05 | Auto 3 | Add both items, set Mouse qty 3, press + on Keyboard, remove Mouse | Totals: $85 -> $135 -> $195 -> $120 |
| TC-06 | Manual | Type 0, -5, blank, 150, 2.7 into quantity | Clamped to 1-99 (blank/0/negative become 1, 150 becomes 99, 2.7 becomes 2) |
| TC-07 | Manual | After a successful order, try to change cart or name | All controls disabled |
| TC-08 | Manual | Empty cart AND blank name, Place Order | Both messages shown, focus moves to name |

## 3. Manual tests to execute and record

**M1: Empty cart.** Open page, leave cart empty, type a name, click Place Order. Record the message, whether a confirmation appeared, and whether the name survived.

**M2: Rapid double-click.** Add an item, type a name, double-click Place Order as fast as possible (repeat 5 times, and also try Enter key held down in the name field). Record the number of confirmations and references.

Results are in `RESULTS.md`.

## 4. Exit criteria
All P1/P2 cases pass, no open defect above minor, automated suite green three runs in a row.
