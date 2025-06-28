/**
 * Generate Business Plan utility function
 */

export interface BusinessPlanData {
  industry: string
  businessId: string
  answers: Record<string, any>
}

export function generateBusinessPlan(data: BusinessPlanData): string {
  // Temporary implementation
  return `
# Business Plan

## Industry: ${data.industry}

## Summary
This is a placeholder business plan. The actual implementation will generate a comprehensive business plan based on the collected data.

## Next Steps
1. Complete the implementation
2. Add AI-powered content generation
3. Format the output properly
  `.trim()
}
