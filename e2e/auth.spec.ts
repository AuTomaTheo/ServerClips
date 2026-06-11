import { test, expect } from "@playwright/test";
import { ACCOUNTS, PASSWORD, login, logout, expectSignOutVisible } from "./helpers/auth";

test.describe("Authentication", () => {
  test("invalid login shows error", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("wrong@example.com");
    await page.locator("#password").fill("wrongpassword");
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 10_000 });
  });

  test("login and logout as user", async ({ page }) => {
    await login(page, ACCOUNTS.user.email);
    await expectSignOutVisible(page);
    await logout(page);
  });

  test("logout from feed bottom nav profile menu", async ({ page }) => {
    await login(page, ACCOUNTS.user.email);
    await page.goto("/");
    await expect(page.locator('[data-auth-status="authenticated"]')).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: /profile menu/i }).click();
    await page.getByRole("button", { name: /^sign out$/i }).click();
    await expect(page.locator('[data-auth-status="unauthenticated"]')).toBeVisible({
      timeout: 15_000,
    });
  });

  test("protected submit-server redirects guest to login", async ({ page }) => {
    await page.goto("/submit-server");
    await expect(page).toHaveURL(/\/login/);
  });

  test("normal user cannot access admin", async ({ page }) => {
    await login(page, ACCOUNTS.user.email);
    await page.goto("/admin");
    await expect(page).toHaveURL("/");
  });

  test("admin can access admin dashboard", async ({ page }) => {
    await login(page, ACCOUNTS.admin.email);
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /admin overview/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("register new user", async ({ page }) => {
    const unique = `qa${Date.now()}@serverclips.test`;
    await page.goto("/register");
    await page.locator("#name").fill("QA Tester");
    await page.locator("#email").fill(unique);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("#confirmPassword").fill(PASSWORD);
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await login(page, unique);
    await expectSignOutVisible(page);
  });
});
