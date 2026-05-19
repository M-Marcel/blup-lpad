import { test, expect } from "@playwright/test";

test.describe("Vesting dashboard", () => {
  test("/presale/dashboard shows NetworkGuard connect prompt", async ({
    page,
  }) => {
    await page.goto("/presale/dashboard");
    await expect(page.getByText("Connect Your Wallet")).toBeVisible();
  });

  test("unauthenticated user sees connect button", async ({ page }) => {
    await page.goto("/presale/dashboard");
    await expect(
      page.getByRole("button", { name: /connect/i }),
    ).toBeVisible();
  });

  test("page renders within shell layout", async ({ page }) => {
    await page.goto("/presale/dashboard");
    const header = page.locator("header");
    await expect(header).toBeVisible();
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
