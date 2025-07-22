/**
 * Visual Regression Tests for Question Components
 * 
 * Ensures UI components maintain visual consistency
 */

import { test, expect, Page } from '@playwright/test';
import { TestDataFactory } from '../utils/test-data-factory';

test.describe('Question Components Visual Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  });

  test.describe('PhotoLabeler Component', () => {
    test('default state', async () => {
      await page.goto('/dev/smart-questions?component=photoLabeler');
      const component = page.locator('[data-testid="photo-labeler"]');
      
      await expect(component).toBeVisible();
      await expect(component).toHaveScreenshot('photo-labeler-default.png');
    });

    test('with photos loaded', async () => {
      await page.goto('/dev/smart-questions?component=photoLabeler&photos=8');
      const component = page.locator('[data-testid="photo-labeler"]');
      
      // Wait for photos to load
      await page.waitForLoadState('networkidle');
      await expect(component).toHaveScreenshot('photo-labeler-with-photos.png');
    });

    test('drag hover state', async () => {
      await page.goto('/dev/smart-questions?component=photoLabeler&photos=4');
      
      // Simulate drag hover
      const photo = page.locator('[data-testid="photo-0"]');
      const dropZone = page.locator('[data-label="Before & After"]');
      
      await photo.hover();
      await page.mouse.down();
      await dropZone.hover();
      
      await expect(page.locator('[data-testid="photo-labeler"]')).toHaveScreenshot('photo-labeler-drag-hover.png');
      
      await page.mouse.up();
    });

    test('labeled photos state', async () => {
      await page.goto('/dev/smart-questions?component=photoLabeler&photos=4');
      
      // Label some photos
      await page.locator('[data-testid="photo-0"]').click();
      await page.getByRole('button', { name: 'Before & After' }).click();
      
      await page.locator('[data-testid="photo-1"]').click();
      await page.getByRole('button', { name: 'Completed Project' }).click();
      
      await expect(page.locator('[data-testid="photo-labeler"]')).toHaveScreenshot('photo-labeler-labeled.png');
    });

    test('mobile responsive view', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dev/smart-questions?component=photoLabeler&photos=4');
      
      await expect(page.locator('[data-testid="photo-labeler"]')).toHaveScreenshot('photo-labeler-mobile.png');
    });
  });

  test.describe('DifferentiatorSelector Component', () => {
    test('default state with competitor context', async () => {
      await page.goto('/dev/smart-questions?component=differentiatorSelector');
      const component = page.locator('[data-testid="differentiator-selector"]');
      
      await expect(component).toBeVisible();
      await expect(component).toHaveScreenshot('differentiator-selector-default.png');
    });

    test('with selections', async () => {
      await page.goto('/dev/smart-questions?component=differentiatorSelector');
      
      // Make selections
      await page.locator('[data-value="eco-friendly"]').click();
      await page.locator('[data-value="certified"]').click();
      await page.locator('[data-value="24-7"]').click();
      
      await expect(page.locator('[data-testid="differentiator-selector"]')).toHaveScreenshot('differentiator-selector-selected.png');
    });

    test('hover states', async () => {
      await page.goto('/dev/smart-questions?component=differentiatorSelector');
      
      await page.locator('[data-value="eco-friendly"]').hover();
      await expect(page.locator('[data-testid="differentiator-selector"]')).toHaveScreenshot('differentiator-selector-hover.png');
    });

    test('max selection warning', async () => {
      await page.goto('/dev/smart-questions?component=differentiatorSelector');
      
      // Select maximum (5)
      const options = await page.locator('[data-testid="differentiator-option"]').all();
      for (const option of options.slice(0, 5)) {
        await option.click();
      }
      
      // Try to select 6th
      await options[5].click();
      
      await expect(page.locator('[data-testid="differentiator-selector"]')).toHaveScreenshot('differentiator-selector-max-warning.png');
    });
  });

  test.describe('SpecializationPicker Component', () => {
    test('default grid view', async () => {
      await page.goto('/dev/smart-questions?component=specializationPicker&industry=landscaping');
      const component = page.locator('[data-testid="specialization-picker"]');
      
      await expect(component).toBeVisible();
      await expect(component).toHaveScreenshot('specialization-picker-default.png');
    });

    test('with search active', async () => {
      await page.goto('/dev/smart-questions?component=specializationPicker&industry=hvac');
      
      await page.getByPlaceholder('Search specializations').fill('energy');
      await page.waitForTimeout(100); // Wait for filter
      
      await expect(page.locator('[data-testid="specialization-picker"]')).toHaveScreenshot('specialization-picker-search.png');
    });

    test('multiple selections with badges', async () => {
      await page.goto('/dev/smart-questions?component=specializationPicker&industry=plumbing');
      
      // Select multiple
      await page.locator('[data-value="tankless"]').click();
      await page.locator('[data-value="hydro-jetting"]').click();
      await page.locator('[data-value="trenchless"]').click();
      
      await expect(page.locator('[data-testid="specialization-picker"]')).toHaveScreenshot('specialization-picker-multi-select.png');
    });

    test('category grouping view', async () => {
      await page.goto('/dev/smart-questions?component=specializationPicker&view=categories');
      
      await expect(page.locator('[data-testid="specialization-picker"]')).toHaveScreenshot('specialization-picker-categories.png');
    });
  });

  test.describe('ClaimVerifier Component', () => {
    test('default with detected claims', async () => {
      await page.goto('/dev/smart-questions?component=claimVerifier');
      const component = page.locator('[data-testid="claim-verifier"]');
      
      await expect(component).toBeVisible();
      await expect(component).toHaveScreenshot('claim-verifier-default.png');
    });

    test('with sources expanded', async () => {
      await page.goto('/dev/smart-questions?component=claimVerifier');
      
      // Expand source details
      await page.getByRole('button', { name: 'Show sources' }).first().click();
      
      await expect(page.locator('[data-testid="claim-verifier"]')).toHaveScreenshot('claim-verifier-sources.png');
    });

    test('partially verified state', async () => {
      await page.goto('/dev/smart-questions?component=claimVerifier');
      
      // Verify some claims
      await page.locator('[data-claim="licensed"]').click();
      await page.locator('[data-claim="insured"]').click();
      
      await expect(page.locator('[data-testid="claim-verifier"]')).toHaveScreenshot('claim-verifier-partial.png');
    });
  });

  test.describe('Question Flow Layout', () => {
    test('question with progress indicator', async () => {
      await page.goto('/dev/smart-questions?flow=true&question=1&total=6');
      
      await expect(page.locator('[data-testid="question-flow"]')).toHaveScreenshot('question-flow-layout.png');
    });

    test('question with help tooltip', async () => {
      await page.goto('/dev/smart-questions?flow=true&help=true');
      
      // Hover help icon
      await page.locator('[data-testid="help-icon"]').hover();
      await page.waitForTimeout(100); // Wait for tooltip
      
      await expect(page.locator('[data-testid="question-flow"]')).toHaveScreenshot('question-flow-help.png');
    });

    test('question with competitive insight sidebar', async () => {
      await page.goto('/dev/smart-questions?flow=true&insights=true');
      
      await expect(page.locator('[data-testid="question-flow"]')).toHaveScreenshot('question-flow-insights.png');
    });

    test('final review screen', async () => {
      await page.goto('/dev/smart-questions?flow=review');
      
      await expect(page.locator('[data-testid="review-screen"]')).toHaveScreenshot('question-flow-review.png');
    });
  });

  test.describe('Theme Variations', () => {
    test('dark mode support', async () => {
      await page.goto('/dev/smart-questions?theme=dark');
      
      // Test each component in dark mode
      const components = ['photoLabeler', 'differentiatorSelector', 'specializationPicker', 'claimVerifier'];
      
      for (const component of components) {
        await page.goto(`/dev/smart-questions?component=${component}&theme=dark`);
        await expect(page.locator(`[data-testid="${component}"]`)).toHaveScreenshot(`${component}-dark.png`);
      }
    });

    test('high contrast mode', async () => {
      await page.goto('/dev/smart-questions?theme=high-contrast');
      
      await expect(page.locator('[data-testid="photo-labeler"]')).toHaveScreenshot('components-high-contrast.png');
    });
  });

  test.describe('Loading and Error States', () => {
    test('loading state', async () => {
      await page.goto('/dev/smart-questions?state=loading');
      
      await expect(page.locator('[data-testid="loading-state"]')).toHaveScreenshot('question-loading.png');
    });

    test('error state', async () => {
      await page.goto('/dev/smart-questions?state=error');
      
      await expect(page.locator('[data-testid="error-state"]')).toHaveScreenshot('question-error.png');
    });

    test('empty state', async () => {
      await page.goto('/dev/smart-questions?component=photoLabeler&photos=0');
      
      await expect(page.locator('[data-testid="photo-labeler"]')).toHaveScreenshot('photo-labeler-empty.png');
    });
  });

  test.describe('Accessibility Visual Indicators', () => {
    test('focus states', async () => {
      await page.goto('/dev/smart-questions?component=differentiatorSelector');
      
      // Tab through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      await expect(page.locator('[data-testid="differentiator-selector"]')).toHaveScreenshot('component-focus-states.png');
    });

    test('keyboard navigation indicators', async () => {
      await page.goto('/dev/smart-questions?component=specializationPicker');
      
      // Navigate with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('ArrowRight');
      
      await expect(page.locator('[data-testid="specialization-picker"]')).toHaveScreenshot('component-keyboard-nav.png');
    });
  });
});