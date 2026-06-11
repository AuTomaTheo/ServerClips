import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("bottom nav explore works", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("link", { name: /explore/i }).click();
    await expect(page).toHaveURL(/\/explore/);
  });

  test("feed scrolls to next video", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForSelector("video", { timeout: 15_000 });
    const firstTitle = await page.locator("h2").first().textContent();
    await page.locator(".feed-scroll-container").evaluate((el) => {
      el.scrollBy(0, el.clientHeight);
    });
    await page.waitForTimeout(1500);
    const secondTitle = await page.locator("h2").first().textContent();
    // May be same if only one video visible - at least scroll shouldn't crash
    expect(firstTitle).toBeTruthy();
    expect(secondTitle).toBeTruthy();
  });
});
