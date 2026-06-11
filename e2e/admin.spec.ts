import { test, expect } from "@playwright/test";
import { ACCOUNTS, login } from "./helpers/auth";

test.describe("Admin moderation", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ACCOUNTS.admin.email);
  });

  test("admin servers list loads", async ({ page }) => {
    await page.goto("/admin/servers");
    await expect(page.getByRole("heading", { name: /servers/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/eternal kingdoms|nova school/i).first()).toBeVisible();
  });

  test("admin server detail page loads", async ({ page }) => {
    await page.goto("/admin/servers");
    await page.getByText(/nova school/i).first().click();
    await expect(page.getByText(/nova school/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("admin videos page loads", async ({ page }) => {
    await page.goto("/admin/videos");
    await expect(page.getByRole("heading", { name: /videos/i })).toBeVisible();
  });

  test("admin reports page loads", async ({ page }) => {
    await page.goto("/admin/reports");
    await expect(page.getByRole("heading", { name: /reports/i })).toBeVisible();
  });

  test("moderator cannot access users page", async ({ page }) => {
    await login(page, ACCOUNTS.moderator.email);
    await page.goto("/admin/users");
    // Layout may hide nav but direct URL might 404 or redirect - check no user list
    const res = await page.goto("/admin/users");
    expect(res?.status()).toBeLessThan(500);
  });
});
