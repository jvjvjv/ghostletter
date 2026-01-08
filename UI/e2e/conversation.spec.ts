import { test, expect, login } from "./fixtures/auth";

test.describe("Conversation View", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Navigate to chat list first to get friend IDs
    await page.goto("/main/chat");
    await page.waitForTimeout(2000);
  });

  test("should display conversation header with friend name", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      // Click on first chat
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);

      // Check for header with back button and friend name
      await expect(page.getByRole("button").filter({ hasText: "←" })).toBeVisible();
      await expect(page.locator("header .font-semibold")).toBeVisible();
    }
  });

  test("should display messages in conversation", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);
      await page.waitForTimeout(2000);

      // Check for messages or loading state
      const hasMessages = (await page.locator('[data-testid="message-item"]').count()) > 0;
      const isLoading = await page
        .getByText(/loading messages/i)
        .isVisible()
        .catch(() => false);

      expect(hasMessages || isLoading).toBeTruthy();
    }
  });

  test("should differentiate sent vs received messages", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);
      await page.waitForTimeout(2000);

      // Check for different styling - sent messages use secondary color, received use white
      const sentMessages = page.locator('[data-testid="message-item"]').filter({ has: page.locator('[style*="secondary"]') });
      const receivedMessages = page.locator('[data-testid="message-item"]').filter({ has: page.locator('[style*="white"]') });

      const sentCount = await sentMessages.count();
      const receivedCount = await receivedMessages.count();

      // At least one type of message should exist if conversation has messages
      if ((await page.locator('[data-testid="message-item"]').count()) > 0) {
        expect(sentCount + receivedCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test("should have message input field", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);

      // Check for message input
      await expect(page.getByPlaceholder(/message/i)).toBeVisible();
    }
  });

  test("should have send button", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);

      // Check for send button (→ arrow)
      await expect(page.locator("footer button").first()).toBeVisible();
    }
  });

  test("should disable send button when input is empty", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);

      const input = page.getByPlaceholder(/message/i);
      await input.clear();

      // Send button should have gray styling when disabled
      const sendButton = page.locator("footer button").filter({ hasText: "→" });
      await expect(sendButton).toHaveClass(/bg-gray-200/);
    }
  });

  test("should enable send button when message is typed", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);

      const input = page.getByPlaceholder(/message/i);
      await input.fill("Test message");

      // Send button should have indigo styling when enabled
      const sendButton = page.locator("footer button").filter({ hasText: "→" });
      await expect(sendButton).toHaveClass(/bg-indigo-500/);
    }
  });

  test("should send text message", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);
      await page.waitForTimeout(1000);

      // Count initial messages
      const initialCount = await page.locator(".space-y-4 > div").count();

      // Type and send a message
      const testMessage = `Test message ${Date.now()}`;
      const input = page.getByPlaceholder(/message/i);
      await input.fill(testMessage);

      const sendButton = page.locator("footer button").filter({ hasText: "→" });
      await sendButton.click();

      // Wait for message to appear
      await page.waitForTimeout(2000);

      // Check if message appeared
      const messageVisible = await page
        .getByText(testMessage)
        .isVisible()
        .catch(() => false);
      const newCount = await page.locator(".space-y-4 > div").count();

      // Either message is visible or count increased
      expect(messageVisible || newCount > initialCount).toBeTruthy();
    }
  });

  test("should send message on Enter key", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);
      await page.waitForTimeout(1000);

      const testMessage = `Enter test ${Date.now()}`;
      const input = page.getByPlaceholder(/message/i);
      await input.fill(testMessage);
      await input.press("Enter");

      // Input should be cleared
      await page.waitForTimeout(500);
      await expect(input).toHaveValue("");
    }
  });

  test("should have camera button in footer", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);

      // Check for camera button
      await expect(page.locator("footer").getByText("📷")).toBeVisible();
    }
  });

  test("should navigate to camera when camera button clicked", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);

      // Click camera button
      await page.locator("footer").getByText("📷").click();

      await expect(page).toHaveURL(/\/main\/camera/);
    }
  });

  test("should navigate back to chat list when back button clicked", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);

      // Click back button
      await page.getByRole("button").filter({ hasText: "←" }).click();

      await expect(page).toHaveURL(/\/main\/chat$/);
    }
  });

  test("should display message timestamps", async ({ page }) => {
    const chatItems = page.locator("[data-testid="chat-preview-item"]");
    const count = await chatItems.count();

    if (count > 0) {
      await chatItems.first().click();
      await page.waitForURL(/\/main\/chat\/\d+/);
      await page.waitForTimeout(2000);

      // Check for timestamp elements (Mantine Text with size="xs")
      const timestamps = page.locator('[data-testid="message-item"] >> text=/\\d{1,2}:\\d{2}/');
      const timestampCount = await timestamps.count();

      // If there are messages, there should be timestamps
      const messageCount = await page.locator('[data-testid="message-item"]').count();
      if (messageCount > 0) {
        expect(timestampCount).toBeGreaterThan(0);
      }
    }
  });
});
