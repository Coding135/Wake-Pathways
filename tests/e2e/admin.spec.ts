import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('admin dashboard loads', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText(/admin|dashboard/i).first()).toBeVisible();
  });

  test('can switch tabs', async ({ page }) => {
    await page.goto('/admin');

    const submissionsTab = page.getByRole('tab', { name: /submission/i });
    if (await submissionsTab.isVisible()) {
      await submissionsTab.click();
      await expect(page).toHaveURL(/tab=submissions/);
    }

    const overviewTab = page.getByRole('tab', { name: /overview/i });
    if (await overviewTab.isVisible()) {
      await overviewTab.click();
      await expect(page).toHaveURL(/tab=overview|\/admin$/);
    }
  });

  test('submissions tab shows review UI', async ({ page }) => {
    await page.goto('/admin?tab=submissions');

    await expect(page.getByRole('heading', { name: /submissions review/i })).toBeVisible();
  });

  test('can expand a submission row when list is non-empty', async ({ page }) => {
    await page.goto('/admin?tab=submissions');

    const rowToggle = page.locator('button').filter({ hasText: /pending|approved|rejected|needs edits/i }).first();
    if (await rowToggle.isVisible()) {
      await rowToggle.click();
      await expect(page.getByText(/summary|full description|contact/i).first()).toBeVisible();
    }
  });
});
