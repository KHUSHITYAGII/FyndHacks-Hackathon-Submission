# Results: QuickCart Checkout

Run date: 21 Nov 2026. Browser: Chromium (headless) via Playwright, Linux. App opened from `file://`.

## Automated suite

| # | Test | Result |
|---|---|---|
| 1 | Successful checkout shows confirmation with reference | PASS |
| 2 | Blank name blocks checkout, keeps cart | PASS |
| 3 | Quantity change updates exact totals | PASS |
| 4 | Empty cart blocks checkout (extra) | PASS |
| 5 | Double-click produces one confirmation (extra) | PASS |

5/5 passed in each of 3 consecutive runs (about 4 s per run, 1 worker, no retries).

One issue was found in **my own test code** while building it: the locator `getByLabel('Quantity of Wireless Mouse')` also matched the +/- buttons (their labels contain the same words), so it could not resolve to one element. Fixed by using `getByRole('spinbutton', { name: ... })`. This was a test defect, not an application defect.

## Manual / exploratory checks

These two were executed through a scripted browser (`evidence/capture.js`) so the output is reproducible; the steps are identical to what a person would do by hand. Repeat them in your own browser before submitting if you want the evidence to be a true manual run.

### M1: Empty cart
- **Steps:** open page, leave cart empty, enter "Asha Verma", click Place Order.
- **Expected:** blocked with clear message, name kept.
- **Actual:** message "Your cart is empty. Add at least one item to check out." shown; no confirmation; name still "Asha Verma".
- **Result:** PASS. Evidence: `evidence/M1-empty-cart.png`

### M3: Blank name with items in cart
- **Steps:** add Mechanical Keyboard, leave name empty, click Place Order.
- **Expected:** blocked with a clear message, cart kept.
- **Actual:** "Please enter your full name to place the order." shown, no confirmation, order total still $60.00.
- **Result:** PASS. Evidence: `evidence/M3-blank-name.png`

### M2: Rapid double-click
- **M2a** (real double-click, Playwright `dblclick`): 1 confirmation, reference `ORD-AT4HAC`. PASS. Evidence: `evidence/M2a-double-click.png`
- **M2b** (harsher: 5 `click()` calls in the same JS tick, faster than a human): 1 confirmation, 1 reference `ORD-FCJJG3`. PASS. Evidence: `evidence/M2b-rapid-5-clicks.png`
- Raw data: `evidence/observations.json`

## Defects
**None found in the application.** No defect has been reported because none was observed.

## Limitations (honest notes)
- Only Chromium was tested; Firefox/WebKit not run.
- TC-06 to TC-08 are listed in the plan but were not executed or recorded in this run.
- The double-click guard was verified from the customer's side (one confirmation). Because there is no backend, "one order" can only be observed as one confirmation and one reference.
