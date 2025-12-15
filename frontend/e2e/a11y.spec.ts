import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility Tests
 * @A11y - WCAG 2.1 AA compliance tests
 */
test.describe("Accessibility", () => {
    test("login page should have no accessibility violations", async ({ page }) => {
        await page.goto("/login");

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa"])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("register page should have no accessibility violations", async ({ page }) => {
        await page.goto("/register");

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa"])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
