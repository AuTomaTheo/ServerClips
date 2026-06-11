import { Page, expect } from "@playwright/test";

export const PASSWORD = "password123";

export const ACCOUNTS = {
  admin: { email: "admin@serverclips.dev", username: "admin" },
  moderator: { email: "moderator@serverclips.dev", username: "modteam" },
  creator: { email: "creator@serverclips.dev", username: "metin2promo" },
  user: { email: "user@serverclips.dev", username: "playerone" },
} as const;

export async function login(page: Page, email: string, password = PASSWORD) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: /log in/i }).click();
    try {
      await expect
        .poll(
          async () => {
            const res = await page.request.get("/api/auth/session");
            const data = await res.json();
            return data?.user?.email === email;
          },
          { timeout: 25_000 }
        )
        .toBe(true);
      return;
    } catch {
      if (attempt === 2) throw new Error(`Login failed for ${email}`);
    }
  }
}

export async function logout(page: Page) {
  const signOut = page.getByRole("button", { name: /sign out/i });
  if (await signOut.isVisible().catch(() => false)) {
    await signOut.click();
    await page.waitForTimeout(1000);
  }
}

export async function expectLoggedIn(page: Page) {
  // Feed layout has no navbar — check session or a page that shows auth chrome.
  const session = await page.request.get("/api/auth/session");
  const data = await session.json();
  expect(data?.user?.email).toBeTruthy();
}

export async function expectSignOutVisible(page: Page) {
  await page.goto("/explore");
  await expect(page.getByRole("button", { name: /sign out/i })).toBeVisible({ timeout: 10_000 });
}
