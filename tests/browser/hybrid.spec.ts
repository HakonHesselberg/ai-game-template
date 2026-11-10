import { test, expect, type Page } from '@playwright/test';

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  return errors;
}

async function findCanvasMarker(page: Page) {
  return page.locator('#overlay').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
    let minX = pixels.width;
    let minY = pixels.height;
    let maxX = 0;
    let maxY = 0;
    let found = 0;
    for (let y = 0; y < pixels.height; y += 1) {
      for (let x = 0; x < pixels.width; x += 1) {
        const i = (y * pixels.width + x) * 4;
        if (pixels.data[i]! > 180 && pixels.data[i + 1]! > 100 && pixels.data[i + 2]! < 180 && pixels.data[i + 3]! > 100) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          found += 1;
        }
      }
    }
    return {
      found,
      x: (minX + maxX) / 2 * canvas.clientWidth / canvas.width,
      y: (minY + maxY) / 2 * canvas.clientHeight / canvas.height,
    };
  });
}

async function expectHybridReady(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Orbit Range' })).toBeVisible();
  await expect(page.locator('#score')).toHaveText('0');
  await expect.poll(async () => (await findCanvasMarker(page)).found, { timeout: 10_000 }).toBeGreaterThan(10);
  await expect(page.locator('#overlay')).toHaveCSS('pointer-events', 'none');
}

async function expectControlsInViewport(page: Page) {
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  for (const selector of ['h1', '.score-panel', '#pause-button', '#reset-button']) {
    const box = await page.locator(selector).boundingBox();
    expect(box, `Missing ${selector}`).not.toBeNull();
    expect(box!.x, `${selector} left clipping`).toBeGreaterThanOrEqual(-1);
    expect(box!.y, `${selector} top clipping`).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width, `${selector} right clipping`).toBeLessThanOrEqual(viewport!.width + 1);
    expect(box!.y + box!.height, `${selector} bottom clipping`).toBeLessThanOrEqual(viewport!.height + 1);
  }
}

test('hybrid_WithProductionBuild_AlignsCanvasAndThreeAndHandlesDesktopResizes', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await expectHybridReady(page);
  await expectControlsInViewport(page);
  await page.keyboard.press('Tab');
  await expect(page.locator('#world')).toBeFocused();
  await expect(page.locator('#world')).not.toHaveCSS('outline-style', 'none');

  // Pause a real 3D target, find its Canvas 2D projected ring, then raycast it.
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  const marker = await findCanvasMarker(page);
  await page.getByRole('button', { name: 'Resume' }).click();
  await page.locator('#world').click({ position: { x: marker.x, y: marker.y } });
  await expect(page.locator('#score')).toHaveText('1');

  await page.locator('#world').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#score')).toHaveText('2');
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await page.keyboard.press('Space');
  await page.keyboard.press('r');
  await expect(page.locator('#score')).toHaveText('0');

  for (const dimensions of [{ width: 430, height: 780 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(dimensions);
    await expect.poll(async () => (await findCanvasMarker(page)).found, { timeout: 10_000 }).toBeGreaterThan(10);
    await expectControlsInViewport(page);
    const backing = await page.locator('#overlay').evaluate((canvas: HTMLCanvasElement) => ({
      width: canvas.clientWidth, height: canvas.clientHeight,
      pixelWidth: canvas.width, ratio: window.devicePixelRatio,
    }));
    expect({ width: backing.width, height: backing.height }).toEqual(dimensions);
    expect(backing.pixelWidth / backing.width).toBeCloseTo(Math.min(backing.ratio, 2), 1);
  }
  expect(errors).toEqual([]);
});

test('hybrid_WithTouchAndHighDpr_RoutesTapThroughOverlayToThree', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
    hasTouch: true, isMobile: true,
  });
  try {
    const page = await context.newPage();
    const errors = collectBrowserErrors(page);
    await expectHybridReady(page);
    await expectControlsInViewport(page);
    await page.getByRole('button', { name: 'Pause' }).tap();
    const marker = await findCanvasMarker(page);
    await page.getByRole('button', { name: 'Resume' }).tap();
    await page.touchscreen.tap(marker.x, marker.y);
    await expect(page.locator('#score')).toHaveText('1');

    const canvas = await page.locator('#overlay').evaluate((element: HTMLCanvasElement) => ({
      width: element.width, height: element.height, cssWidth: element.clientWidth, cssHeight: element.clientHeight,
    }));
    expect(canvas.width).toBe(canvas.cssWidth * 2);
    expect(canvas.height).toBe(canvas.cssHeight * 2);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('hybrid_WithRealWebglContextLoss_ReportsLossAndRecovers', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await expectHybridReady(page);
  const available = await page.locator('#world').evaluate((canvas: HTMLCanvasElement) =>
    Boolean(canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')));
  test.skip(!available, 'WEBGL_lose_context is unavailable in this browser/device');

  await page.locator('#world').evaluate((canvas: HTMLCanvasElement) => {
    const extension = canvas.getContext('webgl2')!.getExtension('WEBGL_lose_context')!;
    (window as Window & { restoreWebglForTest?: () => void }).restoreWebglForTest = () => extension.restoreContext();
    extension.loseContext();
  });
  await expect(page.locator('#status')).toContainText('Graphics context lost');
  await page.evaluate(() => (window as Window & { restoreWebglForTest?: () => void }).restoreWebglForTest?.());
  await expect(page.locator('#status')).not.toContainText('Graphics context lost');
  await expect.poll(async () => (await findCanvasMarker(page)).found, { timeout: 10_000 }).toBeGreaterThan(10);
  expect(errors).toEqual([]);
});
