import { Page, expect } from "@playwright/test";
import { ACCOUNTS } from "./auth";

export async function waitForGuestFeed(page: Page) {
  await page.goto("/");
  await page.waitForSelector("video", { timeout: 15_000 });
  await expect(page.locator('[data-auth-status="unauthenticated"]')).toBeVisible({
    timeout: 15_000,
  });
}

export async function waitForAuthenticatedFeed(page: Page, email = ACCOUNTS.user.email) {
  await page.goto("/");
  await page.waitForSelector("video", { timeout: 15_000 });
  await expect
    .poll(async () => {
      const res = await page.request.get("/api/auth/session");
      const data = await res.json();
      return data?.user?.email === email;
    })
    .toBe(true);
  await page.reload();
  await page.waitForSelector("video", { timeout: 15_000 });
  await expect(page.locator('[data-auth-status="authenticated"]')).toBeVisible({
    timeout: 15_000,
  });
}
