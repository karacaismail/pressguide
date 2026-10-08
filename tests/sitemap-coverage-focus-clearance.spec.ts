import { expect, test, type Locator } from '@playwright/test';

const assertClearance = async (summary: Locator) => {
  const measurement = await summary.evaluate((element) => {
    const heading = document.querySelector('#kapsam');
    if (!heading) throw new Error('Coverage heading missing');
    const textRange = document.createRange();
    textRange.selectNodeContents(heading);
    const text = textRange.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const rootFont = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    const ancestors = [
      element.parentElement,
      element.parentElement?.parentElement,
    ].map((node) => {
      if (!node) throw new Error('Coverage ancestor missing');
      const css = getComputedStyle(node);
      return { outlineStyle: css.outlineStyle, boxShadow: css.boxShadow };
    });
    return {
      focusVisible: element.matches(':focus-visible'),
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
      outlineOffset: Number.parseFloat(style.outlineOffset),
      boxShadow: style.boxShadow,
      clearance:
        box.top -
        Number.parseFloat(style.outlineWidth) -
        Number.parseFloat(style.outlineOffset) -
        text.bottom,
      ancestors,
      rootFont,
      headingFont: Number.parseFloat(getComputedStyle(heading).fontSize),
      summaryFont: Number.parseFloat(style.fontSize),
      overflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    };
  });
  expect(measurement.focusVisible).toBe(true);
  expect(measurement.outlineStyle).toBe('solid');
  expect(measurement.outlineWidth).toBeGreaterThan(0);
  expect(measurement.boxShadow).toBe('none');
  expect(
    measurement.clearance,
    'keyboard focus outline must not cover the preceding heading text',
  ).toBeGreaterThanOrEqual(0);
  for (const ancestor of measurement.ancestors) {
    expect(ancestor.outlineStyle).toBe('none');
    expect(ancestor.boxShadow).toBe('none');
  }
  expect(measurement.headingFont).toBeGreaterThanOrEqual(measurement.rootFont);
  expect(measurement.summaryFont).toBeGreaterThanOrEqual(measurement.rootFont);
  expect(measurement.overflow).toBe(false);
};

test('keyboard disclosure focus clears its heading while closed and open', async ({
  page,
}) => {
  expect((await page.goto('sitemap/'))?.status()).toBe(200);
  const details = page.locator('details[data-coverage-details]');
  const summary = details.locator(':scope > summary');
  // Seed the preceding visible control, then enter the target with a real Tab.
  const preceding = page
    .locator('#panel-agaci :is(a[href], button, input, summary, [tabindex])')
    .filter({ visible: true })
    .last();
  await preceding.focus();
  await page.keyboard.press('Tab');
  await expect(summary).toBeFocused();
  await expect(details).not.toHaveAttribute('open');
  await assertClearance(summary);
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open', '');
  await assertClearance(summary);
  await page.keyboard.press('Enter');
  await expect(details).not.toHaveAttribute('open');
  await page.keyboard.press('Shift+Tab');
  await expect(preceding).toBeFocused();
});

test('pointer disclosure activation does not frame its ancestors', async ({
  page,
}) => {
  expect((await page.goto('sitemap/'))?.status()).toBe(200);
  const details = page.locator('details[data-coverage-details]');
  await details.locator(':scope > summary').click();
  await expect(details).toHaveAttribute('open', '');
  const ancestors = await details.evaluate((element) =>
    [element, element.parentElement].map((node) => {
      if (!node) throw new Error('Coverage ancestor missing');
      const css = getComputedStyle(node);
      return { outlineStyle: css.outlineStyle, boxShadow: css.boxShadow };
    }),
  );
  for (const ancestor of ancestors) {
    expect(ancestor.outlineStyle).toBe('none');
    expect(ancestor.boxShadow).toBe('none');
  }
});
