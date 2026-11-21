const { defineConfig, devices } = require('@playwright/test');

// Optional: set CHROMIUM_PATH to use an already-installed Chromium instead of
// the one downloaded by `npx playwright install`.
const executablePath = process.env.CHROMIUM_PATH || undefined;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,                       // no retries: a flaky test should be fixed, not hidden
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], launchOptions: { executablePath, args: ['--no-sandbox'] } },
  }],
});
