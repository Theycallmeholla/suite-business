/**
 * Enhanced Onboarding Flow Page
 * 
 * **Created**: December 23, 2024, 11:45 AM CST
 * **Last Updated**: June 28, 2025, 8:55 PM CST
 * 
 * AI-powered onboarding with intelligent questions
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, Loader2, AlertCircle,
  CheckCircle2, Sparkles, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/lib/toast'
import { useSession } from 'next-auth/react'

// Import enhanced components
import {
  PhotoLabeler,
  ClaimVerifier,
  DifferentiatorSelector,
  SpecializationPicker,
  SuccessMetrics,
  type PhotoLabelingQuestion,
  type ClaimVerificationQuestion,
  type DifferentiatorQuestion,
  type SpecializationQuestion,
  type MetricsData
} from '@/components/enhanced'

// Import regular smart question components
import { 
  MultipleChoice,
  TinderSwipe,
  ThisOrThat,
  StylePicker,
  FontPairing
} from '@/components/SmartQuestionComponents'

type Question = 
  | PhotoLabelingQuestion 
  | ClaimVerificationQuestion 
  | DifferentiatorQuestion 
  | SpecializationQuestion
  | any // For other question types

interface QuestionFlowState {
  questions: Question[]
  currentIndex: number
  answers: Record<string, any>
  startTime: number
  insights?: any
  placeId?: string
  businessData?: any
}

// Helper function to get industry-specific services
function getIndustryServices(industry: string): string[] {
  const services: Record<string, string[]> = {
    landscaping: [
      'Lawn Maintenance',
      'Landscape Design',
      'Tree Services',
      'Hardscaping',
      'Irrigation Systems',
      'Snow Removal',
      'Garden Design',
      'Mulching'
    ],
    hvac: [
      'AC Installation',
      'Heating Installation',
      'HVAC Maintenance',
      'Emergency Repairs',
      'Duct Cleaning',
      'Indoor Air Quality',
      'Commercial HVAC',
      'Heat Pump Services'
    ],
    plumbing: [
      'Emergency Plumbing',
      'Drain Cleaning',
      'Water Heater Services',
      'Pipe Repair',
      'Bathroom Remodeling',
      'Kitchen Plumbing',
      'Sewer Line Services',
      'Fixture Installation'
    ],
    general: [
      'Consultation',
      'Installation',
      'Maintenance',
      'Repair Services',
      'Emergency Services',
      'Commercial Services',
      'Residential Services'
    ]
  }
  
  return services[industry] || services.general
}

export default function EnhancedOnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  
  const [state, setState] = useState<QuestionFlowState>({
    questions: [],
    currentIndex: 0,
    answers: {},
    startTime: Date.now()
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingWebsite, setGeneratingWebsite] = useState(false)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)

  const placeId = searchParams.get('placeId')
  const businessId = searchParams.get('businessId')

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  // Load questions from API
  useEffect(() => {
    if (status !== 'authenticated') return
    
    if (!placeId && !businessId) {
      // If no IDs, still allow creation with manual data
      console.log('No business ID provided, will use manual entry')
    }

    loadQuestions()
  }, [placeId, businessId, status])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      setError(null)

      const industry = searchParams.get('industry') || 'general'
      const businessName = searchParams.get('name') || 'Your Business'

      // If no business ID, use a different endpoint or provide manual data
      if (!placeId && !businessId) {
        // Generate questions based on industry alone
        const basicQuestions = [
          {
            id: 'business-name',
            type: 'text',
            question: 'What is your business name?',
            category: 'basic',
            required: true
          },
          {
            id: 'business-description',
            type: 'textarea',
            question: 'Describe your business in a few sentences',
            category: 'basic',
            required: true
          },
          {
            id: 'services',
            type: 'multiple-choice',
            question: 'What services do you offer?',
            category: 'services',
            options: getIndustryServices(industry),
            multiple: true,
            required: true
          }
        ]
        
        setState(prev => ({
          ...prev,
          questions: basicQuestions,
          businessData: { name: businessName, industry }
        }))
        setLoading(false)
        return
      }

      const response = await fetch('/api/sites/create-from-gbp-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: placeId || businessId,
          isPlaceId: !!placeId,
          generateQuestionsOnly: true,
          industry
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        
        // If it's a 404 (location not found), offer to continue without GBP
        if (response.status === 404) {
          setError('The selected business location was not found. You can continue with manual entry.')
          
          // Generate basic questions for manual entry
          const basicQuestions = [
            {
              id: 'business-name',
              type: 'text',
              question: 'What is your business name?',
              category: 'basic',
              required: true
            },
            {
              id: 'business-description',
              type: 'textarea',
              question: 'Describe your business in a few sentences',
              category: 'basic',
              required: true
            },
            {
              id: 'services',
              type: 'multiple-choice',
              question: 'What services do you offer?',
              category: 'services',
              options: getIndustryServices(industry),
              multiple: true,
              required: true
            }
          ]
          
          setState(prev => ({
            ...prev,
            questions: basicQuestions,
            businessData: { name: businessName, industry }
          }))
          setLoading(false)
          return
        }
        
        throw new Error(errorData.error || 'Failed to load questions')
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      // If no questions needed, generate the site immediately
      if (!data.requiresAnswers || data.questions.length === 0) {
        console.log('No questions needed, generating website immediately')
        await generateWebsite({})
        return
      }
      
      console.log('Setting questions:', data.questions?.length || 0)
      setState(prev => ({
        ...prev,
        questions: data.questions || [],
        insights: data.insights,
        placeId: placeId || data.businessData?.placeId,
        businessData: data.businessData
      }))
    } catch (err) {
      console.error('Error loading questions:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to load questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateWebsite = async (answers: Record<string, any>) => {
    try {
      setGeneratingWebsite(true)
      
      const response = await fetch('/api/sites/create-from-gbp-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: placeId || businessId,
          isPlaceId: !!placeId,
          generateQuestionsOnly: false,
          userAnswers: answers,
          insights: state.insights
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate website')
      }

      const result = await response.json()
      
      // Calculate metrics
      const timeSpent = Math.round((Date.now() - state.startTime) / 1000)
      const questionsAnswered = Object.keys(answers).length
      
      // Show success metrics
      setMetrics({
        questionsShown: state.questions.length,
        questionsAnswered,
        timeSpent,
        dataQualityScore: result.dataQuality || 85,
        competitiveInsights: result.competitiveStrategy?.differentiators?.length || 12,
        enhancedFeatures: [
          'AI-Optimized Content',
          'Competitive Positioning',
          'Smart Photo Labels',
          'Industry Specializations'
        ]
      })

      // Redirect after showing metrics
      setTimeout(() => {
        redirectToDashboardWithBridge(result.id);
      }, 5000)

    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate website')
      setGeneratingWebsite(false)
    }
  }

  const handleAnswer = (answer: any) => {
    const currentQuestion = state.questions[state.currentIndex]
    
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: answer
      }
    }))

    // Auto-advance to next question
    if (state.currentIndex < state.questions.length - 1) {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          currentIndex: prev.currentIndex + 1
        }))
      }, 300)
    }
  }

  const handleSkip = () => {
    if (state.currentIndex < state.questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }))
    }
  }

  const handlePrevious = () => {
    if (state.currentIndex > 0) {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex - 1
      }))
    }
  }

  const handleComplete = async () => {
    await generateWebsite(state.answers)
  }

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{question.question}</h3>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your answer..."
              defaultValue={state.answers[question.id] || ''}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAnswer((e.target as HTMLInputElement).value)
                }
              }}
              onBlur={(e) => handleAnswer(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement
                  if (input?.value) {
                    handleAnswer(input.value)
                  }
                }}
                disabled={!document.querySelector('input[type="text"]')?.value}
              >
                Continue
              </Button>
            </div>
          </div>
        )
        
      case 'textarea':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{question.question}</h3>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
              placeholder="Enter your answer..."
              defaultValue={state.answers[question.id] || ''}
              onBlur={(e) => handleAnswer(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => {
                  const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                  if (textarea?.value) {
                    handleAnswer(textarea.value)
                  }
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        )
        
      case 'photo-label':
        return (
          <PhotoLabeler
            question={question as PhotoLabelingQuestion}
            onComplete={(labels) => handleAnswer(labels)}
            onSkip={handleSkip}
          />
        )
      
      case 'multiple':
        // Check if it's a claim verification question
        if (question.category === 'verification') {
          return (
            <ClaimVerifier
              question={question as ClaimVerificationQuestion}
              onComplete={(claims) => handleAnswer(claims)}
              onSkip={handleSkip}
            />
          )
        }
        // Check if it's a differentiator question
        if (question.category === 'differentiators') {
          return (
            <DifferentiatorSelector
              question={question as DifferentiatorQuestion}
              onComplete={(differentiators) => handleAnswer(differentiators)}
              onSkip={handleSkip}
            />
          )
        }
        // Check if it's a specialization question
        if (question.category === 'services' && question.options[0]?.category) {
          return (
            <SpecializationPicker
              question={question as SpecializationQuestion}
              onComplete={(specializations) => handleAnswer(specializations)}
              onSkip={handleSkip}
            />
          )
        }
        // Default multiple choice
        return (
          <MultipleChoice
            question={question.question}
            subtext={question.context}
            options={question.options}
            onSelect={(values) => handleAnswer(values)}
            selected={state.answers[question.id]}
            multiSelect={true}
          />
        )
      
      case 'boolean':
      case 'yes-no':
        return (
          <TinderSwipe
            question={question.question}
            subtext={question.context}
            options={[
              { value: 'yes', label: 'Yes', color: 'green' },
              { value: 'no', label: 'No', color: 'red' }
            ]}
            onSwipe={(value) => handleAnswer(value)}
            allowDontKnow={true}
          />
        )
      
      case 'single':
      case 'this-or-that':
        if (question.options.length === 2) {
          return (
            <ThisOrThat
              question={question.question}
              subtext={question.context}
              options={question.options}
              onSelect={(value) => handleAnswer(value)}
            />
          )
        }
        return (
          <MultipleChoice
            question={question.question}
            subtext={question.context}
            options={question.options}
            onSelect={(value) => handleAnswer(value)}
            selected={state.answers[question.id]}
            multiSelect={false}
          />
        )
      
      case 'style-picker':
        return (
          <StylePicker
            question={question.question}
            subtext={question.context}
            options={question.options}
            onSelect={(value) => handleAnswer(value)}
            selected={state.answers[question.id]}
          />
        )
      
      case 'font-pairing':
        return (
          <FontPairing
            question={question.question}
            subtext={question.context}
            pairings={question.options}
            onSelect={(value) => handleAnswer(value)}
            selected={state.answers[question.id]}
          />
        )
      
      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unsupported question type: {question.type}
            </AlertDescription>
          </Alert>
        )
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {loading ? 'Analyzing your business data...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/onboarding')}>
              Go to Standard Setup
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const redirectToDashboardWithBridge = async (siteId?: string) => {
    try {
      console.log('Starting session bridge handshake for dashboard redirect...');
      const response = await fetch('/api/auth/session-bridge');
      if (!response.ok) {
        throw new Error('Failed to initiate session bridge for dashboard.');
      }
      const { token } = await response.json();

      if (token) {
        console.log('Got bridge token, redirecting to dashboard...');
        const targetUrl = siteId 
          ? `http://app.localhost:3000/preview/${siteId}?token=${token}`
          : `http://app.localhost:3000/dashboard/sites?token=${token}`;
        window.location.href = targetUrl;
      } else {
        throw new Error('No token received from bridge for dashboard.');
      }
    } catch (error) {
      console.error("Session bridge failed for dashboard:", error);
      toast.error('Failed to redirect to dashboard. Please try logging in again.');
      router.push('/signin'); // Fallback to signin
    }
  };

  if (metrics) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <SuccessMetrics metrics={metrics} />
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Redirecting to your new website...
          </p>
          <Button
            onClick={() => redirectToDashboardWithBridge()}
            variant="outline"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (generatingWebsite) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
          </motion.div>
          <h2 className="text-xl font-semibold mb-2">Generating Your Website</h2>
          <p className="text-muted-foreground">
            Using AI to create the perfect site for your business...
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This usually takes 20-30 seconds
          </p>
        </div>
      </div>
    )
  }

  const currentQuestion = state.questions[state.currentIndex]
  const progress = state.questions.length > 0 
    ? ((state.currentIndex + 1) / state.questions.length) * 100 
    : 0
  const isLastQuestion = state.currentIndex === state.questions.length - 1
  const hasAnswer = !!state.answers[currentQuestion?.id]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/onboarding')}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Enhanced (Beta)
            </Badge>
            {currentQuestion && (
              <span className="text-sm text-muted-foreground">
                Question {state.currentIndex + 1} of {state.questions.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto py-8">
        {state.businessData && (
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{state.businessData.name}</h1>
            <p className="text-muted-foreground">{state.businessData.address}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentQuestion && renderQuestion(currentQuestion)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentQuestion && (
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={state.currentIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleComplete}
                disabled={Object.keys(state.answers).length === 0}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Generate Website
              </Button>
            ) : (
              <Button
                onClick={() => setState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }))}
                disabled={!hasAnswer && currentQuestion?.required}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}