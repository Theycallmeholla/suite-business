/**
 * Test Smart Wins - Enhanced Question Suppression
 * 
 * **Created**: June 28, 2025, 9:45 PM CST
 * **Last Updated**: June 28, 2025, 9:45 PM CST
 * 
 * Test page to demonstrate the enhanced smart intake with question suppression
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MapPin, CheckCircle2, Info, Sparkles, Building2 } from 'lucide-react'

// Test scenarios with enhanced data
const scenarios = [
  {
    name: 'Phoenix Landscaper (Full Data)',
    intelligenceId: 'test-phoenix-full',
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
      },
      // Enhanced data for suppression
      serviceArea: {
        polygon: {
          coordinates: [
            { latitude: 33.5484, longitude: -112.1740 },
            { latitude: 33.5484, longitude: -111.9740 },
            { latitude: 33.3484, longitude: -111.9740 },
            { latitude: 33.3484, longitude: -112.1740 }
          ]
        }
      },
      metadata: {
        establishedDate: '2010'
      },
      phoneNumbers: {
        primaryPhone: '+1 (602) 555-0123'
      },
      websiteUri: 'https://desertgardens.com',
      regularHours: {
        periods: [
          { openDay: 'MONDAY', openTime: '08:00', closeDay: 'MONDAY', closeTime: '17:00' }
        ]
      }
    }
  },
  {
    name: 'Boston HVAC (Partial Data)',
    intelligenceId: 'test-boston-partial',
    industry: 'hvac',
    coordinates: { lat: 42.3601, lng: -71.0589 },
    gbpData: {
      name: 'New England Heating & Cooling',
      coordinates: { lat: 42.3601, lng: -71.0589 },
      primaryCategory: {
        serviceTypes: [
          { displayName: 'Heating Installation' },
          { displayName: 'AC Repair' }
        ]
      },
      // Partial data - no service area or established date
      phoneNumbers: {
        primaryPhone: '+1 (617) 555-0456'
      },
      description: 'Family-owned HVAC company serving Boston since 1985. We specialize in energy-efficient heating and cooling solutions.'
    }
  },
  {
    name: 'Houston Plumber (Minimal Data)',
    intelligenceId: 'test-houston-minimal',
    industry: 'plumbing',
    coordinates: { lat: 29.7604, lng: -95.3698 },
    gbpData: {
      name: 'Gulf Coast Plumbing',
      coordinates: { lat: 29.7604, lng: -95.3698 },
      primaryCategory: {
        serviceTypes: [
          { displayName: 'Emergency Plumbing' }
        ]
      }
      // Minimal data - most questions should appear
    }
  }
]

export default function TestSmartWinsPage() {
  const [selectedScenario, setSelectedScenario] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [locationId, setLocationId] = useState<string>('')
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [realLocationData, setRealLocationData] = useState<any>(null)
  
  const fetchRealLocation = async () => {
    if (!locationId.trim()) {
      setError('Please enter a location ID')
      return
    }
    
    setLoadingLocation(true)
    setError(null)
    setRealLocationData(null)
    setResult(null)
    
    try {
      // Fetch the real GBP location data
      const locationResponse = await fetch(`/api/gbp/location/${encodeURIComponent(locationId)}`)
      
      if (!locationResponse.ok) {
        const errorData = await locationResponse.json()
        throw new Error(errorData.error || 'Failed to fetch location data')
      }
      
      const locationData = await locationResponse.json()
      setRealLocationData(locationData)
      
      // Now run the smart intake pipeline with real data
      const analyzeResponse = await fetch('/api/intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: locationData.title || locationData.name,
          gbpData: locationData,
          placeId: locationData.name || locationId
        })
      })
      
      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze business data')
      }
      
      const { intelligenceId, dataScore } = await analyzeResponse.json()
      
      // Determine industry from categories
      const industry = detectIndustryFromCategories(locationData.categories)
      
      // Get the questions
      const questionsResponse = await fetch('/api/intelligence/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intelligenceId,
          industry,
          dataScore,
          missingData: ['services']
        })
      })
      
      if (!questionsResponse.ok) {
        throw new Error('Failed to generate questions')
      }
      
      const { questions: generatedQuestions } = await questionsResponse.json()
      
      // Calculate what was extracted/suppressed from real data
      const extractedData = {
        serviceRadius: locationData.serviceArea ? 'Calculated from service area' : 'Not available',
        yearsInBusiness: locationData.metadata?.establishedDate ? 
          `${new Date().getFullYear() - parseInt(locationData.metadata.establishedDate)} years` : 
          locationData.profile?.description?.match(/since (\d{4})/i) ? 'Extracted from description' : 'Not found',
        phoneNumber: locationData.phoneNumbers?.primaryPhone ? 'Available' : 'Missing',
        businessHours: locationData.regularHours ? 'Available' : 'Missing',
        website: locationData.websiteUri ? 'Available' : 'Missing',
        address: locationData.storefrontAddress ? 'Available' : 'Service area only'
      }
      
      setResult({
        scenario: `Real Location: ${locationData.title || locationData.name}`,
        questionsGenerated: generatedQuestions,
        extractedData,
        questionCount: generatedQuestions.length,
        isRealData: true
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoadingLocation(false)
    }
  }
  
  const detectIndustryFromCategories = (categories: any): string => {
    if (!categories) return 'general'
    
    const categoryString = JSON.stringify(categories).toLowerCase()
    
    if (categoryString.includes('landscap') || categoryString.includes('lawn')) return 'landscaping'
    if (categoryString.includes('hvac') || categoryString.includes('heating') || categoryString.includes('cooling')) return 'hvac'
    if (categoryString.includes('plumb')) return 'plumbing'
    if (categoryString.includes('clean')) return 'cleaning'
    if (categoryString.includes('roof')) return 'roofing'
    if (categoryString.includes('electric')) return 'electrical'
    
    return 'general'
  }
  
  const testScenario = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setRealLocationData(null)
    
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
      
      // Calculate what was extracted/suppressed
      const extractedData = {
        serviceRadius: scenario.gbpData.serviceArea ? 'Calculated from polygon' : 'Not available',
        yearsInBusiness: scenario.gbpData.metadata?.establishedDate ? 
          `${new Date().getFullYear() - parseInt(scenario.gbpData.metadata.establishedDate)} years` : 
          scenario.gbpData.description?.match(/since (\d{4})/i) ? 'Extracted from description' : 'Not found',
        phoneNumber: scenario.gbpData.phoneNumbers?.primaryPhone ? 'Available' : 'Missing',
        businessHours: scenario.gbpData.regularHours ? 'Available' : 'Missing'
      }
      
      setResult({
        scenario: scenario.name,
        questionsGenerated: generatedQuestions,
        extractedData,
        questionCount: generatedQuestions.length
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const currentScenario = scenarios[selectedScenario]
  
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Test Smart Wins - Question Suppression
          </CardTitle>
          <CardDescription>
            See how intelligent data extraction reduces the number of questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Real Location Input */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <Label htmlFor="locationId" className="text-base font-semibold text-blue-900">
                    Test with Real GBP Location
                  </Label>
                  <p className="text-sm text-blue-700 mt-1 mb-3">
                    Enter a Google Business Profile location ID to test with real data
                  </p>
                  <div className="flex gap-2">
                    <Input
                      id="locationId"
                      type="text"
                      placeholder="e.g., accounts/123/locations/456"
                      value={locationId}
                      onChange={(e) => setLocationId(e.target.value)}
                      className="flex-1 bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          fetchRealLocation()
                        }
                      }}
                    />
                    <Button 
                      onClick={fetchRealLocation}
                      disabled={loadingLocation || !locationId.trim()}
                      variant="default"
                    >
                      {loadingLocation ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        'Fetch Location'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {realLocationData && (
                <Alert className="mt-4 border-blue-200 bg-blue-100/50">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong>Loaded:</strong> {realLocationData.title || realLocationData.name}
                    {realLocationData.categories?.[0]?.displayName && (
                      <span className="text-gray-600"> • {realLocationData.categories[0].displayName}</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or use test scenarios</span>
            </div>
          </div>
          
          {/* Scenario Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Select Test Scenario:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {scenarios.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedScenario(index)}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    selectedScenario === index
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {scenario.industry}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {scenario.name.includes('Full') && '✅ Most data available'}
                    {scenario.name.includes('Partial') && '⚡ Some data available'}
                    {scenario.name.includes('Minimal') && '❌ Limited data'}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Data Preview */}
          {!realLocationData && (
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Available Data:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <strong>Service Area:</strong>{' '}
                    {currentScenario.gbpData.serviceArea ? '✅ Polygon data' : '❌ Not available'}
                  </div>
                  <div>
                    <strong>Established Date:</strong>{' '}
                    {currentScenario.gbpData.metadata?.establishedDate || 
                     (currentScenario.gbpData.description?.includes('since') ? '✅ In description' : '❌ Not available')}
                  </div>
                  <div>
                    <strong>Phone:</strong>{' '}
                    {currentScenario.gbpData.phoneNumbers?.primaryPhone ? '✅ Available' : '❌ Missing'}
                  </div>
                  <div>
                    <strong>Hours:</strong>{' '}
                    {currentScenario.gbpData.regularHours ? '✅ Available' : '❌ Missing'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Real Location Data Preview */}
          {realLocationData && (
            <Card className="bg-blue-50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Real Location Data:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <strong>Service Area:</strong>{' '}
                    {realLocationData.serviceArea ? '✅ Available' : '❌ Not available'}
                  </div>
                  <div>
                    <strong>Established Date:</strong>{' '}
                    {realLocationData.metadata?.establishedDate || 
                     (realLocationData.profile?.description?.includes('since') ? '✅ In description' : '❌ Not available')}
                  </div>
                  <div>
                    <strong>Phone:</strong>{' '}
                    {realLocationData.phoneNumbers?.primaryPhone ? '✅ Available' : '❌ Missing'}
                  </div>
                  <div>
                    <strong>Hours:</strong>{' '}
                    {realLocationData.regularHours ? '✅ Available' : '❌ Missing'}
                  </div>
                  <div>
                    <strong>Website:</strong>{' '}
                    {realLocationData.websiteUri ? '✅ Available' : '❌ Missing'}
                  </div>
                  <div>
                    <strong>Address:</strong>{' '}
                    {realLocationData.storefrontAddress ? '✅ Available' : '⚡ Service area only'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Test Button */}
          <Button 
            onClick={testScenario} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Test Smart Question Suppression'
            )}
          </Button>
          
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Results Display */}
          {result && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>Questions Generated:</strong> {result.questionCount} 
                  {result.questionCount <= 3 && ' 🎉 (Highly optimized!)'}
                  {result.questionCount > 3 && result.questionCount <= 5 && ' ✨ (Well optimized)'}
                  {result.questionCount > 5 && ' 🔧 (Room for improvement)'}
                </AlertDescription>
              </Alert>
              
              {/* Extracted Data */}
              <Card className={result.isRealData ? 'border-blue-200' : ''}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    Extracted/Calculated Data
                    {result.isRealData && (
                      <span className="text-xs font-normal text-blue-600">(Real GBP Data)</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service Radius:</span>
                      <span className="font-medium">{result.extractedData.serviceRadius}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Years in Business:</span>
                      <span className="font-medium">{result.extractedData.yearsInBusiness}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone Number:</span>
                      <span className="font-medium">{result.extractedData.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Business Hours:</span>
                      <span className="font-medium">{result.extractedData.businessHours}</span>
                    </div>
                    {result.isRealData && (
                      <>
                        <div className="flex justify-between">
                          <span>Website:</span>
                          <span className="font-medium">{result.extractedData.website}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Address:</span>
                          <span className="font-medium">{result.extractedData.address}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Questions */}
              <div>
                <h3 className="font-medium mb-3">Questions That Will Be Asked:</h3>
                <div className="space-y-3">
                  {result.questionsGenerated.map((question: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{question.question}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>Type: {question.type}</span>
                              <span>Priority: {question.priority}</span>
                              <span>Category: {question.category}</span>
                            </div>
                          </div>
                          {question.type === 'service-grid' && (
                            <Info className="h-4 w-4 text-blue-600" title="May include pre-selected options" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}