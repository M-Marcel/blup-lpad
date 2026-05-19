import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders hero heading", async ({ page }) => {
    await page.goto("/");
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("BlessUP");
    await expect(heading).toContainText("Launchpad");
  });

  test("has CTA link to /nft", async ({ page }) => {
    await page.goto("/");
    const ctaLink = page.locator('a[href="/nft"]', {
      hasText: "Get Your Founder NFT",
    });
    await expect(ctaLink).toBeVisible();
  });

  test("has proper meta title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BlessUP Launchpad/);
  });

  test("displays the three-step onboarding flow", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Founder NFT")).toBeVisible();
    await expect(page.getByText("Genesis Sprint")).toBeVisible();
    await expect(page.getByText("ACTX Presale")).toBeVisible();
  });

  test("has a link to the presale page", async ({ page }) => {
    await page.goto("/");
    const presaleLink = page.locator('a[href="/presale"]', {
      hasText: "View Presale",
    });
    await expect(presaleLink).toBeVisible();
  });
});
