import { test, expect, type Page } from '@playwright/test';

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
    return { found, x: (minX + maxX) / 2 * canvas.clientWidth / canvas.width, y: (minY + maxY) / 2 * canvas.clientHeight / canvas.height };
  });
}

test('hybrid layers align, receive input, and resize', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Orbit Range' })).toBeVisible();
  await expect(page.locator('#score')).toHaveText('0');
  await expect.poll(async () => (await findCanvasMarker(page)).found).toBeGreaterThan(10);

  // Freeze the actual simulation and use Canvas 2D pixels to locate the 3D orb.
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  const marker = await findCanvasMarker(page);
  expect(marker.found).toBeGreaterThan(10);
  await page.getByRole('button', { name: 'Resume' }).click();
  await page.locator('#world').click({ position: { x: marker.x, y: marker.y } });
  await expect(page.locator('#score')).toHaveText('1');

  await page.locator('#world').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#score')).toHaveText('2');

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.locator('#score')).toHaveText('0');
  await page.setViewportSize({ width: 430, height: 780 });
  await expect.poll(async () => (await findCanvasMarker(page)).found).toBeGreaterThan(10);
  const sizes = await page.locator('#overlay').evaluate((canvas: HTMLCanvasElement) => ({ width: canvas.clientWidth, height: canvas.clientHeight }));
  expect(sizes).toEqual({ width: 430, height: 780 });
  expect(errors).toEqual([]);
});
