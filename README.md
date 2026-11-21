# QuickCart Checkout: Page and Browser Test Suite

QuickCart is a single-page checkout (plain HTML/CSS/JS, no backend) and a Playwright browser test suite.

## What is in the box

| File | Purpose |
|---|---|
| `index.html` | The checkout page: 2 products, cart, required name field, confirmation |
| `tests/checkout.spec.js` | Automated browser tests (3 required checks + 2 extra) |
| `playwright.config.js` | Test runner config |
| `TEST_PLAN.md` | Risk-based test plan and manual test cases |
| `RESULTS.md` | Automated and manual results, defects found (none) |
| `evidence/` | Screenshots and observations from the manual checks |

## Run the app

No build step. Open `index.html` in any browser (double-click it), or serve it:

```bash
npx http-server . -p 8080   # optional, then open http://localhost:8080
```

Products: Wireless Mouse $25.00, Mechanical Keyboard $60.00. Quantity is limited to 1-99.

## Run the browser tests

Requirements: Node.js 18+.

```bash
npm install
npx playwright install chromium     # one-time browser download
npm test                            # headless run
npm run test:headed                 # watch the browser
npm run test:ui                     # Playwright UI mode, step through each test
npm run report                      # open the HTML report after a run
```

If you already have a Chromium/Chrome binary and cannot download one:

```bash
CHROMIUM_PATH=/path/to/chrome npm test
```

On failure Playwright saves a screenshot and a trace under `test-results/`
(open a trace with `npx playwright show-trace <trace.zip>`).

## The automated checks

| # | Test | Customer-visible assertion |
|---|---|---|
| 1 | Successful checkout | Confirmation visible; reference matches `ORD-XXXXXX`; name and total shown |
| 2 | Blank name blocks checkout | Exact error text shown; no confirmation; cart and totals preserved; fixing the name then succeeds |
| 3 | Quantity change | Line totals and order total are exact after typing a quantity, using +, and removing an item |
| 4 | Empty cart (extra) | Cart error shown, no confirmation, typed name preserved |
| 5 | Double-click Place Order (extra) | Exactly one confirmation element and one reference |

Design choices:
- **Clean state:** the app stores nothing (no localStorage/cookies) and Playwright gives each test a new browser context, and `beforeEach` reloads the page and asserts the empty starting state.
- **No fixed waits:** every step uses Playwright web-first assertions (`expect(...).toHaveText`, etc.), which retry until the page shows the expected result.
- **Accessible locators:** buttons and fields are found by role and label, the way a customer would, with `data-testid` used for read-only values such as totals.

## Re-run the manual evidence capture

```bash
node evidence/capture.js
```

This scripts the two manual scenarios (empty cart, rapid double-click) and rewrites the screenshots in `evidence/`. For a true manual check, repeat the steps in `TEST_PLAN.md` by hand in your own browser.

## Behaviour notes

- Validation blocks checkout when the cart is empty and/or the name is blank (whitespace only counts as blank). Both messages can show together.
- A failed validation never clears the cart or the name field.
- After a successful order the form, cart and product buttons are locked and a submit guard is set synchronously, so repeated clicks cannot create a second order.
