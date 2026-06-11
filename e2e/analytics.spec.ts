import { test, expect } from "@playwright/test";

test.describe("Analytics tracking", () => {
  test("search apply records search event", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("video", { timeout: 15_000 });

    const trackPromise = page.waitForResponse(
      (res) => res.url().includes("/api/search/track") && res.request().method() === "POST"
    );

    await page.getByRole("button", { name: /search/i }).click();
    await page.getByPlaceholder(/search servers/i).fill("eternal");
    await page.getByRole("button", { name: /apply to feed/i }).click();

    const trackRes = await trackPromise;
    expect(trackRes.ok()).toBeTruthy();
    const body = await trackRes.request().postDataJSON();
    expect(body.query).toBe("eternal");
  });
});
