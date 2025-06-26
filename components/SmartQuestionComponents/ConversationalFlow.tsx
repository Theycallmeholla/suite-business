/**
 * Conversational Question Flow - Enhanced UX Component
 * 
 * **Created**: December 23, 2024, 11:00 AM CST
 * **Last Updated**: December 23, 2024, 11:00 AM CST
 * 
 * Provides a conversational, engaging question experience that feels
 * like a helpful assistant rather than a form to fill out.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  MessageCircle, 
  Sparkles, 
  ChevronLeft, 
  CheckCircle2, 
  Lightbulb,
  Target,
  Zap,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConversationalQuestion {
  id: string
  type: 'tinder-swipe' | 'service-grid' | 'this-or-that' | 'style-picker' | 'multiple-choice'
  
  // Conversational elements
  greeting?: string
  question: string
  explanation?: string
  encouragement?: string
  
  // Context awareness
  businessName?: string
  previousAnswer?: any
  
  // Question data
  options: any[]
  maxSelections?: number
  allowUnsure?: boolean
  
  // Visual elements
  icon?: React.ReactNode
  color?: string
  
  // Follow-up logic
  followUp?: (answer: any) => ConversationalQuestion | null
}

interface ConversationalFlowProps {
  questions: ConversationalQuestion[]
  businessName?: string
  onComplete: (answers: Record<string, any>) => void
  onProgress?: (progress: { current: number; total: number; dataCompleteness: number }) => void
  className?: string
}

export function ConversationalFlow({
  questions,
  businessName = 'your business',
  onComplete,
  onProgress,
  className
}: ConversationalFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const [dataCompleteness, setDataCompleteness] = useState(0)

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  useEffect(() => {
    // Calculate data completeness
    const completeness = Math.min(100, (Object.keys(answers).length / questions.length) * 100 + 20)
    setDataCompleteness(completeness)
    
    onProgress?.({
      current: currentIndex + 1,
      total: questions.length,
      dataCompleteness: completeness
    })
  }, [currentIndex, answers, questions.length, onProgress])

  const handleAnswer = async (answer: any) => {
    if (isAnimating) return

    setIsAnimating(true)
    
    // Store answer
    const newAnswers = { ...answers, [currentQuestion.id]: answer }
    setAnswers(newAnswers)

    // Show encouragement for good answers
    if (shouldShowEncouragement(answer)) {
      setShowEncouragement(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setShowEncouragement(false)
    }

    // Check for follow-up question
    const followUp = currentQuestion.followUp?.(answer)
    if (followUp) {
      // Insert follow-up question
      const updatedQuestions = [...questions]
      updatedQuestions.splice(currentIndex + 1, 0, followUp)
      // Note: In a real implementation, you'd need to update the questions prop
    }

    // Advance to next question or complete
    if (currentIndex < questions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setCurrentIndex(currentIndex + 1)
    } else {
      await new Promise(resolve => setTimeout(resolve, 500))
      onComplete(newAnswers)
    }

    setIsAnimating(false)
  }

  const handleBack = () => {
    if (currentIndex > 0 && !isAnimating) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const shouldShowEncouragement = (answer: any): boolean => {
    // Show encouragement for comprehensive answers
    if (Array.isArray(answer) && answer.length >= 3) return true
    if (typeof answer === 'string' && answer.length > 20) return true
    return false
  }

  const getGreeting = (): string => {
    if (currentQuestion.greeting) {
      return currentQuestion.greeting.replace('[Business Name]', businessName)
    }
    
    // Default greetings based on question index
    const greetings = [
      `Great! Let's make ${businessName} stand out online.`,
      `Perfect! Now let's talk about what makes ${businessName} special.`,
      `Excellent! This will help customers find ${businessName} easily.`,
      `Awesome! Let's make sure ${businessName} looks amazing.`,
      `Almost done! This last bit will make ${businessName} shine.`
    ]
    
    return greetings[Math.min(currentIndex, greetings.length - 1)]
  }

  const getEncouragementMessage = (): string => {
    const messages = [
      "Perfect! That's exactly what customers want to see! ✨",
      "Excellent choice! This will really help you stand out! 🎯",
      "Great selection! Your website is getting better already! 🚀",
      "Love it! This shows customers you're the right choice! 💪",
      "Fantastic! You're building something amazing! ⭐"
    ]
    
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (!currentQuestion) {
    return null
  }

  return (
    <div className={cn("max-w-4xl mx-auto p-6", className)}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Building Your Perfect Website</h2>
              <p className="text-sm text-gray-600">
                Your website is {Math.round(dataCompleteness)}% optimized
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className="w-32">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Encouragement Overlay */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-6xl mb-4"
              >
                ✨
              </motion.div>
              <h3 className="text-xl font-bold text-green-600 mb-2">
                {getEncouragementMessage()}
              </h3>
              <p className="text-gray-600">
                Your website is looking better already!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Card className="p-8 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-3">
                {currentQuestion.icon || <Sparkles className="w-6 h-6 text-primary" />}
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {currentQuestion.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              
              <p className="text-lg text-gray-600 mb-2">
                {getGreeting()}
              </p>
            </motion.div>

            {/* Main Question */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {currentQuestion.question.replace('[Business Name]', businessName)}
              </h3>
              
              {currentQuestion.explanation && (
                <p className="text-gray-600 mb-4">
                  {currentQuestion.explanation.replace('[Business Name]', businessName)}
                </p>
              )}
            </motion.div>

            {/* Question Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {renderQuestionComponent()}
            </motion.div>

            {/* Helpful Tip */}
            {currentQuestion.encouragement && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> {currentQuestion.encouragement}
                  </p>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-between items-center mt-8"
      >
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentIndex === 0 || isAnimating}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="flex items-center gap-4">
          {/* Data Completeness Indicator */}
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              {Math.round(dataCompleteness)}% Complete
            </div>
            <div className="text-xs text-gray-500">
              Website optimization
            </div>
          </div>

          {/* Skip Option */}
          {currentQuestion.allowUnsure && (
            <Button
              variant="ghost"
              onClick={() => handleAnswer('unsure')}
              disabled={isAnimating}
              className="text-gray-500 hover:text-gray-700"
            >
              I'm not sure
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )

  function renderQuestionComponent() {
    // This would render the appropriate question component based on type
    // For now, we'll create a simple placeholder that shows the concept
    
    switch (currentQuestion.type) {
      case 'tinder-swipe':
        return <TinderSwipeRenderer 
          question={currentQuestion} 
          onAnswer={handleAnswer}
          disabled={isAnimating}
        />
      
      case 'this-or-that':
        return <ThisOrThatRenderer 
          question={currentQuestion} 
          onAnswer={handleAnswer}
          disabled={isAnimating}
        />
      
      case 'multiple-choice':
        return <MultipleChoiceRenderer 
          question={currentQuestion} 
          onAnswer={handleAnswer}
          disabled={isAnimating}
        />
      
      default:
        return <div>Question type not implemented</div>
    }
  }
}

// Simplified renderers for demonstration
function TinderSwipeRenderer({ 
  question, 
  onAnswer, 
  disabled 
}: { 
  question: ConversationalQuestion
  onAnswer: (answer: any) => void
  disabled: boolean 
}) {
  const [currentCard, setCurrentCard] = useState(0)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const handleSwipe = (direction: 'left' | 'right') => {
    if (disabled) return

    const currentOption = question.options[currentCard]
    
    if (direction === 'right') {
      setSelectedItems([...selectedItems, currentOption.value])
    }

    if (currentCard < question.options.length - 1) {
      setCurrentCard(currentCard + 1)
    } else {
      onAnswer(selectedItems)
    }
  }

  if (currentCard >= question.options.length) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-lg font-medium">Perfect! Processing your choices...</p>
      </div>
    )
  }

  const option = question.options[currentCard]

  return (
    <div className="text-center">
      <div className="relative h-80 flex items-center justify-center mb-6">
        <motion.div
          key={currentCard}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-72 h-72 bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center border"
        >
          <div className="text-6xl mb-4">{option.icon}</div>
          <h4 className="text-xl font-bold mb-2">{option.label}</h4>
          {option.description && (
            <p className="text-gray-600 text-center">{option.description}</p>
          )}
        </motion.div>
      </div>

      <div className="flex justify-center gap-6">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleSwipe('left')}
          disabled={disabled}
          className="w-24 h-24 rounded-full border-2 border-red-200 hover:border-red-300 hover:bg-red-50"
        >
          <span className="text-2xl">✕</span>
        </Button>
        
        <Button
          size="lg"
          onClick={() => handleSwipe('right')}
          disabled={disabled}
          className="w-24 h-24 rounded-full bg-green-500 hover:bg-green-600"
        >
          <span className="text-2xl text-white">✓</span>
        </Button>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Swipe right for yes, left for no • {currentCard + 1} of {question.options.length}
      </p>
    </div>
  )
}

function ThisOrThatRenderer({ 
  question, 
  onAnswer, 
  disabled 
}: { 
  question: ConversationalQuestion
  onAnswer: (answer: any) => void
  disabled: boolean 
}) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (value: string) => {
    if (disabled) return
    setSelected(value)
    setTimeout(() => onAnswer(value), 300)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {question.options.slice(0, 2).map((option, index) => (
        <motion.button
          key={option.value}
          onClick={() => handleSelect(option.value)}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "p-8 rounded-2xl border-2 transition-all duration-300 text-left",
            selected === option.value 
              ? "border-primary bg-primary/5" 
              : "border-gray-200 hover:border-gray-300 bg-white",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-4 mb-4">
            {option.icon && <span className="text-3xl">{option.icon}</span>}
            <h4 className="text-xl font-bold">{option.label}</h4>
          </div>
          {option.description && (
            <p className="text-gray-600">{option.description}</p>
          )}
        </motion.button>
      ))}
    </div>
  )
}

function MultipleChoiceRenderer({ 
  question, 
  onAnswer, 
  disabled 
}: { 
  question: ConversationalQuestion
  onAnswer: (answer: any) => void
  disabled: boolean 
}) {
  const [selected, setSelected] = useState<string[]>([])

  const handleToggle = (value: string) => {
    if (disabled) return
    
    const newSelected = selected.includes(value)
      ? selected.filter(s => s !== value)
      : [...selected, value]
    
    setSelected(newSelected)
  }

  const handleContinue = () => {
    if (selected.length > 0) {
      onAnswer(selected)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {question.options.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "p-4 rounded-xl border-2 transition-all duration-300 text-left",
              selected.includes(option.value)
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300 bg-white",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-3">
              {option.icon && <span className="text-2xl">{option.icon}</span>}
              <div>
                <h5 className="font-medium">{option.label}</h5>
                {option.description && (
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {question.maxSelections && (
        <p className="text-sm text-gray-500 mb-4">
          Select up to {question.maxSelections} options • {selected.length} selected
        </p>
      )}

      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={disabled || selected.length === 0}
          size="lg"
          className="min-w-32"
        >
          Continue
          <Zap className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}