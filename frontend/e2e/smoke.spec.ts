import { test, expect } from '@playwright/test';

test.describe('Sprint 8: Identity & Persistence', () => {

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
        const header = page.getByTestId('note-detail-header');
        await header.hover();

        // Add Icon (Using TestID)
        const addIconBtn = page.getByTestId('add-icon-btn');
        await expect(addIconBtn).toBeVisible(); // Quality Gate: Ensure button is visible
        await addIconBtn.click();

        // Select Rocket emoji
        await page.click('text=🚀');

        // Verify Icon is displayed (Using TestID)
        await expect(page.getByTestId('note-icon-display')).toBeVisible();
        await expect(page.getByTestId('note-icon-display')).toHaveText('🚀');

        // Add Cover (Using TestID)
        const addCoverBtn = page.getByTestId('add-cover-btn');
        // Note: Adding icon might shift layout, so we hover header again to be safe
        await header.hover();
        if (await addCoverBtn.isVisible()) {
            await addCoverBtn.click();
        } else {
            // Alternatively, if cover is already added by some default logic, skip or handle
            // But for fresh note, it should be visible.
            // Let's force hover just in case
            await header.hover();
            await addCoverBtn.click();
        }

        // Verify Cover is displayed (Using TestID)
        const coverArea = page.getByTestId('note-cover');
        await expect(coverArea).toBeVisible();

        // Change Title
        await page.fill('[placeholder="Untitled"]', 'Sprint 8 Test Note');

        // Wait for auto-save (debounce)
        await page.waitForTimeout(2000);

        // 4. Refresh Page to test Persistence
        await page.reload();

        // 5. Verify Persistence
        // Check Title
        await expect(page.locator('[placeholder="Untitled"]')).toHaveValue('Sprint 8 Test Note');

        // Check Icon
        await expect(page.getByTestId('note-icon-display')).toBeVisible();
        await expect(page.getByTestId('note-icon-display')).toHaveText('🚀');

        // Check Cover
        await expect(page.getByTestId('note-cover')).toBeVisible();

        // 6. Verify Sidebar
        // The sidebar should show the rocket icon next to the note title
        await expect(page.getByTestId('sidebar-note-icon').first()).toBeVisible();
        await expect(page.getByTestId('sidebar-note-icon').first()).toHaveText('🚀');
    });

    test('should remove note identity (icon & cover) and persist removal', async ({ page }) => {
        // 1. Setup: Create a note with identity
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        await page.click('text=Yeni Not');
        const header = page.getByTestId('note-detail-header');
        await header.hover();

        // Add Icon
        await page.getByTestId('add-icon-btn').click();
        await page.click('text=🚀');

        // Add Cover (Ensure we hover to see button)
        await header.hover();
        await page.getByTestId('add-cover-btn').click();

        await page.waitForTimeout(1000); // Wait for save

        // 2. Remove Icon
        const iconContainer = page.getByTestId('note-icon-container');
        await iconContainer.hover();
        await page.getByTestId('remove-icon-btn').click();

        // Verify Removal in UI
        await expect(page.getByTestId('note-icon-display')).not.toBeVisible();
        await expect(page.getByTestId('add-icon-btn')).toBeVisible(); // Should reappear

        // 3. Remove Cover
        await header.hover(); // Hover header to see cover controls
        await page.getByTestId('remove-cover-btn').click();

        // Verify Removal in UI
        await expect(page.getByTestId('note-cover')).not.toBeVisible();
        await expect(page.getByTestId('add-cover-btn')).toBeVisible(); // Should reappear

        // 4. Refresh & Verify Persistence
        await page.reload();
        await expect(page.getByTestId('note-icon-display')).not.toBeVisible();
        await expect(page.getByTestId('note-cover')).not.toBeVisible();

        // Double check empty state buttons are back
        const newHeader = page.getByTestId('note-detail-header');
        await newHeader.hover();
        await expect(page.getByTestId('add-icon-btn')).toBeVisible();
        await expect(page.getByTestId('add-cover-btn')).toBeVisible();
    });

});
