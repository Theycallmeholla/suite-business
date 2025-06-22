import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('should complete full onboarding flow', async ({ page }) => {
    // Click Get Started
    await page.click('text=Get Started');
    
    // Should redirect to signup
    await expect(page).toHaveURL(/.*signup/);
    
    // Fill signup form
    await page.fill('input[placeholder="John"]', 'Test User');
    await page.fill('input[placeholder="john@example.com"]', 'test@example.com');
    await page.fill('input[placeholder="••••••••"]', 'TestPassword123!');
    
    // Submit signup
    await page.click('button:has-text("Create Account")');
    
    // Should redirect to onboarding
    await expect(page).toHaveURL(/.*onboarding/);
    
    // Wait for Google account connection prompt
    await expect(page.locator('text=Connect Your Google Account')).toBeVisible();
    
    // Mock Google OAuth flow
    // In real test, you'd need to handle the OAuth popup
    
    // Select a business (mocked)
    await expect(page.locator('text=Select Your Business')).toBeVisible();
    
    // Click on a business card
    await page.click('.business-card:first-child');
    
    // Confirm business details
    await expect(page.locator('text=Confirm Business Details')).toBeVisible();
    await page.click('button:has-text("Create Website")');
    
    // Should redirect to preview
    await expect(page).toHaveURL(/.*preview/);
    
    // Preview page elements
    await expect(page.locator('text=Preview Mode')).toBeVisible();
    await expect(page.locator('button:has-text("Publish")'));
    
    // Test color customization
    await page.click('button:has-text("Customize Colors")');
    await page.fill('input[type="color"]', '#ff0000');
    
    // Publish site
    await page.click('button:has-text("Publish")');
    
    // Confirm publish
    await page.click('button:has-text("Yes, Publish")');
    
    // Should show success message
    await expect(page.locator('text=Site published successfully')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup');
    
    // Try to submit empty form
    await page.click('button:has-text("Create Account")');
    
    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
    
    // Test invalid email
    await page.fill('input[placeholder="john@example.com"]', 'invalid-email');
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('text=Invalid email address')).toBeVisible();
    
    // Test weak password
    await page.fill('input[placeholder="••••••••"]', '123');
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });
});

test.describe('Client Site', () => {
  test('should display client site correctly', async ({ page }) => {
    // Navigate to a test subdomain
    await page.goto('http://demo.localhost:3000');
    
    // Check main sections
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Test contact form
    await page.click('text=Contact');
    await expect(page.locator('text=Get In Touch')).toBeVisible();
    
    // Fill contact form
    await page.fill('input[placeholder="John"]', 'Test');
    await page.fill('input[placeholder="Doe"]', 'User');
    await page.fill('input[placeholder="john@example.com"]', 'test@example.com');
    await page.fill('input[placeholder="(555) 123-4567"]', '555-1234');
    await page.fill('textarea', 'Test message from E2E test');
    
    // Submit form
    await page.click('button:has-text("Send Message")');
    
    // Should show success message
    await expect(page.locator('text=Thank you')).toBeVisible();
  });

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://demo.localhost:3000');
    
    // Mobile menu should be visible
    await expect(page.locator('button[aria-label="Menu"]')).toBeVisible();
    
    // Click mobile menu
    await page.click('button[aria-label="Menu"]');
    
    // Navigation should be visible
    await expect(page.locator('nav')).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test.use({
    storageState: 'tests/auth.json', // Pre-authenticated state
  });

  test('should show dashboard for authenticated user', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Dashboard elements
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('text=Sites')).toBeVisible();
    await expect(page.locator('text=Forms')).toBeVisible();
    await expect(page.locator('text=CRM')).toBeVisible();
  });

  test('should navigate to sites management', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Sites');
    
    await expect(page).toHaveURL(/.*dashboard\/sites/);
    await expect(page.locator('h1:has-text("Your Sites")')).toBeVisible();
  });

  test('should navigate to forms builder', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Forms');
    
    await expect(page).toHaveURL(/.*dashboard\/forms/);
    await expect(page.locator('h1:has-text("Forms")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Form")')).toBeVisible();
  });

  test('should navigate to CRM', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=CRM');
    
    await expect(page).toHaveURL(/.*dashboard\/crm/);
    await expect(page.locator('h1:has-text("CRM Dashboard")')).toBeVisible();
    
    // Check CRM tabs
    await expect(page.locator('button:has-text("Contacts")')).toBeVisible();
    await expect(page.locator('button:has-text("Pipeline")')).toBeVisible();
    await expect(page.locator('button:has-text("Communications")')).toBeVisible();
  });
});
