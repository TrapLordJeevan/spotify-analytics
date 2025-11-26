import { test, expect } from '@playwright/test';
import JSZip from 'jszip';
import path from 'path';
import fs from 'fs';

/**
 * Black box E2E test for uploading multiple files (>8 files)
 * This test verifies that the 8 file limit has been removed
 */
test.describe('File Upload - Multiple Files', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
  });

  test('should allow uploading more than 8 JSON files', async ({ page }) => {
    // Create test data directory if it doesn't exist
    const testDataDir = path.join(process.cwd(), 'test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    // Create 15 JSON files (more than the old 8 file limit)
    const files: string[] = [];
    for (let i = 0; i < 15; i++) {
      const testData = [
        {
          endTime: `2023-01-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
          artistName: `Artist ${i + 1}`,
          trackName: `Track ${i + 1}`,
          msPlayed: 180000,
        },
      ];
      const filePath = path.join(testDataDir, `Streaming_History_music_2023_${i}.json`);
      fs.writeFileSync(filePath, JSON.stringify(testData));
      files.push(filePath);
    }

    // Wait for the upload zone to be visible
    await expect(page.getByText(/Drop your Spotify ZIP or JSON files here/i)).toBeVisible();

    // Upload all files using the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(files);

    // Wait for processing to complete
    await expect(page.getByText(/Imported/i)).toBeVisible({ timeout: 15000 });

    // Verify success message shows all files were processed
    const successMessage = page.getByText(/Imported/i);
    await expect(successMessage).toContainText('15'); // Should mention 15 sources

    // Clean up test files
    files.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  test('should handle ZIP file with many JSON files inside', async ({ page }) => {
    // Create a ZIP file with 15 JSON files inside
    const zip = new JSZip();
    for (let i = 0; i < 15; i++) {
      const testData = [
        {
          endTime: `2023-01-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
          artistName: `Artist ${i + 1}`,
          trackName: `Track ${i + 1}`,
          msPlayed: 180000,
        },
      ];
      zip.file(`Streaming_History_music_2023_${i}.json`, JSON.stringify(testData));
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const testDataDir = path.join(process.cwd(), 'test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    const zipPath = path.join(testDataDir, 'test-multiple-files.zip');
    fs.writeFileSync(zipPath, zipBuffer);

    // Wait for the upload zone to be visible
    await expect(page.getByText(/Drop your Spotify ZIP or JSON files here/i)).toBeVisible();

    // Upload the ZIP file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(zipPath);

    // Wait for processing to complete
    await expect(page.getByText(/Imported/i)).toBeVisible({ timeout: 15000 });

    // Verify success - ZIP should extract all files and combine into one source
    const successMessage = page.getByText(/Imported/i);
    await expect(successMessage).toBeVisible();

    // Clean up
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
  });

  test('should not show error message for more than 8 files', async ({ page }) => {
    // Create 12 JSON files
    const testDataDir = path.join(process.cwd(), 'test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    const files: string[] = [];
    for (let i = 0; i < 12; i++) {
      const testData = [
        {
          endTime: `2023-01-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
          artistName: `Artist ${i + 1}`,
          trackName: `Track ${i + 1}`,
          msPlayed: 180000,
        },
      ];
      const filePath = path.join(testDataDir, `test_${i}.json`);
      fs.writeFileSync(filePath, JSON.stringify(testData));
      files.push(filePath);
    }

    await expect(page.getByText(/Drop your Spotify ZIP or JSON files here/i)).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(files);

    // Should NOT show an error about file limit
    await expect(page.getByText(/at most.*files/i)).not.toBeVisible({ timeout: 2000 });

    // Should show success message instead
    await expect(page.getByText(/Imported/i)).toBeVisible({ timeout: 15000 });

    // Clean up
    files.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  test('should process mixed ZIP and JSON files together', async ({ page }) => {
    // Create a ZIP file
    const zip = new JSZip();
    const testData1 = [
      {
        endTime: '2023-01-01T12:00:00Z',
        artistName: 'Artist 1',
        trackName: 'Track 1',
        msPlayed: 180000,
      },
    ];
    zip.file('Streaming_History_music_2023.json', JSON.stringify(testData1));
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Create individual JSON files
    const testDataDir = path.join(process.cwd(), 'test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    const zipPath = path.join(testDataDir, 'test.zip');
    fs.writeFileSync(zipPath, zipBuffer);

    const jsonFiles: string[] = [];
    for (let i = 0; i < 10; i++) {
      const testData = [
        {
          endTime: `2023-01-${String(i + 2).padStart(2, '0')}T12:00:00Z`,
          artistName: `Artist ${i + 2}`,
          trackName: `Track ${i + 2}`,
          msPlayed: 180000,
        },
      ];
      const filePath = path.join(testDataDir, `test_${i}.json`);
      fs.writeFileSync(filePath, JSON.stringify(testData));
      jsonFiles.push(filePath);
    }

    // Upload both ZIP and JSON files together (11 files total)
    const allFiles = [zipPath, ...jsonFiles];

    await expect(page.getByText(/Drop your Spotify ZIP or JSON files here/i)).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(allFiles);

    // Should process all files without error
    await expect(page.getByText(/Imported/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/at most.*files/i)).not.toBeVisible({ timeout: 2000 });

    // Clean up
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
    jsonFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });
});

