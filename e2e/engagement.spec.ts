import { test, expect } from "@playwright/test";
import { ACCOUNTS, login } from "./helpers/auth";
import { waitForAuthenticatedFeed } from "./helpers/feed";

test.describe("Logged-in engagement", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ACCOUNTS.user.email);
    await waitForAuthenticatedFeed(page);
  });

  test("profile page loads", async ({ page }) => {
    await page.goto(`/u/${ACCOUNTS.user.username}`);
    await expect(page.getByText(/playerone|@playerone/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("account edit page loads", async ({ page }) => {
    await page.goto("/account/edit");
    await expect(page.getByRole("heading", { name: /edit profile/i })).toBeVisible();
  });

  test("studio upload page accessible for any logged-in user", async ({ page }) => {
    await page.goto("/studio/videos/new");
    await expect(page.getByRole("heading", { name: /upload promo video/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("creator studio loads", async ({ page }) => {
    await login(page, ACCOUNTS.creator.email);
    await page.goto("/studio");
    await expect(page.getByRole("heading", { name: /^studio$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/your videos/i)).toBeVisible();
  });

  test("comment drawer opens when logged in", async ({ page }) => {
    const commentBtn = page.getByRole("button", { name: /^comments$/i }).first();
    await commentBtn.click();
    await expect(page.getByRole("heading", { name: /comments/i })).toBeVisible({ timeout: 8000 });
    const body = "QA test comment " + Date.now();
    await page.getByPlaceholder(/add a comment/i).fill(body);
    await page.getByRole("button", { name: /^post$/i }).click();
    await expect(page.getByText(body).first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^delete$/i }).first().click();
    await expect(page.getByText(body)).toHaveCount(0, { timeout: 10_000 });
  });

  test("like and save toggle on feed", async ({ page }) => {
    const likeBtn = page.getByRole("button", { name: /^like$/i }).first();
    await likeBtn.click();
    await page.waitForTimeout(500);

    const saveBtn = page.getByRole("button", { name: /^save$/i }).first();
    await saveBtn.click();
    await page.waitForTimeout(500);

    await likeBtn.click();
    await saveBtn.click();
  });

  test("follow creator from feed", async ({ page }) => {
    const followBtn = page.getByRole("button", { name: /^follow$/i }).first();
    if (await followBtn.isVisible()) {
      await followBtn.click();
      await expect(followBtn).toBeHidden({ timeout: 5000 });
    }
  });
});
