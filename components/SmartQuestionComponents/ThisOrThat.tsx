/**
 * Smart Questions - This or That Component
 * 
 * **Created**: December 23, 2024, 3:08 AM CST
 * **Last Updated**: December 23, 2024, 3:08 AM CST
 * 
 * Binary choice questions for understanding business positioning and personality
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Zap, DollarSign, Sparkles, Shield, Monitor, Heart, TrendingUp, Users } from 'lucide-react'

export interface ThisOrThatOption {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  color?: string
}

interface ThisOrThatProps {
  question: string
  optionA: ThisOrThatOption
  optionB: ThisOrThatOption
  onSelect: (value: string) => void
  selected?: string
  className?: string
}

// Icon map for string-based icons
const iconMap: Record<string, React.ReactNode> = {
  zap: <Zap className="w-8 h-8" />,
  dollar: <DollarSign className="w-8 h-8" />,
  sparkles: <Sparkles className="w-8 h-8" />,
  shield: <Shield className="w-8 h-8" />,
  monitor: <Monitor className="w-8 h-8" />,
  heart: <Heart className="w-8 h-8" />,
  trending: <TrendingUp className="w-8 h-8" />,
  users: <Users className="w-8 h-8" />
}

export function ThisOrThat({
  question,
  optionA,
  optionB,
  onSelect,
  selected,
  className
}: ThisOrThatProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)

  const handleSelect = (value: string) => {
    onSelect(value)
  }

  const renderOption = (option: ThisOrThatOption, side: 'left' | 'right') => {
    const isSelected = selected === option.value
    const isHovered = hoveredOption === option.value
    const isOtherSelected = selected && selected !== option.value

    return (
      <motion.button
        className={cn(
          "relative w-full h-full p-8 flex flex-col items-center justify-center text-center transition-all duration-300",
          "border-2 rounded-2xl cursor-pointer overflow-hidden",
          isSelected && "border-primary bg-primary/5",
          !isSelected && !isOtherSelected && "border-gray-200 hover:border-gray-300 bg-white",
          isOtherSelected && "border-gray-100 bg-gray-50 opacity-50",
          className
        )}
        onClick={() => handleSelect(option.value)}
        onHoverStart={() => setHoveredOption(option.value)}
        onHoverEnd={() => setHoveredOption(null)}
        whileHover={{ scale: isOtherSelected ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background gradient on hover/select */}
        <motion.div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-300",
            option.color || (side === 'left' ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10' : 'bg-gradient-to-br from-blue-500/10 to-green-500/10')
          )}
          animate={{ opacity: isSelected || isHovered ? 1 : 0 }}
        />

        {/* Content */}
        <div className="relative z-10">
          {option.icon && (
            <motion.div 
              className={cn(
                "mb-4 mx-auto",
                isSelected ? "text-primary" : "text-gray-600"
              )}
              animate={{ 
                scale: isSelected ? 1.1 : 1,
                rotate: isSelected ? 5 : 0
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {typeof option.icon === 'string' ? iconMap[option.icon] : option.icon}
            </motion.div>
          )}
          
          <h3 className={cn(
            "text-2xl font-bold mb-2 transition-colors",
            isSelected ? "text-primary" : "text-gray-900"
          )}>
            {option.label}
          </h3>
          
          {option.description && (
            <p className={cn(
              "text-sm transition-colors",
              isSelected ? "text-gray-700" : "text-gray-500"
            )}>
              {option.description}
            </p>
          )}
        </div>

        {/* Selection indicator */}
        <motion.div
          className={cn(
            "absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center",
            isSelected ? "bg-primary text-white" : "bg-gray-200 text-gray-400"
          )}
          initial={false}
          animate={{ scale: isSelected ? 1 : 0.8 }}
        >
          {isSelected && (
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.path
                d="M3 8l3 3 7-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          )}
        </motion.div>
      </motion.button>
    )
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <h2 className="text-2xl font-bold text-center mb-8">{question}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
        {renderOption(optionA, 'left')}
        
        {/* OR divider */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none md:relative md:inset-auto">
          <div className="bg-white px-3 py-1 rounded-full border-2 border-gray-200 text-gray-400 font-medium text-sm md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20">
            OR
          </div>
        </div>
        
        {renderOption(optionB, 'right')}
      </div>
    </div>
  )
}