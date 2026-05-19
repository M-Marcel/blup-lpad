import { test, expect } from "@playwright/test";

test.describe("Presale purchase page", () => {
  test("/presale shows NetworkGuard connect prompt when not connected", async ({
    page,
  }) => {
    await page.goto("/presale");
    // NetworkGuard wraps PageGuard; unauthenticated user sees connect prompt
    await expect(page.getByText("Connect Your Wallet")).toBeVisible();
    await expect(
      page.getByText(/connect your wallet to access/i),
    ).toBeVisible();
  });

  test("unauthenticated user sees connect button", async ({ page }) => {
    await page.goto("/presale");
    await expect(
      page.getByRole("button", { name: /connect/i }),
    ).toBeVisible();
  });

  test("page structure renders within NetworkGuard", async ({ page }) => {
    await page.goto("/presale");
    // The page should at minimum render the header and footer around the guard
    const header = page.locator("header");
    await expect(header).toBeVisible();
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
