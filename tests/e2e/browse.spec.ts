import { test, expect } from '@playwright/test';

test.describe('Browse & Navigation', () => {
  test('landing page loads with hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/wake/i);
  });

  test('browse page loads with opportunity cards', async ({ page }) => {
    await page.goto('/opportunities');
    await expect(page.locator('h1')).toContainText('Explore Opportunities');
    const cards = page.locator('a[href^="/opportunities/"]');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('search input filters results', async ({ page }) => {
    await page.goto('/opportunities');

    const countBefore = page.getByText(/\d+ opportunit/);
    await expect(countBefore).toBeVisible();

    await page.getByPlaceholder(/search/i).fill('Raleigh Youth Employment');
    await page.keyboard.press('Enter');

    await page.waitForURL(/search=/);
    await expect(page.getByText(/Raleigh Youth Employment/)).toBeVisible();
  });

  test('category filter works', async ({ page }) => {
    await page.goto('/opportunities?category=volunteer');

    const cards = page.locator('a[href^="/opportunities/"]');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('opportunity detail page loads from card click', async ({ page }) => {
    await page.goto('/opportunities');

    const firstCard = page.locator('a[href^="/opportunities/"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    await page.waitForURL(/\/opportunities\/.+/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('submit page loads with form', async ({ page }) => {
    await page.goto('/submit');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByLabel(/organization/i)).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('mobile viewport shows hamburger menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const menuButton = page.getByLabel(/open menu/i);
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    await expect(page.getByRole('link', { name: /opportunities/i })).toBeVisible();
  });
});
