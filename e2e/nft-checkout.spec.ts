import { test, expect } from "@playwright/test";

test.describe("NFT checkout flow", () => {
  test("/nft page renders tier cards", async ({ page }) => {
    await page.goto("/nft");
    await expect(page.getByText("Become a BlessUP Founder")).toBeVisible();
    // Both tier cards should render (Elite and Legend)
    await expect(page.getByText("Elite")).toBeVisible();
    await expect(page.getByText("Legend")).toBeVisible();
  });

  test("/nft page shows supply meter", async ({ page }) => {
    await page.goto("/nft");
    await expect(page.getByText("Genesis Collection")).toBeVisible();
  });

  test("/nft/checkout shows AuthGate when not connected", async ({ page }) => {
    await page.goto("/nft/checkout?tier=elite");
    // AuthGate should show connect prompt
    await expect(page.getByText("Authentication required")).toBeVisible();
    await expect(
      page.getByText(/connect your wallet/i),
    ).toBeVisible();
  });

  test("/nft/checkout/processing/test-id shows AuthGate when not connected", async ({
    page,
  }) => {
    await page.goto("/nft/checkout/processing/test-id");
    await expect(page.getByText("Authentication required")).toBeVisible();
  });

  test("/nft/checkout/success/test-id shows AuthGate when not connected", async ({
    page,
  }) => {
    await page.goto("/nft/checkout/success/test-id");
    await expect(page.getByText("Authentication required")).toBeVisible();
  });
});
