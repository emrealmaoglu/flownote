import { test, expect } from "@playwright/test";

/**
 * Auth E2E Tests
 * @QA - Frontend authentication flow tests
 */
test.describe("Authentication Flow", () => {
    const testUser = {
        identifier: "admin",
        password: "admin",
    };

    test.beforeEach(async ({ page }) => {
        // Clear any existing auth state
        await page.context().clearCookies();
    });

    test("should display login page", async ({ page }) => {
        await page.goto("/login");
        await expect(page.getByRole("heading", { name: /giriş/i })).toBeVisible();
        await expect(page.getByPlaceholder(/kullanıcı adı veya email/i)).toBeVisible();
        await expect(page.getByPlaceholder(/şifre/i)).toBeVisible();
    });

    test("should login successfully with valid credentials", async ({ page }) => {
        await page.goto("/login");

        // Fill login form
        await page.getByPlaceholder(/kullanıcı adı veya email/i).fill(testUser.identifier);
        await page.getByPlaceholder(/şifre/i).fill(testUser.password);
        await page.getByRole("button", { name: /giriş yap/i }).click();

        // Should redirect to home
        await expect(page).toHaveURL("/");
        await expect(page.getByText(/notlarım/i)).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
        await page.goto("/login");

        await page.getByPlaceholder(/kullanıcı adı veya email/i).fill("wronguser");
        await page.getByPlaceholder(/şifre/i).fill("wrongpassword");
        await page.getByRole("button", { name: /giriş yap/i }).click();

        // Should show error message
        await expect(page.getByText(/hatalı/i)).toBeVisible();
    });

    test("should redirect to login when accessing protected route", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveURL(/\/login/);
    });

    test("should logout successfully", async ({ page }) => {
        // First login
        await page.goto("/login");
        await page.getByPlaceholder(/kullanıcı adı veya email/i).fill(testUser.identifier);
        await page.getByPlaceholder(/şifre/i).fill(testUser.password);
        await page.getByRole("button", { name: /giriş yap/i }).click();
        await expect(page).toHaveURL("/");

        // Then logout
        await page.getByRole("button", { name: /çıkış/i }).click();
        await expect(page).toHaveURL(/\/login/);
    });
});

test.describe("Mobile Viewport", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("should display login page on mobile", async ({ page }) => {
        await page.goto("/login");
        await expect(page.getByRole("heading", { name: /giriş/i })).toBeVisible();
    });
});
