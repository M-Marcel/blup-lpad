import { test, expect } from "@playwright/test";

test.describe("Admin panel", () => {
  test("/admin renders page within shell layout", async ({ page }) => {
    await page.goto("/admin");
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("non-admin sees AuthGate connect prompt when not connected", async ({
    page,
  }) => {
    await page.goto("/admin");
    // NetworkGuard + AuthGate: unauthenticated user sees connect prompt
    await expect(page.getByText("Connect Your Wallet")).toBeVisible();
  });

  test("page shows authentication-related content", async ({ page }) => {
    await page.goto("/admin");
    // Should show connect prompt from NetworkGuard since no wallet is connected
    await expect(
      page.getByRole("button", { name: /connect/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/wallet/i),
    ).toBeVisible();
  });
});
