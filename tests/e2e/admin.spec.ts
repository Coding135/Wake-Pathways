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

  test('submissions tab shows submissions', async ({ page }) => {
    await page.goto('/admin?tab=submissions');

    await expect(
      page.getByText(/trail steward|youth apprentice|coding bootcamp|animal care/i).first()
    ).toBeVisible();
  });

  test('can view submission details', async ({ page }) => {
    await page.goto('/admin?tab=submissions');

    const viewButton = page.getByRole('button', { name: /view|detail|review/i }).first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await expect(
        page.getByText(/organization|contact|summary|category/i).first()
      ).toBeVisible();
    }
  });
});
