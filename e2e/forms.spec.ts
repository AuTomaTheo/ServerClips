import { test, expect } from "@playwright/test";
import { login, ACCOUNTS } from "./helpers/auth";

test.describe("Form validation", () => {
  test("login requires password", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("user@serverclips.dev");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByText(/password is required/i)).toBeVisible({ timeout: 5000 });
  });

  test("register shows password mismatch", async ({ page }) => {
    await page.goto("/register");
    await page.locator("#name").fill("Test User");
    await page.locator("#email").fill(`mismatch${Date.now()}@serverclips.test`);
    await page.locator("#password").fill("password123");
    await page.locator("#confirmPassword").fill("password456");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible({ timeout: 5000 });
  });

  test("invalid username shows 404", async ({ page }) => {
    const res = await page.goto("/u/this-user-does-not-exist-xyz");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible({ timeout: 10_000 });
  });

  test("server submission requires server name", async ({ page }) => {
    await login(page, ACCOUNTS.user.email);
    await page.goto("/submit-server");
    await page.getByRole("button", { name: /submit server profile/i }).click();
    await expect(page.getByText(/server name must be at least 3 characters/i).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("video upload requires title and video", async ({ page }) => {
    await login(page, ACCOUNTS.user.email);
    await page.goto("/studio/videos/new");
    await page.getByRole("button", { name: /submit video/i }).click();
    await expect(page.getByText(/at least 3|required|title/i).first()).toBeVisible({ timeout: 5000 });
  });
});
