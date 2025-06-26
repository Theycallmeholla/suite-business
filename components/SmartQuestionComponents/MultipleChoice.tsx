/**
 * Smart Questions - Multiple Choice Component
 * 
 * **Created**: December 23, 2024, 3:49 AM CST
 * **Last Updated**: December 23, 2024, 3:49 AM CST
 * 
 * Multiple choice questions with single or multi-select options
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check, Plus, X } from 'lucide-react'

export interface ChoiceOption {
  value: string
  label: string
  description?: string
  icon?: string | React.ReactNode
  popular?: boolean
  recommended?: boolean
  disabled?: boolean
}

interface MultipleChoiceProps {
  question: string
  subtext?: string
  options: ChoiceOption[]
  onSelect: (values: string | string[]) => void
  selected?: string | string[]
  multiSelect?: boolean
  minSelect?: number
  maxSelect?: number
  columns?: 1 | 2 | 3 | 4
  variant?: 'cards' | 'buttons' | 'chips'
  className?: string
}

export function MultipleChoice({
  question,
  subtext,
  options,
  onSelect,
  selected = [],
  multiSelect = false,
  minSelect = 0,
  maxSelect,
  columns = 2,
  variant = 'cards',
  className
}: MultipleChoiceProps) {
  const selectedArray = Array.isArray(selected) ? selected : (selected ? [selected] : [])
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)

  const handleSelect = (value: string) => {
    if (multiSelect) {
      const newSelection = selectedArray.includes(value)
        ? selectedArray.filter(v => v !== value)
        : [...selectedArray, value]
      
      // Enforce max selection
      if (maxSelect && newSelection.length > maxSelect) {
        return
      }
      
      onSelect(newSelection)
    } else {
      onSelect(value)
    }
  }

  const isSelected = (value: string) => {
    return selectedArray.includes(value)
  }

  const canSelectMore = !maxSelect || selectedArray.length < maxSelect
  const hasMinimum = selectedArray.length >= minSelect

  const renderCard = (option: ChoiceOption) => {
    const selected = isSelected(option.value)
    const hovered = hoveredOption === option.value
    const disabled = option.disabled || (!selected && !canSelectMore)

    return (
      <motion.button
        key={option.value}
        className={cn(
          "relative p-4 md:p-6 border-2 rounded-xl transition-all text-left",
          "hover:shadow-md",
          selected && "border-primary bg-primary/5",
          !selected && !disabled && "border-gray-200 bg-white hover:border-gray-300",
          disabled && "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => !disabled && handleSelect(option.value)}
        onHoverStart={() => setHoveredOption(option.value)}
        onHoverEnd={() => setHoveredOption(null)}
        whileHover={!disabled ? { y: -2 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        disabled={disabled}
      >
        {/* Popular/Recommended badge */}
        {(option.popular || option.recommended) && (
          <div className="absolute -top-2 -right-2">
            <span className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              option.popular && "bg-blue-100 text-blue-700",
              option.recommended && "bg-green-100 text-green-700"
            )}>
              {option.popular ? "Popular" : "Recommended"}
            </span>
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Icon */}
          {option.icon && (
            <div className={cn(
              "text-2xl flex-shrink-0",
              selected && "animate-bounce-once"
            )}>
              {typeof option.icon === 'string' ? option.icon : option.icon}
            </div>
          )}

          {/* Content */}
          <div className="flex-1">
            <h4 className={cn(
              "font-semibold mb-1",
              selected && "text-primary"
            )}>
              {option.label}
            </h4>
            {option.description && (
              <p className="text-sm text-gray-600">
                {option.description}
              </p>
            )}
          </div>

          {/* Selection indicator */}
          <motion.div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
              selected ? "bg-primary text-white" : "bg-gray-200"
            )}
            animate={{ scale: selected ? 1 : 0.8 }}
          >
            {selected && <Check className="w-4 h-4" />}
          </motion.div>
        </div>
      </motion.button>
    )
  }

  const renderButton = (option: ChoiceOption) => {
    const selected = isSelected(option.value)
    const disabled = option.disabled || (!selected && !canSelectMore)

    return (
      <motion.button
        key={option.value}
        className={cn(
          "px-6 py-3 rounded-lg font-medium transition-all",
          selected && "bg-primary text-white",
          !selected && !disabled && "bg-gray-100 hover:bg-gray-200 text-gray-700",
          disabled && "bg-gray-50 text-gray-400 cursor-not-allowed"
        )}
        onClick={() => !disabled && handleSelect(option.value)}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        disabled={disabled}
      >
        <span className="flex items-center gap-2">
          {option.icon && (
            <span>{typeof option.icon === 'string' ? option.icon : option.icon}</span>
          )}
          {option.label}
          {selected && <Check className="w-4 h-4" />}
        </span>
      </motion.button>
    )
  }

  const renderChip = (option: ChoiceOption) => {
    const selected = isSelected(option.value)
    const disabled = option.disabled || (!selected && !canSelectMore)

    return (
      <motion.button
        key={option.value}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all border",
          selected && "bg-primary text-white border-primary",
          !selected && !disabled && "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
          disabled && "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
        )}
        onClick={() => !disabled && handleSelect(option.value)}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        disabled={disabled}
      >
        <span className="flex items-center gap-1">
          {option.label}
          {selected && (
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: "auto" }}
              className="overflow-hidden"
            >
              <X className="w-3 h-3 ml-1" />
            </motion.span>
          )}
          {!selected && !disabled && multiSelect && (
            <Plus className="w-3 h-3 ml-1 text-gray-400" />
          )}
        </span>
      </motion.button>
    )
  }

  const renderOption = (option: ChoiceOption) => {
    switch (variant) {
      case 'buttons':
        return renderButton(option)
      case 'chips':
        return renderChip(option)
      case 'cards':
      default:
        return renderCard(option)
    }
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">{question}</h2>
        {subtext && (
          <p className="text-gray-600">{subtext}</p>
        )}
        {multiSelect && (
          <p className="text-sm text-gray-500 mt-2">
            {maxSelect 
              ? `Select up to ${maxSelect} option${maxSelect > 1 ? 's' : ''}`
              : 'Select all that apply'
            }
            {minSelect > 0 && ` (minimum ${minSelect})`}
          </p>
        )}
      </div>

      <div className={cn(
        variant === 'cards' && `grid gap-4 ${gridCols[columns]}`,
        variant === 'buttons' && "flex flex-wrap gap-3 justify-center",
        variant === 'chips' && "flex flex-wrap gap-2 justify-center"
      )}>
        {options.map(renderOption)}
      </div>

      {/* Selection counter for multi-select */}
      {multiSelect && maxSelect && (
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm">
            <span className={cn(
              "font-medium",
              !hasMinimum && "text-orange-600",
              hasMinimum && selectedArray.length === maxSelect && "text-green-600"
            )}>
              {selectedArray.length} / {maxSelect} selected
            </span>
            {!hasMinimum && minSelect > 0 && (
              <span className="text-gray-500">
                (need {minSelect - selectedArray.length} more)
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}