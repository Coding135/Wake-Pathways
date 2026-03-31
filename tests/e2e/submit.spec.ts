import { test, expect } from '@playwright/test';

test.describe('Submit Opportunity Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/submit');
  });

  test('form renders all required sections', async ({ page }) => {
    await expect(page.getByLabel(/organization name/i)).toBeVisible();
    await expect(page.getByLabel(/your name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/opportunity title/i)).toBeVisible();
    await expect(page.getByLabel(/category/i)).toBeVisible();
    await expect(page.getByLabel(/summary/i)).toBeVisible();
  });

  test('form shows validation errors when submitted empty', async ({ page }) => {
    await page.getByRole('button', { name: /submit/i }).click();

    await expect(page.getByText(/at least/i).first()).toBeVisible();
  });

  test('form accepts valid data and shows success state', async ({ page }) => {
    await page.getByLabel(/organization name/i).fill('Test Organization');
    await page.getByLabel(/your name/i).fill('Jane Doe');
    await page.getByLabel(/email/i).fill('jane@example.com');
    await page.getByLabel(/opportunity title/i).fill('Summer Youth Program 2026');

    const categorySelect = page.getByLabel(/category/i);
    await categorySelect.selectOption('summer_program');

    await page.getByLabel(/summary/i).fill(
      'A great summer program for Wake County teens offering hands-on STEM experience and mentoring.'
    );

    await page.getByRole('button', { name: /submit/i }).click();

    await expect(
      page.getByText(/thank you|submitted|success/i).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
