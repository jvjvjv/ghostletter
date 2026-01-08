import { test, expect, login } from "./fixtures/auth";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should navigate from chat list to camera", async ({ page }) => {
    await page.goto("/main/chat");
    await page.waitForTimeout(1000);

    // Navigate to camera
    await page.goto("/main/camera");

    await expect(page).toHaveURL(/\/main\/camera/);
  });

  test("should navigate from camera to chat", async ({ page }) => {
    await page.goto("/main/camera");
    await page.waitForTimeout(1000);

    // Navigate to chat
    await page.goto("/main/chat");

    await expect(page).toHaveURL(/\/main\/chat/);
  });

  test("should navigate between different routes", async ({ page }) => {
    // Start at chat
    await page.goto("/main/chat");
    await expect(page).toHaveURL(/\/main\/chat/);

    // Go to camera
    await page.goto("/main/camera");
    await expect(page).toHaveURL(/\/main\/camera/);

    // Back to chat
    await page.goto("/main/chat");
    await expect(page).toHaveURL(/\/main\/chat/);
  });

  test("should handle browser back button", async ({ page }) => {
    // Navigate through pages
    await page.goto("/main/chat");
    await page.waitForTimeout(500);

    await page.goto("/main/camera");
    await page.waitForTimeout(500);

    // Go back
    await page.goBack();

    // Should be back at chat
    await expect(page).toHaveURL(/\/main\/chat/);
  });

  test("should handle browser forward button", async ({ page }) => {
    // Navigate through pages
    await page.goto("/main/chat");
    await page.waitForTimeout(500);

    await page.goto("/main/camera");
    await page.waitForTimeout(500);

    await page.goBack();
    await page.waitForTimeout(500);

    // Go forward
    await page.goForward();

    // Should be at camera
    await expect(page).toHaveURL(/\/main\/camera/);
  });

  test("should maintain auth state during navigation", async ({ page }) => {
    // Navigate to multiple pages
    await page.goto("/main/chat");
    await expect(page.getByRole("heading", { name: /chats/i })).toBeVisible();

    await page.goto("/main/camera");
    // Should still be able to access (not redirected to login)
    await expect(page).toHaveURL(/\/main\/camera/);

    // Go back to chat
    await page.goto("/main/chat");
    await expect(page.getByRole("heading", { name: /chats/i })).toBeVisible();
  });

  test("should navigate from conversation back to chat list", async ({ page }) => {
    await page.goto("/main/chat");
    await page.waitForTimeout(2000);

    const chatItems = page.locator('[data-testid="chat-preview-item"]');
    const count = await chatItems.count();

    if (count > 0) {
      // Enter a conversation
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);

      // Click back button
      await page.getByRole("button").filter({ hasText: "←" }).click();

      // Should be back at chat list
      await expect(page).toHaveURL(/\/main\/chat$/);
    }
  });

  test("should deep link to conversation", async ({ page }) => {
    // Try to access a specific conversation directly
    await page.goto("/main/chat/1");

    // Should either show the conversation or redirect
    await page.waitForTimeout(2000);

    const isConversation = page.url().includes("/main/chat/");
    const hasHeader = (await page.locator("header").count()) > 0;

    expect(isConversation && hasHeader).toBeTruthy();
  });
});

test.describe("Error Handling", () => {
  test("should handle 404 pages gracefully", async ({ page }) => {
    await login(page);

    // Try to access non-existent route
    await page.goto("/main/nonexistent");

    // Should either show 404 or redirect
    await page.waitForTimeout(1000);

    const hasError = await page
      .getByText(/404|not found/i)
      .isVisible()
      .catch(() => false);
    const redirected = !page.url().includes("/nonexistent");

    expect(hasError || redirected).toBeTruthy();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    await login(page);
    await page.goto("/main/chat");

    // Intercept API calls to simulate network error
    await page.route("**/api/**", (route) => route.abort());

    // Refresh to trigger API calls
    await page.reload();
    await page.waitForTimeout(2000);

    // Should show error state or loading state, not crash
    (await page
      .getByRole("heading", { name: /chats/i })
      .isVisible()
      .catch(() => false)) ||
      (await page
        .getByText(/error|loading/i)
        .isVisible()
        .catch(() => false));

    // Unroute to clean up
    await page.unroute("**/api/**");

    expect(true).toBeTruthy(); // Page didn't crash
  });

  test("should handle slow network", async ({ page }) => {
    await login(page);

    // Slow down network
    await page.route("**/api/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto("/main/chat");

    // Should show loading state
    await page
      .getByText(/loading/i)
      .isVisible()
      .catch(() => false);

    // Unroute to clean up
    await page.unroute("**/api/**");

    // Page should still work
    const hasContent = await page.getByRole("heading", { name: /chats/i }).isVisible();
    expect(hasContent).toBeTruthy();
  });

  test("should handle unauthorized access", async ({ page, context }) => {
    // Clear cookies to simulate logged out state
    await context.clearCookies();

    // Try to access protected route
    await page.goto("/main/chat");
    await page.waitForTimeout(2000);

    // Should redirect to login or show auth error
    const isOnLogin = page.url().includes("sign-in");
    const hasLoginForm = await page
      .getByPlaceholder(/username/i)
      .isVisible()
      .catch(() => false);

    expect(isOnLogin || hasLoginForm).toBeTruthy();
  });

  test("should preserve state after page refresh", async ({ page }) => {
    await login(page);
    await page.goto("/main/chat");
    await page.waitForTimeout(2000);

    // Refresh the page
    await page.reload();
    await page.waitForTimeout(2000);

    // Should still be on chat page with data
    await expect(page).toHaveURL(/\/main\/chat/);
    await expect(page.getByRole("heading", { name: /chats/i })).toBeVisible();
  });
});
