# Ghost Letter E2E Tests

End-to-end tests for the Ghost Letter application using Playwright.

## Setup

Playwright is already installed. If you need to reinstall browsers:

```bash
pnpm exec playwright install chromium
```

## Running Tests

### Run all tests (headless)
```bash
pnpm test:e2e
```

### Run tests with UI mode (interactive)
```bash
pnpm test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
pnpm test:e2e:headed
```

### Debug mode (step through tests)
```bash
pnpm test:e2e:debug
```

## Prerequisites

Before running tests, make sure:
1. The **API backend is running** on `http://localhost:8000`
2. The database has been seeded with the demo user:
   - Username: `demo01`
   - Password: `demo01`

## Test Structure

Tests are organized in the `e2e/` directory:

- `auth.spec.ts` - User authentication tests (login, validation)

## Writing New Tests

Create new test files in the `e2e/` directory with the `.spec.ts` extension.

Example:
```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/some-page');
  await expect(page.getByText('Something')).toBeVisible();
});
```

## Configuration

Playwright configuration is in `playwright.config.ts`:
- Base URL: `http://localhost:3000`
- Browser: Chromium
- Web server: Automatically starts with `pnpm run dev`
- Screenshots: Captured on failure
- Traces: Captured on first retry

## Reports

After running tests, view the HTML report:
```bash
pnpm exec playwright show-report
```
