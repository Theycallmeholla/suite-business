/**
 * Enhanced Onboarding Page - Smart Question Integration
 * 
 * **Created**: December 23, 2024, 11:45 AM CST
 * **Last Updated**: December 23, 2024, 11:45 AM CST
 * 
 * Integrates the new smart question system into the onboarding flow
 * with real-time preview and conversational UX.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { QuestionFlowOrchestrator } from '@/components/SmartQuestionComponents'
import { BusinessIntelligenceData } from '@/lib/intelligence/scoring'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { toast } from '@/lib/toast'

export default function EnhanceOnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  
  const [businessData, setBusinessData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingSite, setIsCreatingSite] = useState(false)

  // Get business intelligence ID from URL params
  const intelligenceId = searchParams.get('id')
  const businessName = searchParams.get('name')
  const industry = searchParams.get('industry')

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user?.email) {
      router.push('/signin')
      return
    }

    if (!intelligenceId) {
      // If no intelligence ID, try to get from URL params or redirect
      if (businessName && industry) {
        initializeFromParams()
      } else {
        router.push('/onboarding')
      }
      return
    }

    loadBusinessIntelligence()
  }, [session, status, intelligenceId, businessName, industry])

  const initializeFromParams = async () => {
    try {
      setIsLoading(true)
      
      // Create basic business intelligence data from URL params
      const basicData: any = {
        id: 'temp-' + Date.now(),
        name: businessName || 'Your Business',
        industry: industry || 'general',
        dataScore: { total: 30, breakdown: {} },
        services: [],
        location: null,
        phone: null,
        website: null,
        hours: null,
        differentiationScore: 20,
        contentTier: 'minimal'
      }

      setBusinessData(basicData)
    } catch (error) {
      console.error('Error initializing from params:', error)
      setError('Failed to initialize business data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadBusinessIntelligence = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/intelligence/score?id=${intelligenceId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load business intelligence')
      }
      
      const data = await response.json()
      setBusinessData(data.intelligence)
    } catch (error) {
      console.error('Error loading business intelligence:', error)
      setError('Failed to load business data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestionFlowComplete = async (enhancedData: BusinessIntelligenceData & { userAnswers: Record<string, any> }) => {
    try {
      setIsCreatingSite(true)
      
      // Save enhanced business intelligence
      const saveResponse = await fetch('/api/intelligence/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intelligenceId: intelligenceId || 'new',
          enhancedData,
          userAnswers: enhancedData.userAnswers
        })
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save enhanced data')
      }

      const { intelligence } = await saveResponse.json()

      // Create site with enhanced data
      const siteResponse = await fetch('/api/sites/create-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intelligenceId: intelligence.id,
          enhancedData: intelligence
        })
      })

      if (!siteResponse.ok) {
        throw new Error('Failed to create site')
      }

      const { site } = await siteResponse.json()

      toast.success('Your enhanced website has been created!')
      
      // Redirect to the new site
      router.push(`/dashboard/sites/${site.id}`)
      
    } catch (error) {
      console.error('Error creating enhanced site:', error)
      toast.error('Failed to create your website. Please try again.')
      setIsCreatingSite(false)
    }
  }

  const handleSkipEnhancement = async () => {
    try {
      setIsCreatingSite(true)
      
      // Create site with basic data
      const response = await fetch('/api/sites/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessData?.name || 'My Business',
          industry: businessData?.industry || 'general',
          basicData: businessData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create site')
      }

      const { site } = await response.json()
      
      toast.success('Your website has been created!')
      router.push(`/dashboard/sites/${site.id}`)
      
    } catch (error) {
      console.error('Error creating basic site:', error)
      toast.error('Failed to create your website. Please try again.')
      setIsCreatingSite(false)
    }
  }

  const handleGoBack = () => {
    router.push('/onboarding')
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your business data...</p>
        </div>
      </div>
    )
  }

  if (error || !businessData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">
            {error || 'Unable to load your business data. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (isCreatingSite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-bounce">🚀</div>
          <h2 className="text-2xl font-bold mb-4">Creating Your Amazing Website</h2>
          <p className="text-gray-600 mb-6">
            Applying all the improvements and optimizations...
          </p>
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleGoBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Enhance Your Website</h1>
                <p className="text-sm text-gray-600">
                  Make {businessData.name} stand out with smart optimizations
                </p>
              </div>
            </div>
            
            <Button variant="outline" onClick={handleSkipEnhancement}>
              Skip & Create Basic Site
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <QuestionFlowOrchestrator
          businessData={businessData}
          onComplete={handleQuestionFlowComplete}
          onSkip={handleSkipEnhancement}
        />
      </div>
    </div>
  )
}