import { expect, test } from '@playwright/test';
test('visual reference candidate requires independent approval', async ({
  page,
}) => {
  test.skip(
    !process.env.VISUAL_REFERENCE_REVIEW,
    'No approved baseline yet; set VISUAL_REFERENCE_REVIEW for reviewed comparisons.',
  );
  await page.goto('./');
  await expect(page).toHaveScreenshot('guide.png', {
    fullPage: true,
    animations: 'disabled',
  });
});
