/**
 * Test Smart Intake with Real GBP Location Data
 * 
 * **Created**: June 29, 2025, 1:15 PM CST
 * **Last Updated**: June 29, 2025, 1:15 PM CST
 * 
 * Dedicated route for testing smart intake with real GBP location data
 * Usage: /dev/test-smart-real?locationId=accounts/123/locations/456
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Loader2, Building2, CheckCircle2, XCircle, Info, Sparkles } from 'lucide-react'

export default function TestSmartRealPage() {
  const searchParams = useSearchParams()
  const locationId = searchParams.get('locationId')
  
  const [loading, setLoading] = useState(false)
  const [locationData, setLocationData] = useState<any>(null)
  const [intelligenceData, setIntelligenceData] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [suppressedQuestions, setSuppressedQuestions] = useState<Record<string, string>>({})
  
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (locationId) {
      runSmartIntakePipeline()
    }
  }, [locationId])
  
  const runSmartIntakePipeline = async () => {
    if (!locationId) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Step 1: Fetch GBP location data
      const locationResponse = await fetch(`/api/gbp/location/${encodeURIComponent(locationId)}`)
      
      if (!locationResponse.ok) {
        const errorData = await locationResponse.json()
        throw new Error(errorData.error || 'Failed to fetch location data')
      }
      
      const locData = await locationResponse.json()
      setLocationData(locData)
      
      // Step 2: Analyze the business data
      const analyzeResponse = await fetch('/api/intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: locData.title || locData.name,
          gbpData: locData,
          placeId: locData.name || locationId
        })
      })
      
      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze business data')
      }
      
      const intelligence = await analyzeResponse.json()
      setIntelligenceData(intelligence)
      
      // Step 3: Detect industry from categories
      const industry = detectIndustryFromCategories(locData)
      
      // Step 4: Generate smart questions
      const questionsResponse = await fetch('/api/intelligence/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intelligenceId: intelligence.intelligenceId,
          industry,
          dataScore: intelligence.dataScore,
          missingData: ['services']
        })
      })
      
      if (!questionsResponse.ok) {
        throw new Error('Failed to generate questions')
      }
      
      const questionsData = await questionsResponse.json()
      setQuestions(questionsData.questions || [])
      
      // Store suppression info if available
      if (questionsData.suppressionInfo) {
        setSuppressedQuestions(questionsData.suppressionInfo.reasons || {})
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const detectIndustryFromCategories = (locationData: any): string => {
    if (!locationData) return 'general'
    
    // Check both primaryCategory and additionalCategories
    const categories = [
      locationData.primaryCategory,
      ...(locationData.additionalCategories || [])
    ].filter(Boolean)
    
    const categoryString = JSON.stringify(categories).toLowerCase()
    
    if (categoryString.includes('landscap') || categoryString.includes('lawn')) return 'landscaping'
    if (categoryString.includes('hvac') || categoryString.includes('heating') || categoryString.includes('cooling')) return 'hvac'
    if (categoryString.includes('plumb')) return 'plumbing'
    if (categoryString.includes('clean')) return 'cleaning'
    if (categoryString.includes('roof')) return 'roofing'
    if (categoryString.includes('electric')) return 'electrical'
    
    return 'general'
  }
  
  const calculateDataRichness = () => {
    if (!locationData) return { score: 0, label: 'Unknown', color: 'gray' }
    
    let score = 0
    
    // Check for key data points with enhanced scoring
    if (locationData.primaryPhone) score += 15
    if (locationData.regularHours?.periods?.length > 0) score += 15
    if (locationData.website) score += 10
    if (locationData.fullAddress || locationData.address || locationData.serviceArea) score += 15
    if (locationData.serviceArea?.polygon || locationData.serviceArea?.places?.placeInfos?.length > 0) score += 10
    if (locationData.metadata?.establishedDate || locationData.profile?.description?.match(/since \d{4}/i)) score += 15
    if (locationData.profile?.description?.length > 100) score += 10
    if (locationData.additionalCategories?.length > 0) score += 10
    
    if (score >= 80) return { score, label: 'Rich Data', color: 'green' }
    if (score >= 50) return { score, label: 'Partial Data', color: 'yellow' }
    return { score, label: 'Minimal Data', color: 'red' }
  }
  
  const dataRichness = calculateDataRichness()
  
  if (!locationId) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Test Smart Intake with Real Location</CardTitle>
            <CardDescription>
              Add ?locationId=accounts/123/locations/456 to the URL to test
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Smart Intake - Real Location Test
          </CardTitle>
          <CardDescription>
            Testing question suppression with real Google Business Profile data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2">Running smart intake pipeline...</span>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {locationData && !loading && (
            <>
              {/* Business Info */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {locationData.title || locationData.name}
                  </CardTitle>
                  {locationData.primaryCategory && (
                    <CardDescription>
                      {locationData.primaryCategory.displayName}
                      {locationData.fullAddress?.locality && (
                        <span> • {locationData.fullAddress.locality}</span>
                      )}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium">Data Richness:</span>
                    <Badge variant={dataRichness.color === 'green' ? 'default' : dataRichness.color === 'yellow' ? 'secondary' : 'destructive'}>
                      {dataRichness.label} ({dataRichness.score}%)
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <strong>Phone:</strong>{' '}
                      {locationData.primaryPhone ? '✅ Available' : '❌ Missing'}
                    </div>
                    <div>
                      <strong>Hours:</strong>{' '}
                      {locationData.regularHours?.periods?.length > 0 ? '✅ Available' : '❌ Missing'}
                    </div>
                    <div>
                      <strong>Website:</strong>{' '}
                      {locationData.website ? '✅ Available' : '❌ Missing'}
                    </div>
                    <div>
                      <strong>Address:</strong>{' '}
                      {locationData.fullAddress ? '✅ Physical' : '⚡ Service area only'}
                    </div>
                    <div>
                      <strong>Service Area:</strong>{' '}
                      {locationData.serviceArea ? '✅ Defined' : '❌ Not specified'}
                    </div>
                    <div>
                      <strong>Years in Business:</strong>{' '}
                      {locationData.metadata?.establishedDate || locationData.profile?.description?.match(/since \d{4}/i) ? '✅ Can extract' : '❌ Unknown'}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Intelligence Score */}
              {intelligenceData && (
                <Alert className="border-purple-200 bg-purple-50">
                  <Info className="h-4 w-4 text-purple-600" />
                  <AlertDescription>
                    <strong>Intelligence Score:</strong> {intelligenceData.dataScore?.total || 0}/100
                    {intelligenceData.dataScore?.breakdown && (
                      <details className="ml-2 cursor-pointer inline">
                        <summary className="inline text-xs text-gray-500">breakdown</summary>
                        <div className="mt-1 ml-4 space-y-1">
                          {Object.entries(intelligenceData.dataScore.breakdown).map(([k, v]) => (
                            <div key={k}>{k}: +{v}</div>
                          ))}
                        </div>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Questions */}
              {questions.length > 0 && (
                <>
                  <Alert className={
                    questions.length <= 3 
                      ? 'border-green-200 bg-green-50' 
                      : questions.length <= 5 
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-orange-200 bg-orange-50'
                  }>
                    <CheckCircle2 className={
                      questions.length <= 3 
                        ? 'h-4 w-4 text-green-600' 
                        : questions.length <= 5 
                        ? 'h-4 w-4 text-yellow-600'
                        : 'h-4 w-4 text-orange-600'
                    } />
                    <AlertDescription>
                      <strong>Questions to Ask:</strong> {questions.length}
                      {questions.length <= 3 && ' 🎉 Excellent! Minimal questions needed.'}
                      {questions.length > 3 && questions.length <= 5 && ' ✨ Good! Some questions suppressed.'}
                      {questions.length > 5 && ' 🔧 Limited suppression due to missing data.'}
                    </AlertDescription>
                  </Alert>
                  
                  <div>
                    <h3 className="font-medium mb-3">Smart Questions Generated:</h3>
                    <div className="space-y-3">
                      {questions.map((question, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{question.question}</h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <span>Type: {question.type}</span>
                                  <span>Priority: {question.priority}</span>
                                  <span>Category: {question.category}</span>
                                </div>
                                {question.type === 'service-grid' && question.options?.some((opt: any) => opt.checked) && (
                                  <div className="mt-2 text-sm text-purple-600">
                                    ✨ {question.options.filter((opt: any) => opt.checked).length} services pre-selected based on climate & industry
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {/* Suppressed Questions Info */}
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-base">Questions We Didn't Need to Ask</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {/* Show actual suppressed questions from API */}
                        {Object.entries(suppressedQuestions).length > 0 ? (
                          <TooltipProvider>
                            <div className="flex flex-wrap gap-3">
                              {Object.entries(suppressedQuestions).map(([id, reason]) => (
                                <Tooltip key={id}>
                                  <TooltipTrigger className="flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="capitalize">{id.replace(/-/g, ' ')}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>{reason}</TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </TooltipProvider>
                        ) : (
                          // Fallback to data-based inference
                          <ul className="space-y-1 text-sm text-gray-600">
                            {locationData.primaryPhone && <li>✓ Phone number (already have it)</li>}
                            {locationData.regularHours?.periods?.length > 0 && <li>✓ Business hours (already have them)</li>}
                            {locationData.website && <li>✓ Website (already have it)</li>}
                            {(locationData.metadata?.establishedDate || locationData.profile?.description?.match(/since \d{4}/i)) && <li>✓ Years in business (can extract from data)</li>}
                            {locationData.serviceArea && <li>✓ Service radius (calculated from service area)</li>}
                          </ul>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}