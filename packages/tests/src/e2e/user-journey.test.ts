import { test, expect } from '@playwright/test';

test.describe('User Journey E2E Tests', () => {
  test('Complete user registration and credit score flow', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');

    // Register new user
    await page.click('text=Register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for registration success
    await expect(page.locator('text=Registration successful')).toBeVisible();

    // Login
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Navigate to credit score
    await page.click('text=Credit Score');
    await expect(page.locator('text=Your Credit Score')).toBeVisible();

    // Calculate credit score
    await page.click('button:has-text("Calculate Score")');
    await expect(page.locator('text=Score calculated successfully')).toBeVisible();

    // View score details
    await expect(page.locator('.score-value')).toBeVisible();
    await expect(page.locator('.score-factors')).toBeVisible();
  });

  test('Payment flow with blockchain integration', async ({ page }) => {
    // Login as existing user
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to payments
    await page.click('text=Payments');
    await expect(page.locator('text=Payment History')).toBeVisible();

    // Create new payment
    await page.click('button:has-text("New Payment")');
    await page.fill('input[name="amount"]', '1000');
    await page.fill('input[name="description"]', 'Test Payment');
    await page.selectOption('select[name="currency"]', 'BRL');
    await page.click('button[type="submit"]');

    // Wait for payment creation
    await expect(page.locator('text=Payment created successfully')).toBeVisible();

    // Verify payment on blockchain
    await page.click('button:has-text("Verify on Blockchain")');
    await expect(page.locator('text=Payment verified on blockchain')).toBeVisible();
  });

  test('Chat with ElizaOS AI', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to chat
    await page.click('text=Chat');
    await expect(page.locator('text=Chat with ElizaOS')).toBeVisible();

    // Send message
    await page.fill('input[name="message"]', 'What is my credit score?');
    await page.click('button:has-text("Send")');

    // Wait for AI response
    await expect(page.locator('.ai-message')).toBeVisible();
    await expect(page.locator('.ai-message')).toContainText('credit score');
  });
});
