// Scripted exploratory run that records screenshots and observations for RESULTS.md.
// Usage: node evidence/capture.js   (set CHROMIUM_PATH if you use a pre-installed Chromium)
const { chromium } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');
const APP = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;
const out = (f) => path.join(__dirname, f);

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
  const log = {};

  // M1: empty cart, name filled, Place Order
  let page = await browser.newPage();
  await page.goto(APP);
  await page.getByLabel('Full name (required)').fill('Asha Verma');
  await page.getByRole('button', { name: 'Place Order' }).click();
  log.M1 = {
    cartError: await page.getByTestId('cart-error').textContent(),
    confirmationVisible: await page.getByTestId('confirmation').isVisible(),
    nameKept: await page.getByLabel('Full name (required)').inputValue(),
  };
  await page.screenshot({ path: out('M1-empty-cart.png'), fullPage: true });
  await page.close();

  // M2a: rapid double-click with real mouse events
  page = await browser.newPage();
  await page.goto(APP);
  await page.getByRole('button', { name: 'Add Wireless Mouse to cart' }).click();
  await page.getByLabel('Full name (required)').fill('Asha Verma');
  await page.getByRole('button', { name: 'Place Order' }).dblclick({ delay: 0 });
  log.M2a = {
    confirmations: await page.getByTestId('confirmation').count(),
    visibleConfirmations: await page.locator('[data-testid=confirmation]:visible').count(),
    reference: await page.getByTestId('order-reference').textContent(),
  };
  await page.screenshot({ path: out('M2a-double-click.png'), fullPage: true });
  await page.close();

  // M2b: harsher variant - 5 synchronous submit clicks in the same JS tick (faster than any human)
  page = await browser.newPage();
  await page.goto(APP);
  await page.getByRole('button', { name: 'Add Mechanical Keyboard to cart' }).click();
  await page.getByLabel('Full name (required)').fill('Asha Verma');
  await page.evaluate(() => { const b = document.getElementById('place-order'); for (let i = 0; i < 5; i++) b.click(); });
  const refs = await page.getByTestId('order-reference').allTextContents();
  log.M2b = {
    confirmations: await page.getByTestId('confirmation').count(),
    references: refs,
  };
  await page.screenshot({ path: out('M2b-rapid-5-clicks.png'), fullPage: true });
  await page.close();

  // M3: blank name with items in cart (validation message, cart preserved)
  page = await browser.newPage();
  await page.goto(APP);
  await page.getByRole('button', { name: 'Add Mechanical Keyboard to cart' }).click();
  await page.getByRole('button', { name: 'Place Order' }).click();
  log.M3 = {
    nameError: await page.getByTestId('name-error').textContent(),
    confirmationVisible: await page.getByTestId('confirmation').isVisible(),
    orderTotal: await page.getByTestId('order-total').textContent(),
  };
  await page.screenshot({ path: out('M3-blank-name.png'), fullPage: true });
  await page.close();

  console.log(JSON.stringify(log, null, 2));
  await browser.close();
})();
