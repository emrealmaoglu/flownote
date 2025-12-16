import { test, expect } from '@playwright/test';

test.describe('Sprint 8: Identity & Persistence (Hardened)', () => {

    test('should persist note identity (icon & cover) after refresh', async ({ page }) => {
        // 1. Login
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');

        // 2. Create New Note
        await page.click('text=Yeni Not');
        await expect(page).toHaveURL(/\/notes\/.+/);

        // 3. Add Identity (Icon & Cover)
        // Hover over main header area to reveal action buttons
        const header = page.getByTestId('note-detail-header');
        await header.hover();

        // Add Icon (Strict Assertion: Button MUST be visible)
        const addIconBtn = page.getByTestId('add-icon-btn');
        await expect(addIconBtn).toBeVisible({ timeout: 2000 });
        await addIconBtn.click();

        // Select Rocket emoji
        const rocketEmoji = page.getByTestId('emoji-option-🚀');
        await expect(rocketEmoji).toBeVisible();
        await rocketEmoji.click();

        // Verify Icon Rendered immediately
        await expect(page.getByTestId('note-icon-display')).toHaveText('🚀');

        // Add Cover
        await header.hover(); // Re-hover to ensure controls
        const addCoverBtn = page.getByTestId('add-cover-btn');
        await expect(addCoverBtn).toBeVisible();
        await addCoverBtn.click(); // Adds default gradient

        // Verify Cover Rendered
        const coverDiv = page.getByTestId('note-cover');
        await expect(coverDiv).toBeVisible();
        await expect(coverDiv).toHaveAttribute('data-cover-type', 'gradient');

        // Change Title
        await page.fill('[placeholder="Untitled"]', 'Sprint 8 Hardened Test');

        // Wait for auto-save (debounce)
        await page.waitForTimeout(2000);

        // 4. Refresh Page to test Persistence
        await page.reload();

        // 5. Verify Persistence
        // Check Title
        await expect(page.locator('[placeholder="Untitled"]')).toHaveValue('Sprint 8 Hardened Test');

        // Check Icon (Should be visible in Header)
        await expect(page.getByTestId('note-icon-display')).toBeVisible();
        await expect(page.getByTestId('note-icon-display')).toHaveText('🚀');

        // Check Cover (Should be visible)
        const persistentCover = page.getByTestId('note-cover');
        await expect(persistentCover).toBeVisible();
        await expect(persistentCover).toHaveAttribute('data-cover-type', 'gradient');

        // 6. Verify Sidebar
        // The sidebar should show the rocket icon next to the note title
        const sidebarIcon = page.getByTestId('sidebar-note-icon').first();
        // Note: Using first() as there might be multiple notes, ideally we'd filter by title container
        await expect(sidebarIcon).toBeVisible();
        await expect(sidebarIcon).toHaveText('🚀');
    });

    test('should remove note identity and persist removal', async ({ page }) => {
        // 1. Setup: Login & Create Note with Identity
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        await page.click('text=Yeni Not');
        // Initial setup similar to test 1
        await page.getByTestId('note-detail-header').hover();

        // Add Icon explicitly
        await page.getByTestId('add-icon-btn').click();
        await page.getByTestId('emoji-option-🚀').click();

        // Add Cover explicitly
        await page.getByTestId('note-detail-header').hover();
        await page.getByTestId('add-cover-btn').click();
        await page.waitForTimeout(1000);

        // 2. Remove Icon
        // Hover the icon container to reveal remove button
        const iconContainer = page.locator('.group\\/icon');
        await iconContainer.hover();

        const removeIconBtn = page.getByTestId('remove-icon-btn');
        await expect(removeIconBtn).toBeVisible();
        await removeIconBtn.click();

        // Verify removal immediate
        await expect(page.getByTestId('note-icon-display')).not.toBeVisible();
        // Verify "Add Icon" button comes back on hover
        await page.getByTestId('note-detail-header').hover();
        await expect(page.getByTestId('add-icon-btn')).toBeVisible();

        // 3. Remove Cover
        await page.getByTestId('note-detail-header').hover();
        // Cover is present, so we hover cover area to see actions
        await page.getByTestId('note-cover').hover();

        const removeCoverBtn = page.getByTestId('remove-cover-btn');
        await expect(removeCoverBtn).toBeVisible();
        await removeCoverBtn.click();

        // Verify removal immediate
        await expect(page.getByTestId('note-cover')).not.toBeVisible();

        // 4. Refresh & Verify Persistence of Removal
        await page.reload();
        await expect(page.getByTestId('note-icon-display')).not.toBeVisible();
        await expect(page.getByTestId('note-cover')).not.toBeVisible();

        // Ensure default Add buttons are available when hovering header
        await page.getByTestId('note-detail-header').hover();
        await expect(page.getByTestId('add-icon-btn')).toBeVisible();
        await expect(page.getByTestId('add-cover-btn')).toBeVisible();
    });

});
