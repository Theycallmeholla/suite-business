/**
 * Smart Questions - Style Picker Component
 * 
 * **Created**: December 23, 2024, 3:10 AM CST
 * **Last Updated**: December 23, 2024, 3:10 AM CST
 * 
 * Visual style selection with live previews
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface StyleOption {
  value: string
  label: string
  description?: string
  preview: {
    fontFamily?: string
    fontSize?: string
    fontWeight?: string | number
    letterSpacing?: string
    lineHeight?: string
    colors?: {
      primary: string
      secondary: string
      accent?: string
    }
    className?: string
  }
}

interface StylePickerProps {
  question: string
  options: StyleOption[]
  onSelect: (value: string) => void
  selected?: string
  businessName?: string
  previewText?: string
  type?: 'font' | 'color' | 'layout'
  className?: string
}

export function StylePicker({
  question,
  options,
  onSelect,
  selected,
  businessName = "Your Business Name",
  previewText = "We provide professional services with excellence and care",
  type = 'font',
  className
}: StylePickerProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)

  const renderFontPreview = (option: StyleOption) => {
    const isSelected = selected === option.value
    const isHovered = hoveredOption === option.value

    return (
      <motion.button
        key={option.value}
        className={cn(
          "relative p-6 border-2 rounded-xl transition-all cursor-pointer",
          "hover:shadow-lg",
          isSelected ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:border-gray-300"
        )}
        onClick={() => onSelect(option.value)}
        onHoverStart={() => setHoveredOption(option.value)}
        onHoverEnd={() => setHoveredOption(null)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Preview content */}
        <div className="space-y-3">
          <h3 
            className="text-2xl"
            style={{
              fontFamily: option.preview.fontFamily,
              fontWeight: option.preview.fontWeight || 700,
              letterSpacing: option.preview.letterSpacing
            }}
          >
            {businessName}
          </h3>
          <p 
            className="text-gray-600"
            style={{
              fontFamily: option.preview.fontFamily,
              fontSize: option.preview.fontSize || '16px',
              lineHeight: option.preview.lineHeight
            }}
          >
            {previewText}
          </p>
        </div>

        {/* Label and description */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="font-semibold text-sm">{option.label}</h4>
          {option.description && (
            <p className="text-xs text-gray-500 mt-1">{option.description}</p>
          )}
        </div>

        {/* Selection indicator */}
        <motion.div
          className={cn(
            "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center",
            isSelected ? "bg-primary text-white" : "bg-gray-100"
          )}
          animate={{ scale: isSelected ? 1 : 0.8 }}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </motion.div>
      </motion.button>
    )
  }

  const renderColorPreview = (option: StyleOption) => {
    const isSelected = selected === option.value
    const colors = option.preview.colors

    return (
      <motion.button
        key={option.value}
        className={cn(
          "relative p-6 border-2 rounded-xl transition-all cursor-pointer",
          "hover:shadow-lg",
          isSelected ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:border-gray-300"
        )}
        onClick={() => onSelect(option.value)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Color swatches */}
        <div className="flex gap-2 mb-4">
          {colors && (
            <>
              <div 
                className="w-16 h-16 rounded-lg shadow-sm"
                style={{ backgroundColor: colors.primary }}
              />
              <div 
                className="w-16 h-16 rounded-lg shadow-sm"
                style={{ backgroundColor: colors.secondary }}
              />
              {colors.accent && (
                <div 
                  className="w-16 h-16 rounded-lg shadow-sm"
                  style={{ backgroundColor: colors.accent }}
                />
              )}
            </>
          )}
        </div>

        {/* Mock website preview */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="space-y-2">
            <div 
              className="h-8 rounded"
              style={{ backgroundColor: colors?.primary }}
            />
            <div className="flex gap-2">
              <div className="h-4 flex-1 bg-gray-200 rounded" />
              <div 
                className="h-4 w-20 rounded"
                style={{ backgroundColor: colors?.secondary }}
              />
            </div>
          </div>
        </div>

        {/* Label */}
        <h4 className="font-semibold text-sm">{option.label}</h4>
        {option.description && (
          <p className="text-xs text-gray-500 mt-1">{option.description}</p>
        )}

        {/* Selection indicator */}
        <motion.div
          className={cn(
            "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center",
            isSelected ? "bg-primary text-white" : "bg-gray-100"
          )}
          animate={{ scale: isSelected ? 1 : 0.8 }}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </motion.div>
      </motion.button>
    )
  }

  const renderLayoutPreview = (option: StyleOption) => {
    const isSelected = selected === option.value

    return (
      <motion.button
        key={option.value}
        className={cn(
          "relative p-6 border-2 rounded-xl transition-all cursor-pointer",
          "hover:shadow-lg",
          isSelected ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:border-gray-300"
        )}
        onClick={() => onSelect(option.value)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Layout preview - simplified website mockup */}
        <div className={cn(
          "bg-gray-50 rounded-lg p-4 mb-4 space-y-3",
          option.preview.className
        )}>
          <div className="h-8 bg-gray-300 rounded" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-4/5" />
            <div className="h-3 bg-gray-200 rounded w-3/5" />
          </div>
        </div>

        {/* Label */}
        <h4 className="font-semibold text-sm">{option.label}</h4>
        {option.description && (
          <p className="text-xs text-gray-500 mt-1">{option.description}</p>
        )}

        {/* Selection indicator */}
        <motion.div
          className={cn(
            "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center",
            isSelected ? "bg-primary text-white" : "bg-gray-100"
          )}
          animate={{ scale: isSelected ? 1 : 0.8 }}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </motion.div>
      </motion.button>
    )
  }

  const renderOption = (option: StyleOption) => {
    switch (type) {
      case 'font':
        return renderFontPreview(option)
      case 'color':
        return renderColorPreview(option)
      case 'layout':
        return renderLayoutPreview(option)
      default:
        return renderFontPreview(option)
    }
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <h2 className="text-2xl font-bold text-center mb-8">{question}</h2>
      
      <div className={cn(
        "grid gap-6",
        type === 'layout' ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
      )}>
        {options.map(renderOption)}
      </div>
    </div>
  )
}