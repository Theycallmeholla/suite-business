/**
 * Test Smart Intake Questions
 * 
 * **Created**: June 28, 2025, 6:40 PM CST
 * **Last Updated**: June 28, 2025, 6:40 PM CST
 * 
 * Test page to demonstrate the smart intake questions functionality
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, MapPin, CheckCircle2 } from 'lucide-react'

// Test scenarios
const scenarios = [
  {
    name: 'Phoenix Landscaper',
    intelligenceId: 'test-phoenix',
    industry: 'landscaping',
    coordinates: { lat: 33.4484, lng: -112.0740 },
    gbpData: {
      name: 'Desert Gardens LLC',
      coordinates: { lat: 33.4484, lng: -112.0740 },
      primaryCategory: {
        serviceTypes: [
          { displayName: 'Lawn Care' },
          { displayName: 'Tree Trimming' }
        ]
      }
    }
  },
  {
    name: 'Boston Landscaper',
    intelligenceId: 'test-boston',
    industry: 'landscaping',
    coordinates: { lat: 42.3601, lng: -71.0589 },
    gbpData: {
      name: 'New England Yards',
      coordinates: { lat: 42.3601, lng: -71.0589 },
      primaryCategory: {
        serviceTypes: [
          { displayName: 'Lawn Care' },
          { displayName: 'Mulching' }
        ]
      }
    }
  },
  {
    name: 'Houston HVAC',
    intelligenceId: 'test-houston',
    industry: 'hvac',
    coordinates: { lat: 29.7604, lng: -95.3698 },
    gbpData: {
      name: 'Gulf Coast Cooling',
      coordinates: { lat: 29.7604, lng: -95.3698 },
      primaryCategory: {
        serviceTypes: [
          { displayName: 'AC Repair' },
          { displayName: 'Maintenance Plans' }
        ]
      }
    }
  }
]

export default function TestSmartIntakePage() {
  const [selectedScenario, setSelectedScenario] = useState(0)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [featureEnabled, setFeatureEnabled] = useState<boolean | null>(null)
  
  // Check if feature is enabled
  useEffect(() => {
    // Resilient fallback for client-side env check
    const value =
      process.env.NEXT_PUBLIC_SMART_INTAKE_ENABLED ??
      (typeof window !== 'undefined'
        ? (window as any).__NEXT_DATA__?.props?.env?.NEXT_PUBLIC_SMART_INTAKE_ENABLED
        : 'false')

    setFeatureEnabled(value === 'true')
    
    // Debug logging
    console.log('Smart Intake Enabled Check:', {
      processEnv: process.env.NEXT_PUBLIC_SMART_INTAKE_ENABLED,
      windowEnv: (window as any).__NEXT_DATA__?.props?.env?.NEXT_PUBLIC_SMART_INTAKE_ENABLED,
      final: value,
      enabled: value === 'true'
    })
  }, [])
  
  const testScenario = async () => {
    setLoading(true)
    setError(null)
    setQuestions([])
    
    const scenario = scenarios[selectedScenario]
    
    try {
      // First, create the intelligence record
      const analyzeResponse = await fetch('/api/intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: scenario.gbpData.name,
          gbpData: scenario.gbpData,
          placeId: `test-place-${scenario.intelligenceId}`
        })
      })
      
      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze business data')
      }
      
      const { intelligenceId, dataScore } = await analyzeResponse.json()
      
      // Now get the questions
      const questionsResponse = await fetch('/api/intelligence/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intelligenceId,
          industry: scenario.industry,
          dataScore,
          missingData: ['services']
        })
      })
      
      if (!questionsResponse.ok) {
        throw new Error('Failed to generate questions')
      }
      
      const { questions: generatedQuestions } = await questionsResponse.json()
      setQuestions(generatedQuestions)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const currentScenario = scenarios[selectedScenario]
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Smart Intake Questions</CardTitle>
          <CardDescription>
            See how questions are pre-selected based on location and industry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feature Status */}
          <Alert>
            <AlertDescription>
              Smart Intake is currently: {' '}
              <span className={`font-bold ${featureEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {featureEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
              {!featureEnabled && (
                <span className="block mt-2 text-sm">
                  Set SMART_INTAKE_ENABLED=true in your .env.local and restart the server
                </span>
              )}
            </AlertDescription>
          </Alert>
          
          {/* Scenario Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Select Test Scenario:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {scenarios.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedScenario(index)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedScenario === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {scenario.coordinates.lat.toFixed(2)}, {scenario.coordinates.lng.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Current Scenario Details */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <h4 className="font-medium mb-2">Scenario Details:</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Business:</strong> {currentScenario.gbpData.name}</div>
                <div><strong>Industry:</strong> {currentScenario.industry}</div>
                <div><strong>Existing Services:</strong></div>
                <ul className="ml-4 list-disc">
                  {currentScenario.gbpData.primaryCategory.serviceTypes.map((s, i) => (
                    <li key={i}>{s.displayName}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* Test Button */}
          <Button 
            onClick={testScenario} 
            disabled={loading || !featureEnabled}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Smart Intake Questions'
            )}
          </Button>
          
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Questions Display */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Generated Questions:</h3>
              {questions.map((question, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-3">{question.question}</h4>
                    {question.type === 'service-grid' && question.options && (
                      <div className="grid grid-cols-2 gap-3">
                        {question.options.map((option: any, i: number) => (
                          <div key={i} className="flex items-center space-x-2">
                            <Checkbox 
                              checked={option.checked || false}
                              disabled
                            />
                            <label className="text-sm">
                              {option.label}
                              {option.checked && (
                                <CheckCircle2 className="h-3 w-3 text-green-600 inline ml-2" />
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === 'service-grid' && (
                      <div className="mt-3 text-sm text-gray-600">
                        Pre-selected services are marked with a check and green icon
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}