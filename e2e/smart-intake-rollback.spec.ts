/**
 * Smart Intake Rollback Test
 * 
 * **Created**: June 28, 2025, 4:20 PM CST
 * **Last Updated**: June 28, 2025, 4:20 PM CST
 * 
 * Tests that the system works correctly when SMART_INTAKE_ENABLED=false
 */

describe('Smart Intake Rollback', () => {
  it('should render standard questions when SMART_INTAKE_ENABLED=false', () => {
    // Mock environment variable
    cy.visit('/onboarding/enhance', {
      onBeforeLoad(win) {
        // Override the environment variable
        win.process = { 
          env: { 
            SMART_INTAKE_ENABLED: 'false',
            NEXT_PUBLIC_SMART_INTAKE_ENABLED: 'false'
          } 
        }
      }
    })
    
    // Wait for questions to load
    cy.contains('Select your top').should('be.visible')
    
    // Verify no pre-checked services
    cy.get('input[type="checkbox"][checked]').should('not.exist')
    
    // Verify standard service grid without enhancements
    cy.get('[data-testid="service-grid"]').within(() => {
      // All checkboxes should be unchecked by default
      cy.get('input[type="checkbox"]').each(($checkbox) => {
        cy.wrap($checkbox).should('not.be.checked')
      })
    })
  })
  
  it('should show pre-selected services when SMART_INTAKE_ENABLED=true', () => {
    // Mock environment variable
    cy.visit('/onboarding/enhance', {
      onBeforeLoad(win) {
        // Override the environment variable
        win.process = { 
          env: { 
            SMART_INTAKE_ENABLED: 'true',
            NEXT_PUBLIC_SMART_INTAKE_ENABLED: 'true'
          } 
        }
      }
    })
    
    // Fill in business info that would trigger Phoenix detection
    cy.get('[name="businessName"]').type('Desert Landscaping LLC')
    cy.get('[name="city"]').type('Phoenix')
    cy.get('[name="state"]').select('AZ')
    
    // Continue to questions
    cy.contains('Continue').click()
    
    // Wait for questions to load
    cy.contains('Select your top').should('be.visible')
    
    // Verify some services are pre-checked (xeriscaping for Phoenix)
    cy.get('input[type="checkbox"][checked]').should('exist')
    
    // Verify expected services for Phoenix are checked
    cy.get('[data-testid="service-xeriscaping"]').should('be.checked')
    cy.get('[data-testid="service-drip_irrigation"]').should('be.checked')
    
    // Verify non-relevant services are not checked
    cy.get('[data-testid="service-snow_removal"]').should('not.exist')
  })
})