import { test, expect } from "@playwright/test";

test.describe("Authentication flow", () => {
  test("ConnectButton is visible on page load", async ({ page }) => {
    await page.goto("/");
    // RainbowKit connect button renders in the header
    await expect(
      page.getByRole("button", { name: /connect/i }),
    ).toBeVisible();
  });

  test("clicking connect opens RainbowKit modal", async ({ page }) => {
    await page.goto("/");
    const connectBtn = page.getByRole("button", { name: /connect/i }).first();
    await connectBtn.click();
    // RainbowKit modal renders with a dialog or overlay
    await expect(
      page.getByText(/metamask|coinbase|walletconnect/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("auth-gated /nft/checkout shows connect prompt without wallet", async ({
    page,
  }) => {
    await page.goto("/nft/checkout?tier=elite");
    await expect(page.getByText("Authentication required")).toBeVisible();
    await expect(page.getByText(/connect your wallet/i)).toBeVisible();
  });

  test("auth-gated /admin shows connect prompt without wallet", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page.getByText("Connect Your Wallet")).toBeVisible();
  });

  test("auth-gated /presale shows connect prompt without wallet", async ({
    page,
  }) => {
    await page.goto("/presale");
    await expect(page.getByText("Connect Your Wallet")).toBeVisible();
  });

  test("auth-gated /sprint shows connect prompt without wallet", async ({
    page,
  }) => {
    await page.goto("/sprint");
    await expect(page.getByText("Connect Your Wallet")).toBeVisible();
  });
});
