const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const APP_URL = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

// Every test gets a fresh page (new browser context) and loads the app from scratch.
// The app keeps no storage, so there is no state to leak between tests.
test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.getByTestId('order-total')).toHaveText('$0.00');
  await expect(page.getByTestId('empty-cart-message')).toBeVisible();
});

const name = (page) => page.getByLabel('Full name (required)');
const placeOrder = (page) => page.getByRole('button', { name: 'Place Order' });

// ---------------------------------------------------------------------------
// Required check 1: successful checkout produces a confirmation
// ---------------------------------------------------------------------------
test('successful checkout shows a confirmation with a reference', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Wireless Mouse to cart' }).click();
  await expect(page.getByTestId('order-total')).toHaveText('$25.00');

  await name(page).fill('Asha Verma');
  await placeOrder(page).click();

  const confirmation = page.getByTestId('confirmation');
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toContainText('Order confirmed');
  await expect(page.getByTestId('confirm-name')).toHaveText('Asha Verma');
  await expect(page.getByTestId('order-reference')).toHaveText(/^ORD-[A-Z0-9]{6}$/);
  await expect(page.getByTestId('confirm-total')).toHaveText('$25.00');
});

// ---------------------------------------------------------------------------
// Required check 2: a missing required field blocks checkout
// ---------------------------------------------------------------------------
test('blank name blocks checkout, shows a message and keeps the cart', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Mechanical Keyboard to cart' }).click();
  await name(page).fill('   ');                      // whitespace counts as blank
  await placeOrder(page).click();

  await expect(page.getByTestId('name-error'))
    .toHaveText('Please enter your full name to place the order.');
  await expect(page.getByTestId('confirmation')).toBeHidden();
  // The customer's cart is preserved
  await expect(page.getByTestId('line-total-keyboard')).toHaveText('$60.00');
  await expect(page.getByTestId('order-total')).toHaveText('$60.00');

  // Fixing the field lets the same cart go through
  await name(page).fill('Asha Verma');
  await placeOrder(page).click();
  await expect(page.getByTestId('confirmation')).toBeVisible();
});

// ---------------------------------------------------------------------------
// Required check 3: a quantity change updates the exact total
// ---------------------------------------------------------------------------
test('changing quantity updates line totals and the exact order total', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Wireless Mouse to cart' }).click();
  await page.getByRole('button', { name: 'Add Mechanical Keyboard to cart' }).click();
  await expect(page.getByTestId('order-total')).toHaveText('$85.00');   // 25 + 60

  const mouseQty = page.getByRole('spinbutton', { name: 'Quantity of Wireless Mouse' });
  await mouseQty.fill('3');
  await mouseQty.blur();                                                // commits the change
  await expect(page.getByTestId('line-total-mouse')).toHaveText('$75.00');
  await expect(page.getByTestId('order-total')).toHaveText('$135.00');  // 75 + 60

  await page.getByRole('button', { name: 'Increase quantity of Mechanical Keyboard' }).click();
  await expect(page.getByTestId('line-total-keyboard')).toHaveText('$120.00');
  await expect(page.getByTestId('order-total')).toHaveText('$195.00');  // 75 + 120

  await page.getByRole('button', { name: 'Remove Wireless Mouse' }).click();
  await expect(page.getByTestId('order-total')).toHaveText('$120.00');
});

// ---------------------------------------------------------------------------
// Extra checks (cover the brief's error-handling requirements)
// ---------------------------------------------------------------------------
test('empty cart blocks checkout even when a name is entered', async ({ page }) => {
  await name(page).fill('Asha Verma');
  await placeOrder(page).click();

  await expect(page.getByTestId('cart-error'))
    .toHaveText('Your cart is empty. Add at least one item to check out.');
  await expect(page.getByTestId('confirmation')).toBeHidden();
  await expect(name(page)).toHaveValue('Asha Verma');                   // input preserved
});

test('double-clicking Place Order produces exactly one confirmation', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Wireless Mouse to cart' }).click();
  await name(page).fill('Asha Verma');

  await placeOrder(page).dblclick();

  await expect(page.getByTestId('confirmation')).toHaveCount(1);
  await expect(page.getByTestId('order-reference')).toHaveCount(1);
  await expect(page.getByTestId('order-reference')).toHaveText(/^ORD-[A-Z0-9]{6}$/);
  await expect(page.getByRole('button', { name: 'Order placed' })).toBeDisabled();
});

// ---------------------------------------------------------------------------
// Layout check: the whole checkout (with both items in the cart) fits one
// laptop-sized screen, so the customer never has to scroll to find Place Order.
// ---------------------------------------------------------------------------
test('checkout fits a 1366x720 screen without page scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 720 });
  await page.getByRole('button', { name: 'Add Wireless Mouse to cart' }).click();
  await page.getByRole('button', { name: 'Add Mechanical Keyboard to cart' }).click();
  await expect(page.getByTestId('order-total')).toHaveText('$85.00');

  await expect.poll(() => page.evaluate(
    () => document.documentElement.scrollHeight <= window.innerHeight
  )).toBe(true);
  await expect(placeOrder(page)).toBeInViewport();
});