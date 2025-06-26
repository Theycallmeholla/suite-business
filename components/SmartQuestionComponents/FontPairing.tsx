/**
 * Smart Questions - Font Pairing Component
 * 
 * **Created**: December 23, 2024, 3:47 AM CST
 * **Last Updated**: December 23, 2024, 3:47 AM CST
 * 
 * Elegant font combination selection with live previews
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

export interface FontPairing {
  id: string
  name: string
  heading: {
    fontFamily: string
    weight: number
    letterSpacing?: string
  }
  body: {
    fontFamily: string
    weight: number
    lineHeight?: string
  }
  personality: string
  bestFor: string[]
  premium?: boolean
}

interface FontPairingProps {
  question?: string
  pairings: FontPairing[]
  onSelect: (pairingId: string) => void
  selected?: string
  businessName?: string
  tagline?: string
  sampleText?: string
  className?: string
  showComparison?: boolean
}

export function FontPairing({
  question = "Choose your font style",
  pairings,
  onSelect,
  selected,
  businessName = "Your Business Name",
  tagline = "Your tagline goes here",
  sampleText = "We provide professional services with excellence and attention to detail. Our team is dedicated to delivering the best results for our clients.",
  className,
  showComparison = false
}: FontPairingProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredPairing, setHoveredPairing] = useState<string | null>(null)
  const [comparisonMode, setComparisonMode] = useState(showComparison)
  const [compareIndices, setCompareIndices] = useState<[number, number]>([0, 1])

  const currentPairing = pairings[currentIndex]

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % pairings.length)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + pairings.length) % pairings.length)
  }

  const handleSelect = (pairingId: string) => {
    onSelect(pairingId)
  }

  const renderSingleView = () => (
    <div className="relative max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPairing.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "bg-white rounded-2xl shadow-lg p-8 md:p-12",
            selected === currentPairing.id && "ring-2 ring-primary ring-offset-4"
          )}
        >
          {/* Sample Preview */}
          <div className="mb-8">
            <h1 
              className="text-4xl md:text-5xl mb-2"
              style={{
                fontFamily: currentPairing.heading.fontFamily,
                fontWeight: currentPairing.heading.weight,
                letterSpacing: currentPairing.heading.letterSpacing
              }}
            >
              {businessName}
            </h1>
            <p 
              className="text-xl text-gray-600 mb-6"
              style={{
                fontFamily: currentPairing.body.fontFamily,
                fontWeight: currentPairing.body.weight,
                lineHeight: currentPairing.body.lineHeight
              }}
            >
              {tagline}
            </p>
            <p 
              className="text-gray-700 leading-relaxed"
              style={{
                fontFamily: currentPairing.body.fontFamily,
                fontWeight: currentPairing.body.weight,
                lineHeight: currentPairing.body.lineHeight
              }}
            >
              {sampleText}
            </p>
          </div>

          {/* Font Info */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {currentPairing.name}
                  {currentPairing.premium && (
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  )}
                </h3>
                <p className="text-sm text-gray-500">{currentPairing.personality}</p>
              </div>
              <motion.button
                className={cn(
                  "px-6 py-3 rounded-lg font-medium transition-all",
                  selected === currentPairing.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                )}
                onClick={() => handleSelect(currentPairing.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {selected === currentPairing.id ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Selected
                  </span>
                ) : (
                  "Select This Style"
                )}
              </motion.button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {currentPairing.bestFor.map((use) => (
                <span
                  key={use}
                  className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-600"
                >
                  {use}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <motion.button
          className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          onClick={handlePrevious}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <div className="flex gap-2">
          {pairings.map((_, index) => (
            <motion.button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? "bg-primary" : "bg-gray-300"
              )}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        <motion.button
          className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          onClick={handleNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Quick comparison toggle */}
      <div className="text-center mt-6">
        <button
          className="text-sm text-gray-500 hover:text-gray-700 underline"
          onClick={() => setComparisonMode(true)}
        >
          Compare side by side
        </button>
      </div>
    </div>
  )

  const renderComparisonView = () => {
    const [leftIndex, rightIndex] = compareIndices
    const leftPairing = pairings[leftIndex]
    const rightPairing = pairings[rightIndex]

    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[leftPairing, rightPairing].map((pairing, idx) => {
            const pairingIndex = idx === 0 ? leftIndex : rightIndex
            const isSelected = selected === pairing.id

            return (
              <motion.div
                key={`${pairing.id}-${idx}`}
                className={cn(
                  "bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all",
                  "hover:shadow-lg",
                  isSelected && "ring-2 ring-primary"
                )}
                onClick={() => handleSelect(pairing.id)}
                whileHover={{ y: -4 }}
              >
                {/* Mini preview */}
                <div className="mb-4">
                  <h2 
                    className="text-2xl mb-1"
                    style={{
                      fontFamily: pairing.heading.fontFamily,
                      fontWeight: pairing.heading.weight,
                      letterSpacing: pairing.heading.letterSpacing
                    }}
                  >
                    {businessName}
                  </h2>
                  <p 
                    className="text-sm text-gray-600 mb-3"
                    style={{
                      fontFamily: pairing.body.fontFamily,
                      fontWeight: pairing.body.weight
                    }}
                  >
                    {tagline}
                  </p>
                  <p 
                    className="text-xs text-gray-500 line-clamp-3"
                    style={{
                      fontFamily: pairing.body.fontFamily,
                      fontWeight: pairing.body.weight,
                      lineHeight: pairing.body.lineHeight
                    }}
                  >
                    {sampleText}
                  </p>
                </div>

                {/* Info */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm flex items-center gap-1">
                      {pairing.name}
                      {pairing.premium && (
                        <Sparkles className="w-3 h-3 text-yellow-500" />
                      )}
                    </h4>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{pairing.personality}</p>
                </div>

                {/* Font selector dropdown */}
                <select
                  className="mt-3 w-full text-xs p-1 border rounded"
                  value={pairingIndex}
                  onChange={(e) => {
                    const newIndex = parseInt(e.target.value)
                    setCompareIndices(prev => 
                      idx === 0 ? [newIndex, prev[1]] : [prev[0], newIndex]
                    )
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {pairings.map((p, i) => (
                    <option key={i} value={i}>{p.name}</option>
                  ))}
                </select>
              </motion.div>
            )
          })}
        </div>

        <div className="text-center mt-6">
          <button
            className="text-sm text-gray-500 hover:text-gray-700 underline"
            onClick={() => setComparisonMode(false)}
          >
            View one at a time
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <h2 className="text-2xl font-bold text-center mb-8">{question}</h2>
      
      {comparisonMode ? renderComparisonView() : renderSingleView()}
    </div>
  )
}