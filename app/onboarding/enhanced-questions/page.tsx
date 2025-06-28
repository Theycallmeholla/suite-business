/**
 * Enhanced Questions Flow Page
 * 
 * **Created**: December 28, 2024, 12:15 PM CST
 * **Last Updated**: December 28, 2024, 12:15 PM CST
 * 
 * Dynamic form flow using smart questions based on business data
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { QuestionFlowOrchestrator } from '@/components/SmartQuestionComponents'
import { BusinessIntelligenceData } from '@/lib/intelligence/scoring'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'
import { logger } from '@/lib/logger'

export default function EnhancedQuestionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  
  const [isLoading, setIsLoading] = useState(true)
  const [businessData, setBusinessData] = useState<BusinessIntelligenceData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const industry = searchParams.get('industry') || 'general'
  const businessId = searchParams.get('businessId')
  const placeId = searchParams.get('placeId')
  const accountId = searchParams.get('accountId')
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])
  
  // Fetch business data
  useEffect(() => {
    async function fetchBusinessData() {
      if (!businessId && !placeId) {
        setError('Missing business identifier')
        setIsLoading(false)
        return
      }
      
      try {
        // First, fetch the business data from GBP/Places
        let businessInfo = null
        
        if (businessId) {
          // Strip the 'locations/' prefix if present
          const locationId = businessId.startsWith('locations/') 
            ? businessId.substring('locations/'.length) 
            : businessId
          
          // Encode the location ID for the URL path
          const encodedLocationId = encodeURIComponent(locationId)
          
          // Build the URL with accountId if available
          let url = `/api/gbp/location/${encodedLocationId}`
          if (accountId) {
            url += `?accountId=${encodeURIComponent(accountId)}`
          }
          
          // Fetch from GBP
          const gbpResponse = await fetch(url)
          
          if (!gbpResponse.ok) {
            throw new Error('Failed to fetch business details')
          }
          
          businessInfo = await gbpResponse.json()
        } else if (placeId) {
          // Fetch from Places API
          const placesResponse = await fetch('/api/gbp/place-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placeId }),
          })
          
          if (!placesResponse.ok) {
            throw new Error('Failed to fetch place details')
          }
          
          const placesData = await placesResponse.json()
          businessInfo = placesData.details
        }
        
        if (!businessInfo) {
          throw new Error('No business data found')
        }
        
        // Now analyze the business data
        const analyzeResponse = await fetch('/api/intelligence/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: businessInfo.name || businessInfo.title || businessInfo.businessName,
            gbpData: businessInfo,
            placeId: placeId || undefined,
          }),
        })
        
        if (!analyzeResponse.ok) {
          const error = await analyzeResponse.json()
          throw new Error(error.error || 'Failed to analyze business data')
        }
        
        const analyzeData = await analyzeResponse.json()
        
        // Create a structured business data object for the questions
        const structuredData: BusinessIntelligenceData = {
          businessName: businessInfo.name || businessInfo.title || businessInfo.businessName,
          industry: industry as any,
          dataScore: analyzeData.dataScore,
          // Location data
          address: businessInfo.fullAddress?.addressLines?.join(', ') || businessInfo.address || businessInfo.formatted_address || '',
          city: businessInfo.fullAddress?.locality || '',
          state: businessInfo.fullAddress?.administrativeArea || '',
          zip: businessInfo.fullAddress?.postalCode || '',
          phone: businessInfo.primaryPhone || businessInfo.phone || businessInfo.formatted_phone_number || null,
          website: businessInfo.website || businessInfo.websiteUri || null,
          coordinates: businessInfo.coordinates || businessInfo.latlng || null,
          businessHours: businessInfo.regularHours || businessInfo.hours || businessInfo.opening_hours || null,
          // Enhanced data
          metaDescription: businessInfo.profile?.description || businessInfo.description || null,
          photoData: businessInfo.photos || [],
          // Placeholders for missing fields
          email: null,
          logo: null,
          gbp: analyzeData.gbp || undefined,
          places: analyzeData.places || undefined,
          serp: analyzeData.serp || undefined,
          manual: analyzeData.manual || undefined,
        }
        
        setBusinessData(structuredData)
        
      } catch (error) {
        logger.error('Failed to fetch business data', {}, error as Error)
        setError('Failed to load business information')
        toast.error('Failed to load business information')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchBusinessData()
  }, [businessId, placeId, industry, accountId])
  
  const handleComplete = async (answers: Record<string, any>) => {
    try {
      setIsLoading(true)
      
      // Store the answers
      await fetch('/api/intelligence/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: businessId || placeId,
          answers,
        }),
      })
      
      // Create the site with enhanced data
      const response = await fetch('/api/sites/create-from-gbp-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: businessId || placeId,
          industry,
          userAnswers: answers,
          isPlaceId: !!placeId,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create site')
      }
      
      const site = await response.json()
      
      // Redirect to preview
      router.push(`/preview/${site.id}`)
      
    } catch (error: any) {
      logger.error('Failed to create enhanced site', {}, error)
      toast.error(error.message || 'Failed to create site')
      setIsLoading(false)
    }
  }
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">
            {isLoading ? 'Loading your business information...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => router.push('/onboarding')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Onboarding
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }
  
  if (!businessData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <p className="text-gray-600 mb-4">No business data available</p>
              <Button
                variant="outline"
                onClick={() => router.push('/onboarding')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Onboarding
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <QuestionFlowOrchestrator
        businessData={businessData}
        onComplete={handleComplete}
        onBack={() => router.push('/onboarding')}
      />
    </div>
  )
}