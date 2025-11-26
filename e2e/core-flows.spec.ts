import { test, expect, Page } from '@playwright/test';
import path from 'path';

const singleHistory = path.join(process.cwd(), 'tests/fixtures/streaming-history-single.json');

test.describe('Core flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
  });

  const uploadSample = async (page: Page) => {
    await expect(page.getByText(/Drop your Spotify ZIP or JSON files here/i)).toBeVisible();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(singleHistory);
    await expect(page.getByTestId('upload-status')).toBeVisible({ timeout: 15000 });
  };

  test('upload, view overview, and apply filters', async ({ page }) => {
    await uploadSample(page);

    await expect(page).toHaveURL(/overview/);
    await expect(page.getByText(/Listening hours/i)).toBeVisible();
    await expect(page.getByText(/Top songs/i)).toBeVisible();

    // Filter to podcasts and ensure songs list clears
    await page.getByRole('button', { name: /podcast/i }).click();
    await expect(page.getByText(/No data yet/i).first()).toBeVisible();

    // Switch back to music
    await page.getByRole('button', { name: /^music$/i }).click();
    await expect(page.getByText(/Top songs/i)).toBeVisible();
  });

  test('navigate to Time and Story after upload', async ({ page }) => {
    await uploadSample(page);

    await page.getByRole('link', { name: /^Time$/i }).click();
    await expect(page).toHaveURL(/time/);
    await expect(page.getByText(/Time of day/i)).toBeVisible();

    await page.getByRole('link', { name: /^Story$/i }).click();
    await expect(page).toHaveURL(/story/);
    await expect(page.getByText(/Year-by-year highlights/i)).toBeVisible();
  });
});
