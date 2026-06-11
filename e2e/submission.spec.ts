import path from "path";
import { test, expect } from "@playwright/test";
import { ACCOUNTS, login } from "./helpers/auth";

const FIXTURE = path.join(__dirname, "fixtures", "test-logo.png");

test.describe("Server submission", () => {
  test("submit server with logo upload reaches success page", async ({ page }) => {
    await login(page, ACCOUNTS.user.email);
    await page.goto("/submit-server");

    const serverName = `QA Server ${Date.now()}`;
    await page.locator("#name").fill(serverName);
    await page.locator("#websiteUrl").fill("https://example.com/qa-server");
    await page.locator("#discordUrl").fill("https://discord.gg/qatest");
    await page.locator("#maxLevel").fill("99");
    await page.locator("#description").fill("Automated QA test server submission.");

    const fileInputs = page.locator('input[type="file"]');
    await fileInputs.nth(0).setInputFiles(FIXTURE);
    await fileInputs.nth(1).setInputFiles(FIXTURE);
    await expect(page.getByAltText("Logo preview")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: /submit server profile/i }).click();
    await expect(page).toHaveURL(/\/submit-server\/success/, { timeout: 30_000 });
    await expect(page.getByText(/submitted successfully/i)).toBeVisible();
  });
});
