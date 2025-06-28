/**
 * Smart Intake Metrics Dashboard Component
 * 
 * **Created**: June 28, 2025, 4:30 PM CST
 * **Last Updated**: June 28, 2025, 4:30 PM CST
 * 
 * Displays analytics for the smart intake question system.
 * Shows average questions per onboarding and adoption rate.
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SmartIntakeMetrics {
  avgQuestionsBeforeIntake: number
  avgQuestionsWithIntake: number
  adoptionRate: number
  climateBreakdown: Record<string, number>
  industryBreakdown: Record<string, number>
  expectationsVersion: string
}

export function SmartIntakeMetrics() {
  const [metrics, setMetrics] = useState<SmartIntakeMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/analytics/smart-intake')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error('Failed to fetch smart intake metrics:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMetrics()
  }, [])
  
  if (loading) {
    return <div>Loading metrics...</div>
  }
  
  if (!metrics) {
    return null
  }
  
  const questionReduction = Math.round(
    ((metrics.avgQuestionsBeforeIntake - metrics.avgQuestionsWithIntake) / 
     metrics.avgQuestionsBeforeIntake) * 100
  )
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Question Reduction</CardTitle>
          <CardDescription>Impact of smart intake on onboarding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {questionReduction}% fewer questions
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            From {metrics.avgQuestionsBeforeIntake.toFixed(1)} to {metrics.avgQuestionsWithIntake.toFixed(1)} questions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Adoption Rate</CardTitle>
          <CardDescription>Users with smart intake enabled</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(metrics.adoptionRate * 100).toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Expectations v{metrics.expectationsVersion}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Climate Zones</CardTitle>
          <CardDescription>Distribution of users by climate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(metrics.climateBreakdown).map(([zone, count]) => (
              <div key={zone} className="flex justify-between text-sm">
                <span>{zone.replace('CLIMATE_', '')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}