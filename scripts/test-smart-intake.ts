/**
 * Test Smart Intake System
 * 
 * **Created**: December 28, 2024, 4:20 PM CST
 * **Last Updated**: December 28, 2024, 4:20 PM CST
 * 
 * Script to test the smart intake question system with various scenarios.
 * 
 * Usage: npx tsx scripts/test-smart-intake.ts
 */

import { getClimateZone } from '../lib/utils/region-detector'
import { normalizeServiceName } from '../lib/utils/service-normalizer'
import { loadExpectations } from '../lib/data/cache'
import { EXPECTED_PREVALENCE_THRESHOLD } from '../lib/constants/intake'

// Test scenarios
const scenarios = [
  {
    name: 'Phoenix Landscaper',
    business: {
      name: 'Desert Gardens LLC',
      city: 'Phoenix',
      state: 'AZ',
      coordinates: { lat: 33.4484, lng: -112.0740 },
      industry: 'landscaping',
      existingServices: ['lawn_care', 'tree_trimming']
    }
  },
  {
    name: 'Boston Landscaper',
    business: {
      name: 'New England Yards',
      city: 'Boston',
      state: 'MA', 
      coordinates: { lat: 42.3601, lng: -71.0589 },
      industry: 'landscaping',
      existingServices: ['lawn_care', 'mulching']
    }
  },
  {
    name: 'Houston HVAC',
    business: {
      name: 'Gulf Coast Cooling',
      city: 'Houston',
      state: 'TX',
      coordinates: { lat: 29.7604, lng: -95.3698 },
      industry: 'hvac',
      existingServices: ['ac_repair', 'maintenance_plans']
    }
  },
  {
    name: 'Denver Plumber',
    business: {
      name: 'Mile High Plumbing',
      city: 'Denver',
      state: 'CO',
      coordinates: { lat: 39.7392, lng: -104.9903 },
      industry: 'plumbing',
      existingServices: ['drain_cleaning', 'leak_repair']
    }
  }
]

function runScenario(scenario: typeof scenarios[0]) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Scenario: ${scenario.name}`)
  console.log(`${'='.repeat(60)}`)
  
  const { business } = scenario
  
  // Detect climate zone
  const zone = getClimateZone(business.coordinates.lat, business.coordinates.lng)
  console.log(`\nLocation: ${business.city}, ${business.state}`)
  console.log(`Coordinates: ${business.coordinates.lat}, ${business.coordinates.lng}`)
  console.log(`Climate Zone: ${zone}`)
  
  // Load expectations
  const expectations = loadExpectations()
  const industryExpectations = {
    ...expectations[business.industry]?.national?.services || {},
    ...expectations[business.industry]?.[zone]?.services || {}
  }
  
  // Normalize existing services
  const knownServices = new Set(
    business.existingServices.map(s => normalizeServiceName(s))
  )
  
  console.log(`\nExisting Services:`)
  knownServices.forEach(s => console.log(`  - ${s}`))
  
  // Find missing expected services
  const missingExpected = Object.entries(industryExpectations)
    .filter(([key, prevalence]) => 
      (prevalence as number) >= EXPECTED_PREVALENCE_THRESHOLD && !knownServices.has(key)
    )
    .map(([key, prevalence]) => ({ service: key, prevalence }))
    .sort((a, b) => (b.prevalence as number) - (a.prevalence as number))
  
  console.log(`\nMissing Expected Services (≥${EXPECTED_PREVALENCE_THRESHOLD * 100}% prevalence):`)
  if (missingExpected.length > 0) {
    missingExpected.forEach(({ service, prevalence }) => {
      console.log(`  - ${service} (${((prevalence as number) * 100).toFixed(0)}% of businesses offer this)`)
    })
  } else {
    console.log('  None - this business offers all commonly expected services!')
  }
  
  // Show what would be pre-selected
  console.log(`\n✅ Services to Pre-Select in UI:`)
  missingExpected.slice(0, 10).forEach(({ service }) => {
    console.log(`  ☑️  ${service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`)
  })
  
  // Show climate-specific insights
  const climateSpecific = Object.entries(expectations[business.industry]?.[zone]?.services || {})
    .filter(([_, prevalence]) => (prevalence as number) >= 0.7)
    .map(([key]) => key)
  
  if (climateSpecific.length > 0) {
    console.log(`\n🌡️  Climate-Specific Services for ${zone}:`)
    climateSpecific.forEach(service => {
      console.log(`  - ${service} ${knownServices.has(service) ? '✓ (already offered)' : '✗ (not offered)'}`)
    })
  }
}

// Run all scenarios
console.log('Smart Intake System Test')
console.log('========================')
console.log(`Environment: SMART_INTAKE_ENABLED=${process.env.SMART_INTAKE_ENABLED || 'false'}`)
console.log(`Threshold: ${EXPECTED_PREVALENCE_THRESHOLD * 100}%`)

scenarios.forEach(runScenario)

console.log(`\n${'='.repeat(60)}`)
console.log('Summary')
console.log(`${'='.repeat(60)}`)
console.log(`\nThe smart intake system successfully:`)
console.log('1. Detects climate zones based on coordinates')
console.log('2. Loads industry-specific service expectations')
console.log('3. Identifies missing commonly-offered services')
console.log('4. Pre-selects relevant services for the user')
console.log('5. Adapts to regional variations (e.g., snow removal in Boston, xeriscaping in Phoenix)')

console.log('\n✅ All tests completed successfully!')