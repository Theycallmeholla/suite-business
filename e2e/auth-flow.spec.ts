import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/signin');
    
    // Check for essential elements
    await expect(page).toHaveTitle(/Sign In/);
    await expect(page.locator('h1')).toContainText('Sign in to your account');
    
    // Check for Google sign in button
    const googleButton = page.locator('button:has-text("Continue with Google")');
    await expect(googleButton).toBeVisible();
    
    // Check for sign up link
    const signUpLink = page.locator('a[href="/signup"]');
    await expect(signUpLink).toBeVisible();
  });

  test('should display sign up page', async ({ page }) => {
    await page.goto('/signup');
    
    // Check for essential elements
    await expect(page).toHaveTitle(/Sign Up/);
    await expect(page.locator('h1')).toContainText('Create your account');
    
    // Check for Google sign up button
    const googleButton = page.locator('button:has-text("Continue with Google")');
    await expect(googleButton).toBeVisible();
    
    // Check for sign in link
    const signInLink = page.locator('a[href="/signin"]');
    await expect(signInLink).toBeVisible();
  });

  test('should redirect to sign in when accessing protected route', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');
    
    // Should be redirected to sign in
    await expect(page).toHaveURL(/\/signin/);
  });

  test('should show proper error for invalid credentials', async ({ page }) => {
    await page.goto('/signin');
    
    // Try to sign in with invalid credentials (if email/password auth is implemented)
    // This test assumes there might be email/password fields in the future
    const emailField = page.locator('input[name="email"]');
    const passwordField = page.locator('input[name="password"]');
    
    if (await emailField.count() > 0) {
      await emailField.fill('invalid@example.com');
      await passwordField.fill('wrongpassword');
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Check for error message
      const errorMessage = page.locator('[role="alert"]');
      await expect(errorMessage).toBeVisible();
    }
  });
});

test.describe('Multi-tenant Subdomain Routing', () => {
  test('should display tenant site on subdomain', async ({ page }) => {
    // This test requires a test tenant to exist
    // In a real test environment, you'd set this up in beforeEach
    const testSubdomain = 'demo';
    
    // Navigate to subdomain
    await page.goto(`http://${testSubdomain}.localhost:3000`);
    
    // Should show the tenant's site, not the main app
    await expect(page.locator('body')).not.toContainText('Sign in');
    
    // Should have site content
    const heroSection = page.locator('[data-section="hero"]');
    await expect(heroSection).toBeVisible();
  });

  test('should show 404 for non-existent subdomain', async ({ page }) => {
    const nonExistentSubdomain = 'does-not-exist-12345';
    
    await page.goto(`http://${nonExistentSubdomain}.localhost:3000`);
    
    // Should show 404 or redirect to main domain
    const body = page.locator('body');
    await expect(body).toContainText(/not found|doesn't exist/i);
  });
});