import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("header nav links are visible on desktop", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
    await expect(nav.getByText("Home")).toBeVisible();
    await expect(nav.getByText("Founder NFT")).toBeVisible();
    await expect(nav.getByText("Presale")).toBeVisible();
  });

  test("mobile hamburger menu appears at narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: /navigation/i });
    await expect(hamburger).toBeVisible();
    // Desktop nav should be hidden
    const desktopNav = page.locator('nav[aria-label="Main navigation"]');
    await expect(desktopNav).toBeHidden();
  });

  test("nav links navigate to correct routes", async ({ page }) => {
    await page.goto("/");

    await page.locator('nav[aria-label="Main navigation"]').getByText("Founder NFT").click();
    await expect(page).toHaveURL(/\/nft$/);

    await page.locator('nav[aria-label="Main navigation"]').getByText("Presale").click();
    await expect(page).toHaveURL(/\/presale$/);

    await page.locator('nav[aria-label="Main navigation"]').getByText("Home").click();
    await expect(page).toHaveURL("/");
  });

  test("back/forward browser navigation works", async ({ page }) => {
    await page.goto("/");
    await page.locator('nav[aria-label="Main navigation"]').getByText("Founder NFT").click();
    await expect(page).toHaveURL(/\/nft$/);

    await page.goBack();
    await expect(page).toHaveURL("/");

    await page.goForward();
    await expect(page).toHaveURL(/\/nft$/);
  });

  test("footer is visible on landing page", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByText("BlessUP Technologies")).toBeVisible();
  });

  test("footer is visible on NFT page", async ({ page }) => {
    await page.goto("/nft");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
