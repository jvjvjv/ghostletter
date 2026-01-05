import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByPlaceholder(/username/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    // Try to submit without filling fields
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for HTML5 validation or error message
    const usernameInput = page.getByPlaceholder(/username/i);
    const isInvalid = await usernameInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

    if (isInvalid) {
      expect(isInvalid).toBeTruthy();
    } else {
      // If no HTML5 validation, look for custom error message
      await expect(
        page.getByText(/username.*required/i).or(page.getByText(/please fix/i))
      ).toBeVisible({ timeout: 2000 });
    }
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    // Fill in with invalid credentials
    await page.getByPlaceholder(/username/i).fill('invaliduser');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');

    // Click the sign in button
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for error message to appear (could be various messages)
    await page.waitForTimeout(1000);
    const hasError = await page.locator('div.border-red-500, div.text-red').isVisible().catch(() => false);

    expect(hasError).toBeTruthy();

    // Verify we're still on the sign-in page
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    // Fill in the login form
    await page.getByPlaceholder(/username/i).fill('demo01');
    await page.getByPlaceholder(/password/i).fill('demo01');

    // Click the sign in button
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for navigation to complete (redirects to camera after login)
    await page.waitForURL(/\/main\/camera/, { timeout: 15000 });
  });

  test('should require username field', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    // Only fill in password, leave username empty
    await page.getByPlaceholder(/password/i).fill('demo01');

    // Click the sign in button
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for HTML5 validation or error message
    const usernameInput = page.getByPlaceholder(/username/i);
    const isInvalid = await usernameInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

    if (isInvalid) {
      expect(isInvalid).toBeTruthy();
    } else {
      await expect(page.getByText(/username.*required/i).or(page.getByText(/at least 3/i))).toBeVisible({ timeout: 2000 });
    }

    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('should require password field', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    // Only fill in username, leave password empty
    await page.getByPlaceholder(/username/i).fill('demo01');

    // Click the sign in button
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for HTML5 validation or error message
    const passwordInput = page.getByPlaceholder(/password/i);
    const isInvalid = await passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

    if (isInvalid) {
      expect(isInvalid).toBeTruthy();
    } else {
      await expect(page.getByText(/password.*required/i).or(page.getByText(/at least 6/i))).toBeVisible({ timeout: 2000 });
    }

    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('should show validation error for short username', async ({ page }) => {
    await page.goto('/sign-in');

    // Fill in short username
    await page.getByPlaceholder(/username/i).fill('ab');
    await page.getByPlaceholder(/password/i).fill('password123');

    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/at least 3 characters/i).or(page.getByText(/please fix/i))
    ).toBeVisible({ timeout: 3000 });
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/sign-in');

    // Fill in short password
    await page.getByPlaceholder(/username/i).fill('testuser');
    await page.getByPlaceholder(/password/i).fill('12345');

    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/at least 6 characters/i).or(page.getByText(/please fix/i))
    ).toBeVisible({ timeout: 3000 });
  });

  test('should show terms and privacy links', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page.getByRole('link', { name: /terms/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /privacy/i })).toBeVisible();
  });
});
