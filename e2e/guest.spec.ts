import { test, expect } from "@playwright/test";
import { waitForGuestFeed } from "./helpers/feed";

test.describe("Guest experience", () => {
  test("homepage and feed load", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.locator("video").first()).toBeVisible({ timeout: 15_000 });
  });

  test("search overlay opens and closes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /search/i }).click();
    await expect(page.getByPlaceholder(/search servers/i)).toBeVisible();
    await page.getByRole("button", { name: /apply to feed/i }).click();
    await expect(page.getByPlaceholder(/search servers/i)).toBeHidden({ timeout: 5000 });
  });

  test("server profile opens", async ({ page }) => {
    await page.goto("/server/eternal-kingdoms");
    await expect(page.getByRole("heading", { name: "Eternal Kingdoms", exact: true })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("creator profile opens", async ({ page }) => {
    await page.goto("/u/metin2promo");
    await expect(page.getByText(/metin2promo|@metin2promo/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("like prompts login for guest", async ({ page }) => {
    await waitForGuestFeed(page);
    await page.getByRole("button", { name: /^like$/i }).first().click();
    await expect(page.getByText(/sign in required/i)).toBeVisible({ timeout: 5000 });
  });

  test("explore page loads servers", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.getByRole("heading", { name: /explore servers/i })).toBeVisible();
    await expect(page.getByText(/eternal kingdoms/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("invalid server slug shows not found", async ({ page }) => {
    const res = await page.goto("/server/this-server-does-not-exist-xyz");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible({ timeout: 10_000 });
  });
});
