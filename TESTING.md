# Testing Guide

This project includes comprehensive tests to verify functionality, especially the removal of the 8-file upload limit.

## Test Types

### 1. Unit Tests (Jest)
Unit tests for core parsing and data processing functions:
- `lib/__tests__/zipParser.test.ts` - Tests ZIP extraction and JSON parsing
- `lib/__tests__/dataParser.test.ts` - Tests Spotify record parsing
- `lib/__tests__/aggregators.test.ts` - Tests aggregation helpers
- `lib/analytics/__tests__/*` - Tests overview, top items, time, genres, content split, phases, rediscoveries

### 2. Integration Tests (Jest + React Testing Library)
Component-level tests:
- `src/components/Upload/__tests__/UploadZone.test.tsx` - Tests file upload component, including multiple file uploads (>8 files)
- `src/app/__tests__/pages.test.tsx` - Smoke tests for Overview/Artists/Time/Story pages with a mocked store

### 3. End-to-End Tests (Playwright) - Black Box Tests
E2E tests that verify the actual user experience:
- `e2e/upload-multiple-files.spec.ts` - Tests uploading more than 8 files through the UI
- `e2e/core-flows.spec.ts` - Tests upload → overview → filters plus navigation to Time and Story pages

## Setup

### Install Dependencies

```bash
npm install
```

This will install:
- Jest and React Testing Library for unit/integration tests
- Playwright for E2E tests

### Install Playwright Browsers

```bash
npx playwright install
```

## Running Tests

### Run All Unit/Integration Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run E2E Tests (Black Box Tests)
```bash
# Make sure dev server is running or use the webServer config
npm run test:e2e
```

### Run E2E Tests with UI
```bash
npm run test:e2e:ui
```

### Run E2E Tests in Headed Mode (see browser)
```bash
npm run test:e2e:headed
```

### Sample Fixtures
- Structured TS fixtures: `tests/fixtures/plays.ts` (single account, multi-account, multi-year, phases/rediscoveries)
- Uploadable JSON fixtures: `tests/fixtures/streaming-history-single.json`, `tests/fixtures/streaming-history-multi.json`

## What the Tests Verify

### ✅ File Upload Limit Removal
- **Unit Test**: `UploadZone.test.tsx` verifies that 15 files can be uploaded without error
- **E2E Test**: `upload-multiple-files.spec.ts` verifies through the actual UI that:
  - More than 8 JSON files can be uploaded
  - ZIP files with many JSON files inside work correctly
  - No error message appears about file limits
  - Mixed ZIP and JSON files work together
- **E2E Test**: `core-flows.spec.ts` verifies upload → overview → filters and navigation to Time/Story

### ✅ ZIP File Handling
- Tests verify that ZIP files extract all `Streaming_History*.json` files
- Tests verify that all extracted files are combined into a single source
- Tests handle ZIP files with 15+ JSON files inside

### ✅ JSON File Parsing
- Tests verify both array and object format JSON files
- Tests verify proper error handling for invalid files
- Tests verify username detection and source naming

### ✅ Analytics, Pages, and Navigation
- Tests lock in aggregators and analytics (overview, top items, time, genres, content split, phases, rediscoveries)
- Page-level tests ensure filters/metrics are wired for Overview, Artists, Time, and Story
- Playwright tests cover upload → overview filters plus Time/Story navigation

## Test Data

E2E tests create temporary test files in `test-data/` directory (gitignored). These are automatically cleaned up after tests run.

## Continuous Integration

These tests can be run in CI/CD pipelines:
- Unit tests are fast and run on every commit
- E2E tests can be run on pull requests or before releases

## Verifying the 8-File Limit Removal

To manually verify the fix:

1. **Run the E2E test**:
   ```bash
   npm run test:e2e upload-multiple-files
   ```

2. **Or manually test in the browser**:
   - Start the dev server: `npm run dev`
   - Go to `/upload`
   - Select 10+ JSON files at once
   - Verify they all upload successfully without any error about file limits

The tests specifically verify that:
- ✅ No error message about "at most 8 files" appears
- ✅ All files are processed successfully
- ✅ Success message shows the correct number of sources
