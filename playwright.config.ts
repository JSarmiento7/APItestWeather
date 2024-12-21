import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['html', { outputFolder: 'test-results', open: 'never' }],
    ['json', { outputFolder: 'test-results', outputFile: 'results.json' }],
  ],
  use: {
    trace: 'on-first-retry',  // Capture trace on first retry (for debugging)
  },
});
