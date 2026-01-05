import { test as base, expect, type Page } from '@playwright/test';

// Test user credentials
export const testUser = {
  username: 'demo01',
  password: 'demo01',
};

// Extended test fixture with authentication
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Login before the test
    await page.goto('/sign-in');
    await page.getByPlaceholder(/username/i).fill(testUser.username);
    await page.getByPlaceholder(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for navigation to complete
    await page.waitForURL(/\/main\//, { timeout: 10000 });

    // Use the authenticated page
    await use(page);
  },
});

// Helper function to login
export async function login(page: Page, username: string = testUser.username, password: string = testUser.password) {
  await page.goto('/sign-in');
  await page.getByPlaceholder(/username/i).fill(username);
  await page.getByPlaceholder(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/main\//, { timeout: 10000 });
}

export { expect };
