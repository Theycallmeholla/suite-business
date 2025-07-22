/**
 * E2E Tests for Enhanced Site Generation User Journey
 * 
 * Tests the complete user flow from business selection to site creation
 */

import { test, expect, Page } from '@playwright/test';
import { TestDataFactory } from '../../utils/test-data-factory';
import { MOCK_PLACE_IDS } from '../../utils/api-mocks';

test.describe('Enhanced Site Generation User Journey', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Mock API responses
    await page.route('**/api/gbp/search*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              place_id: MOCK_PLACE_IDS.valid.high,
              name: 'Premier Lawn & Landscape',
              formatted_address: '123 Main St, Houston, TX 77001',
              rating: 4.9,
              user_ratings_total: 342
            }
          ]
        })
      });
    });

    await page.route('**/api/sites/create-from-gbp-enhanced*', async route => {
      const request = route.request();
      const body = request.postDataJSON();
      
      if (body.generateQuestionsOnly) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            questions: [
              {
                id: '1',
                question: 'Help us showcase your work',
                type: 'photoLabeler',
                category: 'content',
                metadata: { photoCount: 8 }
              },
              {
                id: '2',
                question: 'What makes you different?',
                type: 'differentiatorSelector',
                category: 'positioning',
                options: [
                  { value: 'eco-friendly', label: 'Eco-Friendly Practices', icon: '🌿' },
                  { value: 'certified', label: 'Certified Professionals', icon: '✅' },
                  { value: '24-7', label: '24/7 Emergency Service', icon: '🚨' }
                ]
              },
              {
                id: '3',
                question: 'What are your specializations?',
                type: 'specializationPicker',
                category: 'services',
                options: [
                  { value: 'native-plants', label: 'Native Plant Specialist' },
                  { value: 'water-conservation', label: 'Water Conservation Expert' }
                ]
              }
            ],
            insights: {
              overallQuality: 0.75,
              businessName: 'Premier Lawn & Landscape'
            }
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            site: {
              id: 'test-site-123',
              subdomain: 'premier-lawn',
              url: 'https://premier-lawn.sitebango.com'
            }
          })
        });
      }
    });
  });

  test('complete flow from business search to site creation', async () => {
    // Step 1: Navigate to site creation
    await page.goto('/dashboard/sites/create');
    
    // Step 2: Choose enhanced creation option
    await expect(page.getByText('Enhanced Site Creation')).toBeVisible();
    await page.getByRole('button', { name: 'Enhanced (Beta)' }).click();
    
    // Step 3: Search for business
    await expect(page.getByText('Search for your business')).toBeVisible();
    await page.getByPlaceholder('Enter business name').fill('Premier Lawn');
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Step 4: Select business from results
    await expect(page.getByText('Premier Lawn & Landscape')).toBeVisible();
    await expect(page.getByText('4.9 ⭐ (342 reviews)')).toBeVisible();
    await page.getByRole('button', { name: 'Select This Business' }).click();
    
    // Step 5: View question summary
    await expect(page.getByText('Only 3 questions needed!')).toBeVisible();
    await expect(page.getByText('Estimated time: 2-3 minutes')).toBeVisible();
    await page.getByRole('button', { name: 'Start Questions' }).click();
    
    // Step 6: Answer photo labeling question
    await expect(page.getByText('Help us showcase your work')).toBeVisible();
    await expect(page.locator('[data-testid="photo-labeler"]')).toBeVisible();
    
    // Label first photo
    await page.locator('[data-testid="photo-0"]').click();
    await page.getByRole('button', { name: 'Before & After' }).click();
    await page.getByPlaceholder('Add description').fill('Complete backyard transformation');
    
    await page.getByRole('button', { name: 'Next' }).click();
    
    // Step 7: Answer differentiator question
    await expect(page.getByText('What makes you different?')).toBeVisible();
    await page.locator('[data-value="eco-friendly"]').click();
    await page.locator('[data-value="certified"]').click();
    await page.getByRole('button', { name: 'Next' }).click();
    
    // Step 8: Answer specialization question
    await expect(page.getByText('What are your specializations?')).toBeVisible();
    await page.locator('[data-value="native-plants"]').click();
    await page.locator('[data-value="water-conservation"]').click();
    await page.getByRole('button', { name: 'Create Site' }).click();
    
    // Step 9: View success
    await expect(page.getByText('Site Created Successfully!')).toBeVisible();
    await expect(page.getByText('premier-lawn.sitebango.com')).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Site' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go to Dashboard' })).toBeVisible();
  });

  test('handles partial data gracefully', async () => {
    // Mock business with no photos
    await page.route('**/api/sites/create-from-gbp-enhanced*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          questions: [
            {
              id: '1',
              question: 'Tell us about your business',
              type: 'text',
              category: 'basic'
            },
            {
              id: '2',
              question: 'What services do you offer?',
              type: 'multiselect',
              category: 'services'
            }
          ],
          insights: {
            overallQuality: 0.30,
            missingData: ['photos', 'reviews', 'description']
          }
        })
      });
    });

    await page.goto('/dashboard/sites/create-enhanced');
    
    // Should show data quality warning
    await expect(page.getByText('Limited data available')).toBeVisible();
    await expect(page.getByText('We\'ll need a bit more information')).toBeVisible();
  });

  test('saves progress and allows resuming', async () => {
    // Start the flow
    await page.goto('/dashboard/sites/create-enhanced');
    await page.getByPlaceholder('Enter business name').fill('Test Business');
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Answer first question
    await page.getByRole('button', { name: 'Start Questions' }).click();
    await page.getByRole('button', { name: 'Save & Exit' }).click();
    
    // Verify saved state
    await expect(page.getByText('Progress saved')).toBeVisible();
    
    // Navigate away and come back
    await page.goto('/dashboard');
    await page.goto('/dashboard/sites/create-enhanced');
    
    // Should show resume option
    await expect(page.getByText('Resume where you left off?')).toBeVisible();
    await page.getByRole('button', { name: 'Resume' }).click();
    
    // Should be back at the question
    await expect(page.getByText('Question 1 of')).toBeVisible();
  });

  test('validates required fields before proceeding', async () => {
    await page.goto('/dashboard/sites/create-enhanced');
    
    // Try to search without entering business name
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('Please enter a business name')).toBeVisible();
    
    // Start questions and try to proceed without answering
    await page.getByPlaceholder('Enter business name').fill('Test');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByRole('button', { name: 'Start Questions' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    
    await expect(page.getByText('Please answer this question')).toBeVisible();
  });

  test('shows competitive insights during flow', async () => {
    await page.goto('/dashboard/sites/create-enhanced');
    
    // Mock response with competitive data
    await page.route('**/api/sites/create-from-gbp-enhanced*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          questions: [],
          insights: {
            competitiveAnalysis: {
              marketPosition: 'premium',
              topCompetitors: ['GreenThumb Landscaping', 'Elite Gardens'],
              differentiationOpportunities: [
                'Only EPA certified in area',
                'Specialize in native plants'
              ]
            }
          }
        })
      });
    });
    
    // Should display competitive insights
    await expect(page.getByText('Market Position: Premium')).toBeVisible();
    await expect(page.getByText('Key Opportunities')).toBeVisible();
  });
});

test.describe('Question Component Interactions', () => {
  test('PhotoLabeler component functionality', async ({ page }) => {
    await page.goto('/dev/smart-questions');
    
    const photoLabeler = page.locator('[data-testid="photo-labeler"]');
    await expect(photoLabeler).toBeVisible();
    
    // Test drag and drop
    const photo1 = page.locator('[data-testid="photo-1"]');
    const beforeAfterLabel = page.locator('[data-label="Before & After"]');
    
    await photo1.dragTo(beforeAfterLabel);
    await expect(photo1).toHaveAttribute('data-labeled', 'true');
    
    // Test custom label
    await page.locator('[data-testid="photo-2"]').click();
    await page.getByRole('button', { name: 'Custom Label' }).click();
    await page.getByPlaceholder('Enter custom label').fill('Award winning design');
    await page.getByRole('button', { name: 'Apply' }).click();
    
    await expect(page.locator('[data-testid="photo-2-label"]')).toContainText('Award winning design');
  });

  test('DifferentiatorSelector with competitive context', async ({ page }) => {
    await page.goto('/dev/smart-questions');
    
    const selector = page.locator('[data-testid="differentiator-selector"]');
    await expect(selector).toBeVisible();
    
    // Should show competitor comparison
    await expect(page.getByText('Your competitors offer:')).toBeVisible();
    await expect(page.getByText('Select what makes you unique')).toBeVisible();
    
    // Select differentiators
    await page.locator('[data-value="certified"]').click();
    await expect(page.locator('[data-value="certified"]')).toHaveClass(/selected/);
    
    // Should enforce max selection
    const options = await page.locator('[data-testid="differentiator-option"]').all();
    for (const option of options.slice(0, 5)) {
      await option.click();
    }
    
    // 6th click should show warning
    await options[5].click();
    await expect(page.getByText('Maximum 5 selections')).toBeVisible();
  });

  test('SpecializationPicker with search', async ({ page }) => {
    await page.goto('/dev/smart-questions');
    
    const picker = page.locator('[data-testid="specialization-picker"]');
    await expect(picker).toBeVisible();
    
    // Test search functionality
    await page.getByPlaceholder('Search specializations').fill('native');
    await expect(page.locator('[data-value="native-plants"]')).toBeVisible();
    await expect(page.locator('[data-value="water-conservation"]')).not.toBeVisible();
    
    // Clear search and select multiple
    await page.getByPlaceholder('Search specializations').clear();
    await page.locator('[data-value="native-plants"]').click();
    await page.locator('[data-value="xeriscaping"]').click();
    
    // Verify selections
    const selected = await page.locator('[data-selected="true"]').count();
    expect(selected).toBe(2);
  });

  test('Progress indicator accuracy', async ({ page }) => {
    await page.goto('/dashboard/sites/create-enhanced');
    
    // Mock 6 questions
    await page.route('**/api/sites/create-from-gbp-enhanced*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          questions: Array(6).fill(null).map((_, i) => ({
            id: String(i),
            question: `Question ${i + 1}`,
            type: 'text'
          }))
        })
      });
    });
    
    await page.getByRole('button', { name: 'Start Questions' }).click();
    
    // Check initial progress
    await expect(page.getByText('Question 1 of 6')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('data-progress', '0');
    
    // Answer and proceed
    await page.getByRole('textbox').fill('Answer 1');
    await page.getByRole('button', { name: 'Next' }).click();
    
    // Check updated progress
    await expect(page.getByText('Question 2 of 6')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('data-progress', '17');
  });
});