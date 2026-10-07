import { defineConfig } from '@playwright/test';

const widths = [320, 360, 375, 390, 480, 639, 640, 641, 768, 1024, 1280];
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:47321/pressguide/',
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: ['chromium', 'firefox', 'webkit'].flatMap((browserName) =>
    widths.map((width) => ({
      name: `${browserName}-${width}`,
      use: {
        browserName: browserName as 'chromium' | 'firefox' | 'webkit',
        viewport: { width, height: width === 480 ? 320 : 800 },
      },
    })),
  ),
  webServer: {
    command: 'npm run build && node scripts/serve.mjs',
    url: 'http://127.0.0.1:47321/pressguide/',
    reuseExistingServer: !process.env.CI,
  },
});
