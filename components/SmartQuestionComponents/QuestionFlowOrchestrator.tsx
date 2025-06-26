/**
 * Question Flow Orchestrator - Main Integration Component
 * 
 * **Created**: December 23, 2024, 11:30 AM CST
 * **Last Updated**: December 23, 2024, 11:30 AM CST
 * 
 * Orchestrates the complete question flow experience, integrating
 * all components and managing the transition to site creation.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Rocket, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  Zap,
  Target,
  Palette
} from 'lucide-react'
import { QuestionOrchestrator, type QuestionContext } from '@/lib/intelligence/question-orchestrator'
import { InferenceEngine } from '@/lib/intelligence/inference-engine'
import { ConversationalFlow, type ConversationalQuestion } from './ConversationalFlow'
import { RealTimePreview, type PreviewData } from './RealTimePreview'
import { BusinessIntelligenceData } from '@/lib/intelligence/scoring'
import { IndustryType } from '@/types/site-builder'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'

interface QuestionFlowOrchestratorProps {
  businessData: BusinessIntelligenceData
  onComplete: (enhancedData: BusinessIntelligenceData & { userAnswers: Record<string, any> }) => void
  onSkip?: () => void
  className?: string
}

type FlowStage = 'intro' | 'questions' | 'preview' | 'complete'

export function QuestionFlowOrchestrator({
  businessData,
  onComplete,
  onSkip,
  className
}: QuestionFlowOrchestratorProps) {
  const [stage, setStage] = useState<FlowStage>('intro')
  const [orchestrator, setOrchestrator] = useState<QuestionOrchestrator | null>(null)
  const [inferenceEngine, setInferenceEngine] = useState<InferenceEngine | null>(null)
  const [conversationalQuestions, setConversationalQuestions] = useState<ConversationalQuestion[]>([])
  const [previewData, setPreviewData] = useState<Partial<PreviewData>>({})
  const [improvements, setImprovements] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Initialize orchestrator and inference engine
    const orch = new QuestionOrchestrator(businessData)
    const inference = new InferenceEngine(businessData.industry as IndustryType)
    
    setOrchestrator(orch)
    setInferenceEngine(inference)
    
    // Convert adaptive questions to conversational format
    const adaptiveQuestions = []
    let currentQuestion = orch.getCurrentQuestion()
    
    while (currentQuestion && adaptiveQuestions.length < 5) {
      adaptiveQuestions.push(currentQuestion)
      // Simulate advancing to get next question for preview
      orch.skipQuestion('preview')
      currentQuestion = orch.getCurrentQuestion()
    }
    
    // Reset orchestrator
    setOrchestrator(new QuestionOrchestrator(businessData))
    
    const conversational = adaptiveQuestions.map(q => convertToConversational(q))
    setConversationalQuestions(conversational)
    
    // Initialize preview data
    setPreviewData({
      businessName: businessData.name || 'Your Business',
      industry: businessData.industry || 'general',
      services: businessData.services || [],
      differentiators: [],
      positioning: 'quality',
      colorScheme: 'trust-blue',
      typography: 'professional',
      availability: 'business-hours',
      location: businessData.location?.address,
      phone: businessData.phone
    })
  }, [businessData])

  const convertToConversational = (adaptiveQuestion: any): ConversationalQuestion => {
    const greetings = {
      services: "Perfect! Let's start with what [Business Name] offers.",
      differentiation: "Great! Now let's highlight what makes [Business Name] special.",
      emergency_availability: "Excellent! Let's talk about when [Business Name] is available.",
      business_positioning: "Awesome! This helps us understand [Business Name]'s approach.",
      color_scheme: "Fantastic! Let's choose colors that represent [Business Name].",
      typography: "Almost done! Let's pick the perfect typography for [Business Name]."
    }

    const explanations = {
      services: "This helps customers quickly understand what you do and improves your search rankings.",
      differentiation: "These unique qualities will be prominently featured to help you stand out from competitors.",
      emergency_availability: "This determines how we position your business and what we emphasize on your website.",
      business_positioning: "This shapes your messaging tone and helps us target the right customers.",
      color_scheme: "Colors create the first impression and convey your brand personality.",
      typography: "Typography affects readability and reinforces your brand's professional image."
    }

    const encouragements = {
      services: "Choose the services you're most proud of - these will be featured prominently!",
      differentiation: "Don't be modest! These differentiators will help customers choose you.",
      emergency_availability: "Emergency services can be a major competitive advantage.",
      business_positioning: "Understanding your approach helps us craft the perfect message.",
      color_scheme: "Trust your instincts - you know your brand best!",
      typography: "The right typography makes your content more engaging and trustworthy."
    }

    return {
      id: adaptiveQuestion.id,
      type: adaptiveQuestion.type,
      greeting: greetings[adaptiveQuestion.id as keyof typeof greetings],
      question: adaptiveQuestion.personalizedQuestion || adaptiveQuestion.question,
      explanation: explanations[adaptiveQuestion.id as keyof typeof explanations],
      encouragement: encouragements[adaptiveQuestion.id as keyof typeof encouragements],
      businessName: businessData.name,
      options: adaptiveQuestion.options || [],
      maxSelections: adaptiveQuestion.maxSelections,
      allowUnsure: adaptiveQuestion.allowUnsure,
      icon: getQuestionIcon(adaptiveQuestion.category),
      color: getQuestionColor(adaptiveQuestion.category)
    }
  }

  const getQuestionIcon = (category: string) => {
    const icons = {
      critical: <Target className="w-6 h-6" />,
      enhancement: <Sparkles className="w-6 h-6" />,
      personalization: <Eye className="w-6 h-6" />,
      style: <Palette className="w-6 h-6" />
    }
    return icons[category as keyof typeof icons] || <Sparkles className="w-6 h-6" />
  }

  const getQuestionColor = (category: string) => {
    const colors = {
      critical: 'text-red-600',
      enhancement: 'text-blue-600',
      personalization: 'text-green-600',
      style: 'text-purple-600'
    }
    return colors[category as keyof typeof colors] || 'text-blue-600'
  }

  const handleQuestionComplete = async (answers: Record<string, any>) => {
    if (!orchestrator || !inferenceEngine) return

    setIsProcessing(true)

    try {
      // Process each answer through the orchestrator and inference engine
      const allInferences: Record<string, any> = {}
      
      for (const [questionId, answer] of Object.entries(answers)) {
        // Get inferences from the inference engine
        const inferences = inferenceEngine.processInput(questionId, answer, businessData)
        
        // Store inferences
        inferences.forEach(inference => {
          allInferences[inference.field] = inference.value
        })

        // Update preview data in real-time
        updatePreviewData(questionId, answer, allInferences)
      }

      // Generate smart defaults for missing data
      const smartDefaults = inferenceEngine.generateSmartDefaults({
        ...businessData,
        ...allInferences
      })

      // Combine all data
      const enhancedData = {
        ...businessData,
        ...allInferences,
        ...smartDefaults,
        userAnswers: answers,
        dataCompleteness: calculateDataCompleteness(answers, allInferences),
        improvementsSuggested: improvements
      }

      // Show completion stage briefly before calling onComplete
      setStage('complete')
      
      setTimeout(() => {
        onComplete(enhancedData)
      }, 2000)

    } catch (error) {
      console.error('Error processing questions:', error)
      toast.error('Something went wrong processing your answers. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const updatePreviewData = (questionId: string, answer: any, inferences: Record<string, any>) => {
    setPreviewData(prev => {
      const updated = { ...prev }

      switch (questionId) {
        case 'services':
          updated.services = Array.isArray(answer) ? answer : [answer]
          break
        
        case 'differentiation':
          updated.differentiators = Array.isArray(answer) ? answer : [answer]
          break
        
        case 'business_positioning':
          updated.positioning = answer
          break
        
        case 'emergency_availability':
          updated.availability = answer
          break
        
        case 'color_scheme':
          updated.colorScheme = answer
          break
        
        case 'typography':
          updated.typography = answer
          break
      }

      // Apply inferences
      if (inferences.positioning) updated.positioning = inferences.positioning
      if (inferences.availability) updated.availability = inferences.availability

      return updated
    })
  }

  const calculateDataCompleteness = (answers: Record<string, any>, inferences: Record<string, any>): number => {
    const totalFields = ['services', 'differentiation', 'positioning', 'availability', 'style']
    const completedFields = totalFields.filter(field => 
      answers[field] || inferences[field] || businessData[field]
    )
    
    return Math.round((completedFields.length / totalFields.length) * 100)
  }

  const handleImprovementDetected = (improvement: string) => {
    setImprovements(prev => [...prev, improvement])
    
    // Show toast for significant improvements
    const significantImprovements = [
      'trust-signals', 'emergency-prominence', 'seo-improved'
    ]
    
    if (significantImprovements.includes(improvement)) {
      toast.success(`Great! Your website just got better: ${improvement.replace('-', ' ')}`)
    }
  }

  const handleStartQuestions = () => {
    setStage('questions')
  }

  const handleSkipAll = () => {
    if (onSkip) {
      onSkip()
    } else {
      // Provide minimal enhancement and continue
      const minimalData = {
        ...businessData,
        userAnswers: {},
        dataCompleteness: 30,
        improvementsSuggested: []
      }
      onComplete(minimalData)
    }
  }

  if (stage === 'intro') {
    return (
      <div className={cn("max-w-4xl mx-auto p-6", className)}>
        <IntroStage 
          businessData={businessData}
          questionCount={conversationalQuestions.length}
          onStart={handleStartQuestions}
          onSkip={handleSkipAll}
        />
      </div>
    )
  }

  if (stage === 'complete') {
    return (
      <div className={cn("max-w-4xl mx-auto p-6", className)}>
        <CompletionStage 
          improvements={improvements}
          dataCompleteness={calculateDataCompleteness({}, {})}
        />
      </div>
    )
  }

  return (
    <div className={cn("max-w-7xl mx-auto p-6", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Questions Column */}
        <div>
          <ConversationalFlow
            questions={conversationalQuestions}
            businessName={businessData.name}
            onComplete={handleQuestionComplete}
            onProgress={(progress) => {
              // Handle progress updates if needed
            }}
          />
        </div>

        {/* Preview Column */}
        <div className="lg:sticky lg:top-6">
          <RealTimePreview
            data={previewData}
            currentQuestion={conversationalQuestions[0]?.id} // This would be dynamic in real implementation
            latestAnswer={null} // This would track the latest answer
            onImprovementDetected={handleImprovementDetected}
          />
        </div>
      </div>
    </div>
  )
}

function IntroStage({ 
  businessData, 
  questionCount, 
  onStart, 
  onSkip 
}: {
  businessData: BusinessIntelligenceData
  questionCount: number
  onStart: () => void
  onSkip: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-8"
    >
      <div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-6xl mb-6"
        >
          ✨
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-4">
          Let's Make {businessData.name || 'Your Business'} Shine Online
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          We've analyzed your business and found some great opportunities to make your website even better. 
          Answer just {questionCount} quick questions and watch your site transform in real-time!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
        <Card className="p-6 text-center">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Smart Questions</h3>
          <p className="text-sm text-gray-600">Only ask what we need to know</p>
        </Card>
        
        <Card className="p-6 text-center">
          <Eye className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Live Preview</h3>
          <p className="text-sm text-gray-600">See changes happen instantly</p>
        </Card>
        
        <Card className="p-6 text-center">
          <Rocket className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Better Results</h3>
          <p className="text-sm text-gray-600">More customers, more business</p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" onClick={onStart} className="px-8">
          Let's Do This!
          <Sparkles className="w-4 h-4 ml-2" />
        </Button>
        
        <Button variant="outline" size="lg" onClick={onSkip}>
          Skip & Use AI Suggestions
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        Takes about 2-3 minutes • You can skip any question
      </p>
    </motion.div>
  )
}

function CompletionStage({ 
  improvements, 
  dataCompleteness 
}: {
  improvements: string[]
  dataCompleteness: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-8"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: 2 }}
        className="text-6xl mb-6"
      >
        🚀
      </motion.div>
      
      <div>
        <h1 className="text-3xl font-bold mb-4 text-green-600">
          Amazing! Your Website is Ready
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          We've applied {improvements.length} improvements and your website is now {dataCompleteness}% optimized for success!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {improvements.slice(0, 6).map((improvement, index) => (
          <motion.div
            key={improvement}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">
              {improvement.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-gray-500"
      >
        Creating your website...
      </motion.div>
    </motion.div>
  )
}