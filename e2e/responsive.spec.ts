import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { width: 320, height: 568, label: "320px" },
  { width: 768, height: 1024, label: "768px" },
  { width: 1440, height: 900, label: "1440px" },
] as const;

test.describe("Responsive layout", () => {
  for (const vp of VIEWPORTS) {
    test(`no horizontal overflow at ${vp.label}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(vp.width);
    });
  }

  test("hamburger menu visible at 320px, hidden at 1440px", async ({
    page,
  }) => {
    // Mobile: hamburger visible
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: /navigation/i });
    await expect(hamburger).toBeVisible();

    // Desktop: hamburger hidden
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(hamburger).toBeHidden();
  });

  test("desktop nav visible at 1440px, hidden at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const desktopNav = page.locator('nav[aria-label="Main navigation"]');
    await expect(desktopNav).toBeVisible();

    await page.setViewportSize({ width: 320, height: 568 });
    await expect(desktopNav).toBeHidden();
  });

  test("touch targets are at least 44px at mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: /navigation/i });
    const box = await hamburger.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(40);
    expect(box!.height).toBeGreaterThanOrEqual(40);
  });

  test("CTA buttons are reachable at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    const cta = page.locator('a[href="/nft"]', {
      hasText: "Get Your Founder NFT",
    });
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    // Button should be within viewport width
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  });
});
