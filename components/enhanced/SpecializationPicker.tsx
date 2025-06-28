/**
 * Enhanced Site Generation - Specialization Picker Component
 * 
 * **Created**: December 28, 2024, 8:40 PM CST
 * **Last Updated**: December 28, 2024, 8:40 PM CST
 * 
 * Multi-select component for service specializations
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface Specialization {
  value: string
  label: string
  category?: string
  popular?: boolean
  description?: string
}

export interface SpecializationQuestion {
  id: string
  type: 'multiple'
  question: string
  category?: string
  context?: string
  options: Specialization[]
  required: boolean
  minSelect?: number
  maxSelect?: number
}

interface SpecializationPickerProps {
  question: SpecializationQuestion
  onComplete: (specializations: string[]) => void
  onSkip?: () => void
  className?: string
}

export function SpecializationPicker({
  question,
  onComplete,
  onSkip,
  className = ''
}: SpecializationPickerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Group options by category
  const categorizedOptions = question.options.reduce((acc, option) => {
    const category = option.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(option)
    return acc
  }, {} as Record<string, Specialization[]>)

  const toggleSpecialization = (value: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(value)) {
      newSelected.delete(value)
    } else {
      if (!question.maxSelect || newSelected.size < question.maxSelect) {
        newSelected.add(value)
      }
    }
    setSelected(newSelected)
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleComplete = () => {
    onComplete(Array.from(selected))
  }

  return (
    <div className={`w-full max-w-3xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{question.question}</h2>
        {question.context && (
          <p className="text-muted-foreground mb-4">{question.context}</p>
        )}
        {question.maxSelect && (
          <p className="text-sm text-muted-foreground">
            Select up to {question.maxSelect} options
          </p>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3 mb-6">
        {Object.entries(categorizedOptions).map(([category, options]) => {
          const isExpanded = expandedCategories.has(category)
          const categorySelected = options.filter(opt => selected.has(opt.value)).length
          
          return (
            <Card key={category} className="overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                    <span className="font-medium">{category}</span>
                    {categorySelected > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {categorySelected} selected
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t"
                >
                  <div className="p-4 grid gap-2">
                    {options.map((option) => (
                      <motion.div
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`p-3 cursor-pointer transition-all ${
                            selected.has(option.value)
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => toggleSpecialization(option.value)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{option.label}</span>
                                {option.popular && (
                                  <Badge variant="secondary" className="text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              {option.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {option.description}
                                </p>
                              )}
                            </div>
                            <div
                              className={`ml-3 rounded-full border-2 w-5 h-5 flex items-center justify-center transition-colors ${
                                selected.has(option.value)
                                  ? 'border-primary bg-primary'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selected.has(option.value) && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
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
          disabled={question.required && selected.size === 0}
          className="ml-auto"
        >
          Continue
          {selected.size > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selected.size} selected
            </Badge>
          )}
        </Button>
      </div>
    </div>
  )
}