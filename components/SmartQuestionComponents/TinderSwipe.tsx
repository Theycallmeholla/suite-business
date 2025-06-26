/**
 * Smart Questions - Tinder Swipe Component
 * 
 * **Created**: December 23, 2024, 2:19 AM CST
 * **Last Updated**: December 23, 2024, 2:47 AM CST
 * 
 * An engaging swipe interface for selecting business differentiators
 * and unique selling points in a fun, interactive way.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { X, Check, ChevronLeft, Heart, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SwipeOption {
  value: string
  label: string
  icon?: string
  description?: string
  yesLabel?: string  // Clear yes/no messaging
  noLabel?: string
  skipIfKnown?: boolean  // Skip this question if we already know the answer
  allowUnsure?: boolean  // Allow "I don't know" option
}

interface TinderSwipeProps {
  question: string
  options: SwipeOption[]
  onComplete: (selected: string[]) => void
  maxSelections?: number
  className?: string
}

export function TinderSwipe({
  question,
  options,
  onComplete,
  maxSelections = 5,
  className
}: TinderSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [rejected, setRejected] = useState<string[]>([])
  const [unsure, setUnsure] = useState<string[]>([])
  const [exitX, setExitX] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const x = useMotionValue(0)
  const controls = useAnimation()
  
  // Smooth rotation based on drag
  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30])
  
  // Opacity for swipe indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])
  
  // Scale for the card underneath
  const scaleNext = useTransform(x, [-200, 0, 200], [1, 0.9, 1])
  
  const currentOption = options[currentIndex]
  const nextOption = options[currentIndex + 1]
  const progress = ((currentIndex) / options.length) * 100
  const isLastCard = currentIndex === options.length - 1

  const handleSwipeComplete = async (dir: 'left' | 'right' | 'unsure') => {
    if (!currentOption) return
    
    // Different animations for different actions
    if (dir === 'unsure') {
      // Fade out animation for unsure
      await controls.start({
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.3 }
      })
    } else {
      const exitVelocity = dir === 'right' ? 1000 : -1000
      // Animate card flying off
      await controls.start({
        x: exitVelocity,
        transition: { duration: 0.4, ease: 'easeOut' }
      })
    }
    
    // Update state
    if (dir === 'right' && selected.length < maxSelections) {
      setSelected([...selected, currentOption.value])
    } else if (dir === 'left') {
      setRejected([...rejected, currentOption.value])
    } else if (dir === 'unsure') {
      setUnsure([...unsure, currentOption.value])
    }
    
    // Move to next card
    if (currentIndex < options.length - 1) {
      setCurrentIndex(prev => prev + 1)
      // Reset position for new card
      controls.set({ x: 0, rotate: 0, opacity: 1, scale: 1 })
    } else {
      setIsComplete(true)
      onComplete(selected)
    }
  }

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      
      // Remove the last decision
      const previousOption = options[currentIndex - 1]
      if (selected.includes(previousOption.value)) {
        setSelected(selected.filter(v => v !== previousOption.value))
      } else if (rejected.includes(previousOption.value)) {
        setRejected(rejected.filter(v => v !== previousOption.value))
      } else if (unsure.includes(previousOption.value)) {
        setUnsure(unsure.filter(v => v !== previousOption.value))
      }
      
      // Reset card position
      controls.set({ x: 0, rotate: 0, opacity: 1, scale: 1 })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handleSwipeComplete('left')
    if (e.key === 'ArrowRight') handleSwipeComplete('right')
  }

  if (isComplete) {
    return (
      <div className={cn("w-full max-w-md mx-auto p-8 text-center", className)}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-2">Perfect!</h3>
        <p className="text-muted-foreground">
          You selected {selected.length} features that make your business unique
        </p>
      </div>
    )
  }

  return (
    <div 
      className={cn("w-full max-w-md mx-auto", className)}
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">{question}</h2>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {options.length}
          </span>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative h-[450px] mb-6">
        {/* Next card preview (underneath) */}
        {nextOption && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ scale: scaleNext }}
          >
            <div className="w-full h-full max-w-[350px] bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center text-center opacity-50">
              {nextOption.icon && (
                <div className="text-5xl mb-4 opacity-30">{nextOption.icon}</div>
              )}
              <h3 className="text-xl font-semibold text-gray-400">{nextOption.label}</h3>
            </div>
          </motion.div>
        )}
        
        {/* Current card */}
        <AnimatePresence>
          {currentOption && (
            <motion.div
              key={currentOption.value}
              className="absolute inset-0 flex items-center justify-center"
              style={{ x, rotate }}
              animate={controls}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(_, info) => {
                const swipeThreshold = 150
                if (Math.abs(info.velocity.x) >= 500 || Math.abs(info.offset.x) >= swipeThreshold) {
                  handleSwipeComplete(info.offset.x > 0 ? 'right' : 'left')
                } else {
                  // Spring back to center
                  controls.start({ x: 0, rotate: 0 })
                }
              }}
            >
              <div className="relative w-full h-full max-w-[350px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50" />
                
                {/* Content */}
                <div className="relative z-10">
                  {currentOption.icon && (
                    <motion.div 
                      className="text-7xl mb-6"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring" }}
                    >
                      {currentOption.icon}
                    </motion.div>
                  )}
                  <h3 className="text-2xl font-bold mb-3">{currentOption.label}</h3>
                  {currentOption.description && (
                    <p className="text-gray-600 text-sm">{currentOption.description}</p>
                  )}
                  
                  {/* Yes/No labels */}
                  <div className="mt-6 flex justify-center gap-8">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <X className="w-4 h-4 text-red-500" />
                      {currentOption.noLabel || "Skip"}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Heart className="w-4 h-4 text-green-500" />
                      {currentOption.yesLabel || "Yes!"}
                    </span>
                  </div>
                </div>
                
                {/* Swipe indicators */}
                <motion.div
                  className="absolute top-8 right-8 bg-green-500 text-white px-4 py-2 rounded-lg font-bold rotate-12"
                  style={{ opacity: likeOpacity }}
                >
                  YES!
                </motion.div>
                
                <motion.div
                  className="absolute top-8 left-8 bg-red-500 text-white px-4 py-2 rounded-lg font-bold -rotate-12"
                  style={{ opacity: nopeOpacity }}
                >
                  NOPE
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={handleUndo}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
          aria-label="Undo last choice"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <button
          onClick={() => handleSwipeComplete('left')}
          className="p-4 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-100"
          aria-label="Skip this option"
        >
          <X className="w-8 h-8 text-red-500" />
        </button>
        
        {currentOption?.allowUnsure && (
          <button
            onClick={() => handleSwipeComplete('unsure')}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all hover:scale-110"
            aria-label="I don't know"
          >
            <span className="text-xl">🤷</span>
          </button>
        )}
        
        <button
          onClick={() => handleSwipeComplete('right')}
          disabled={selected.length >= maxSelections}
          className="p-4 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Select this option"
        >
          <Heart className="w-8 h-8 text-green-500" />
        </button>
      </div>

      {/* Selected count */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          {selected.length} selected • {maxSelections - selected.length} remaining
        </p>
      </div>
    </div>
  )
}