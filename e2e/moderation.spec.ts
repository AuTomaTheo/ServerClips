import { test, expect } from "@playwright/test";
import { ACCOUNTS, login } from "./helpers/auth";

const PENDING_SERVER = /nova school/i;

test.describe("Admin moderation actions", () => {
  let serverId: string | null = null;

  test.beforeEach(async ({ page }) => {
    await login(page, ACCOUNTS.admin.email);
  });

  test.afterEach(async ({ page }) => {
    if (!serverId) return;
    await page.request.patch(`/api/admin/servers/${serverId}/status`, {
      data: { status: "PENDING" },
    });
    serverId = null;
  });

  test("approve pending server", async ({ page }) => {
    await page.goto("/admin/servers");
    await page.getByText(PENDING_SERVER).first().click();
    await expect(page).toHaveURL(/\/admin\/servers\/.+/);
    serverId = page.url().split("/").pop() ?? null;

    await page.getByRole("button", { name: /^approve$/i }).click();
    await expect(page.getByText("APPROVED").first()).toBeVisible({ timeout: 10_000 });
  });

  test("reject pending server", async ({ page }) => {
    await page.goto("/admin/servers");
    await page.getByText(PENDING_SERVER).first().click();
    serverId = page.url().split("/").pop() ?? null;

    await page.getByRole("button", { name: /^reject$/i }).click();
    await expect(page.getByText("REJECTED").first()).toBeVisible({ timeout: 10_000 });
  });
});
