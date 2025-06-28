/**
 * Enhanced Site Generation - Differentiator Selector Component
 * 
 * **Created**: December 28, 2024, 7:51 PM CST
 * **Last Updated**: December 28, 2024, 7:51 PM CST
 * 
 * Interactive component for selecting business differentiators
 */

'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  Sparkles, Trophy, Star, TrendingUp, 
  Shield, Heart, Leaf, Clock, 
  DollarSign, Users, Zap, Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

export interface Differentiator {
  value: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  category?: string
  competitorContext?: string
}

export interface DifferentiatorQuestion {
  question: string
  context?: string
  options: Differentiator[]
  minSelect?: number
  maxSelect?: number
  required?: boolean
  allowCustom?: boolean
  competitorInsights?: {
    commonClaims: string[]
    marketGaps: string[]
  }
}

interface DifferentiatorSelectorProps {
  question: DifferentiatorQuestion
  onComplete: (selected: string[], customDifferentiators?: string[]) => void
  onSkip?: () => void
  className?: string
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Quality': Trophy,
  'Service': Heart,
  'Price': DollarSign,
  'Experience': Star,
  'Innovation': Zap,
  'Sustainability': Leaf,
  'Speed': Clock,
  'Trust': Shield,
  'Team': Users,
  'Results': TrendingUp
}

export function DifferentiatorSelector({
  question,
  onComplete,
  onSkip,
  className
}: DifferentiatorSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customDifferentiators, setCustomDifferentiators] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)
  
  // Group differentiators by category
  const categorizedOptions = useMemo(() => {
    if (!question?.options || !Array.isArray(question.options)) {
      console.error('Invalid question options:', question)
      return {}
    }
    
    const grouped = question.options.reduce((acc, option) => {
      if (!option?.value || typeof option.value !== 'string') {
        console.warn('Invalid option:', option)
        return acc
      }
      
      const category = option.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(option)
      return acc
    }, {} as Record<string, Differentiator[]>)
    
    return grouped
  }, [question?.options])
  
  const toggleDifferentiator = (value: string) => {
    if (!value || typeof value !== 'string') {
      console.error('Invalid value passed to toggleDifferentiator:', value)
      return
    }
    
    try {
      const newSelected = new Set(selected)
      
      if (newSelected.has(value)) {
        newSelected.delete(value)
      } else {
        if (question.maxSelect && newSelected.size >= question.maxSelect) {
          return
        }
        newSelected.add(value)
      }
      
      setSelected(newSelected)
    } catch (error) {
      console.error('Error in toggleDifferentiator:', error)
    }
  }
  
  const handleAddCustom = () => {
    if (!customInput.trim()) return
    
    setCustomDifferentiators([...customDifferentiators, customInput.trim()])
    setCustomInput('')
    setShowCustomForm(false)
  }
  
  const handleRemoveCustom = (index: number) => {
    setCustomDifferentiators(customDifferentiators.filter((_, i) => i !== index))
  }
  
  const handleComplete = () => {
    const totalSelected = selected.size + customDifferentiators.length
    if (question.minSelect && totalSelected < question.minSelect) {
      return
    }
    onComplete(Array.from(selected), customDifferentiators)
  }
  
  const totalSelected = selected.size + customDifferentiators.length
  const canAddMore = !question.maxSelect || totalSelected < question.maxSelect

  // Early return if question is invalid
  if (!question || !question.question) {
    return (
      <div className={cn('w-full max-w-4xl mx-auto p-6', className)}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid question data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-6', className)} data-testid="differentiator-selector">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{question.question}</h2>
        {question.context && (
          <p className="text-muted-foreground mb-4">{question.context}</p>
        )}
        
        {/* Selection Counter */}
        <div className="inline-flex items-center gap-2">
          <Badge variant={totalSelected === 0 ? 'secondary' : 'default'}>
            {totalSelected} selected
          </Badge>
          {question.minSelect && totalSelected < question.minSelect && (
            <span className="text-sm text-muted-foreground">
              Select at least {question.minSelect}
            </span>
          )}
          {question.maxSelect && (
            <span className="text-sm text-muted-foreground">
              (max {question.maxSelect})
            </span>
          )}
        </div>
      </div>

      {/* Competitor Insights */}
      {question.competitorInsights && (
        <Card className="mb-6 p-4 bg-muted/50">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Competitor Insights
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {question.competitorInsights.commonClaims.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Common competitor claims:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {question.competitorInsights.commonClaims.map((claim, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground/50">•</span>
                      <span>{claim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {question.competitorInsights.marketGaps.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Market opportunities:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {question.competitorInsights.marketGaps.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600">+</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Differentiator Categories */}
      <div className="space-y-6 mb-6">
        {Object.entries(categorizedOptions).map(([category, options]) => {
          const CategoryIcon = categoryIcons[category] || Award
          const isValidCategoryIcon = CategoryIcon && typeof CategoryIcon === 'function'
          
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                {isValidCategoryIcon && (
                  <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                )}
                <h3 className="font-semibold">{category}</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {options.map((option) => {
                  if (!option?.value) {
                    console.warn('Skipping option with no value:', option)
                    return null
                  }
                  
                  const isSelected = selected.has(option.value)
                  const Icon = option.icon || Star
                  const isValidIcon = Icon && typeof Icon === 'function'
                  
                  return (
                    <motion.div
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        onClick={() => toggleDifferentiator(option.value)}
                        className={cn(
                          'p-4 cursor-pointer transition-all',
                          'hover:shadow-md',
                          isSelected && 'ring-2 ring-primary bg-primary/5',
                          !canAddMore && !isSelected && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'mt-0.5 h-5 w-5 rounded-full border-2 transition-all flex items-center justify-center',
                            isSelected 
                              ? 'bg-primary border-primary' 
                              : 'border-gray-300'
                          )}>
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  {isValidIcon ? (
                                    <Icon className="h-3 w-3 text-primary-foreground" />
                                  ) : (
                                    <div className="h-3 w-3 bg-primary-foreground rounded-full" />
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium">{option.label}</h4>
                            {option.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {option.description}
                              </p>
                            )}
                            {option.competitorContext && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                💡 {option.competitorContext}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Custom Differentiators */}
      {question.allowCustom && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Custom Differentiators</h3>
          
          {/* List of custom differentiators */}
          {customDifferentiators.length > 0 && (
            <div className="grid gap-2 mb-3">
              {customDifferentiators.map((custom, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm">{custom}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveCustom(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {/* Add custom form */}
          {showCustomForm ? (
            <Card className="p-4">
              <div className="space-y-3">
                <Textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Describe what makes your business unique..."
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCustomForm(false)
                      setCustomInput('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddCustom}
                    disabled={!customInput.trim()}
                  >
                    Add Differentiator
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowCustomForm(true)}
              disabled={!canAddMore}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Add Custom Differentiator
            </Button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        {onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
          >
            Skip this step
          </Button>
        )}
        
        <Button
          onClick={handleComplete}
          disabled={question.required && totalSelected === 0}
          className="ml-auto"
        >
          Continue
          {totalSelected > 0 && (
            <Badge variant="secondary" className="ml-2">
              {totalSelected} selected
            </Badge>
          )}
        </Button>
      </div>
    </div>
  )
}