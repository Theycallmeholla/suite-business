/**
 * Smart Questions Demo Page
 * 
 * **Created**: December 23, 2024, 2:26 AM CST
 * **Last Updated**: December 23, 2024, 3:52 AM CST
 * 
 * Development page for testing Smart Question components
 */

'use client'

import { useState } from 'react'
import { Check, Zap, DollarSign, Sparkles, Shield } from 'lucide-react'
import { 
  TinderSwipe, 
  ThisOrThat, 
  StylePicker, 
  FontPairing, 
  MultipleChoice 
} from '@/components/SmartQuestionComponents'
import type { FontPairing as FontPairingType } from '@/components/SmartQuestionComponents'

export default function SmartQuestionsDemo() {
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [currentDemo, setCurrentDemo] = useState<'tinder' | 'thisorthat' | 'style' | 'font' | 'multiple'>('tinder')
  const [thisOrThatChoice, setThisOrThatChoice] = useState<string>('')
  const [styleChoice, setStyleChoice] = useState<string>('')
  const [fontChoice, setFontChoice] = useState<string>('')
  const [multipleChoices, setMultipleChoices] = useState<string[]>([])

  const differentiatorOptions = [
    { 
      value: 'emergency-service', 
      label: 'Do you offer 24/7 Emergency Service?', 
      icon: '🚨', 
      description: 'Available anytime for urgent needs',
      yesLabel: 'Yes, 24/7!',
      noLabel: 'No, business hours only'
    },
    { 
      value: 'free-estimates', 
      label: 'Do you provide Free Estimates?', 
      icon: '💰', 
      description: 'No charge for quotes',
      yesLabel: 'Yes, always free!',
      noLabel: 'No, we charge'
    },
    { 
      value: 'eco-friendly', 
      label: 'Are you Eco-Friendly?', 
      icon: '🌱', 
      description: 'Environmentally conscious practices',
      yesLabel: 'Yes, green certified!',
      noLabel: 'Not specifically'
    },
    { 
      value: 'family-owned', 
      label: 'Are you Family Owned?', 
      icon: '👨‍👩‍👧', 
      description: 'Owned and operated by a family',
      yesLabel: 'Yes, family owned!',
      noLabel: 'No, not family owned'
    },
    { 
      value: 'reviews', 
      label: 'Do you have 50+ 5-Star Reviews?', 
      icon: '⭐', 
      description: 'Proven customer satisfaction',
      yesLabel: 'Yes, highly rated!',
      noLabel: 'Not yet',
      skipIfKnown: true  // Skip if we have GBP data
    },
    { 
      value: 'guaranteed', 
      label: 'Do you offer a Satisfaction Guarantee?', 
      icon: '💯', 
      description: 'Money-back promise',
      yesLabel: 'Yes, 100%!',
      noLabel: 'No guarantees'
    },
    { 
      value: 'licensed', 
      label: 'Are you Licensed & Insured?', 
      icon: '📋', 
      description: 'Fully certified and protected',
      yesLabel: 'Yes, fully covered!',
      noLabel: 'Working on it',
      allowUnsure: true  // Business owner might need to check
    },
    { 
      value: 'award-winning', 
      label: 'Have you won Industry Awards?', 
      icon: '🏆', 
      description: 'Recognized excellence',
      yesLabel: 'Yes, award winner!',
      noLabel: 'Not yet',
      allowUnsure: true  // They might not be sure what counts as an award
    }
  ]

  const handleComplete = (selected: string[]) => {
    setSelectedValues(selected)
    setIsComplete(true)
  }

  const handleReset = () => {
    setSelectedValues([])
    setIsComplete(false)
  }

  // Sample data for new components
  const fontPairings: FontPairingType[] = [
    {
      id: 'modern-clean',
      name: 'Modern & Clean',
      heading: { fontFamily: 'Inter, sans-serif', weight: 700 },
      body: { fontFamily: 'Inter, sans-serif', weight: 400, lineHeight: '1.6' },
      personality: 'Professional and contemporary',
      bestFor: ['Tech', 'Healthcare', 'Finance']
    },
    {
      id: 'elegant-serif',
      name: 'Elegant & Traditional',
      heading: { fontFamily: 'Playfair Display, serif', weight: 700, letterSpacing: '-0.02em' },
      body: { fontFamily: 'Lora, serif', weight: 400, lineHeight: '1.7' },
      personality: 'Sophisticated and trustworthy',
      bestFor: ['Law', 'Real Estate', 'Luxury'],
      premium: true
    },
    {
      id: 'friendly-approachable',
      name: 'Friendly & Approachable',
      heading: { fontFamily: 'Poppins, sans-serif', weight: 600 },
      body: { fontFamily: 'Open Sans, sans-serif', weight: 400, lineHeight: '1.65' },
      personality: 'Warm and welcoming',
      bestFor: ['Service', 'Education', 'Retail']
    }
  ]

  const styleOptions = [
    {
      value: 'professional',
      label: 'Professional',
      description: 'Clean and corporate',
      preview: {
        colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' }
      }
    },
    {
      value: 'vibrant',
      label: 'Vibrant',
      description: 'Bold and energetic',
      preview: {
        colors: { primary: '#dc2626', secondary: '#f97316', accent: '#fbbf24' }
      }
    },
    {
      value: 'natural',
      label: 'Natural',
      description: 'Earthy and organic',
      preview: {
        colors: { primary: '#059669', secondary: '#84cc16', accent: '#a78bfa' }
      }
    }
  ]

  const serviceOptions = [
    { value: 'lawn-care', label: 'Lawn Care', icon: '🌱', popular: true },
    { value: 'tree-service', label: 'Tree Service', icon: '🌳' },
    { value: 'landscaping', label: 'Landscaping Design', icon: '🏡', recommended: true },
    { value: 'hardscaping', label: 'Hardscaping', icon: '🧱' },
    { value: 'irrigation', label: 'Irrigation', icon: '💧' },
    { value: 'snow-removal', label: 'Snow Removal', icon: '❄️' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Smart Questions Demo</h1>
          <p className="text-xl text-muted-foreground">
            Test the engaging question interfaces for the Intelligent Content System
          </p>
        </div>

        {/* Demo selector */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setCurrentDemo('tinder')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentDemo === 'tinder' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tinder Swipe
            </button>
            <button
              onClick={() => setCurrentDemo('thisorthat')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentDemo === 'thisorthat' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              This or That
            </button>
            <button
              onClick={() => setCurrentDemo('style')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentDemo === 'style' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Style Picker
            </button>
            <button
              onClick={() => setCurrentDemo('font')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentDemo === 'font' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Font Pairing
            </button>
            <button
              onClick={() => setCurrentDemo('multiple')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentDemo === 'multiple' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Multiple Choice
            </button>
          </div>
        </div>

        {/* Demo components */}
        {currentDemo === 'tinder' && !isComplete ? (
          <TinderSwipe
            question="Tell us about your business"
            options={differentiatorOptions}
            onComplete={handleComplete}
            maxSelections={8}
          />
        ) : currentDemo === 'thisorthat' ? (
          <div className="space-y-8">
            <ThisOrThat
              question="What matters more to your customers?"
              optionA={{
                value: 'fastest',
                label: 'Fastest Service',
                description: 'Quick turnaround times',
                icon: <Zap className="w-8 h-8" />
              }}
              optionB={{
                value: 'cheapest',
                label: 'Best Price',
                description: 'Most affordable option',
                icon: <DollarSign className="w-8 h-8" />
              }}
              onSelect={setThisOrThatChoice}
              selected={thisOrThatChoice}
            />
            {thisOrThatChoice && (
              <div className="text-center text-sm text-gray-600">
                You selected: <strong>{thisOrThatChoice === 'fastest' ? 'Fastest Service' : 'Best Price'}</strong>
              </div>
            )}
          </div>
        ) : currentDemo === 'style' ? (
          <StylePicker
            question="Choose your color scheme"
            options={styleOptions}
            onSelect={setStyleChoice}
            selected={styleChoice}
            type="color"
            businessName="Green Thumb Landscaping"
          />
        ) : currentDemo === 'font' ? (
          <FontPairing
            question="Select your typography style"
            pairings={fontPairings}
            onSelect={setFontChoice}
            selected={fontChoice}
            businessName="Premium Landscapes"
            tagline="Creating beautiful outdoor spaces"
          />
        ) : currentDemo === 'multiple' ? (
          <MultipleChoice
            question="Which services do you offer?"
            subtext="Select all that apply"
            options={serviceOptions}
            onSelect={(values) => setMultipleChoices(values as string[])}
            selected={multipleChoices}
            multiSelect={true}
            maxSelect={4}
            variant="cards"
            columns={3}
          />
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Your Business Features:</h2>
            {selectedValues.length > 0 ? (
              <div className="space-y-2 mb-6">
                {selectedValues.map(value => {
                  const option = differentiatorOptions.find(o => o.value === value)
                  return (
                    <div key={value} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-2xl">{option?.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-green-800">{option?.yesLabel}</p>
                        <p className="text-sm text-green-600">{option?.description}</p>
                      </div>
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 mb-6">You didn't select any features. Every business has something special!</p>
            )}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                {selectedValues.length > 0 
                  ? `Great! You have ${selectedValues.length} unique features that will help your business stand out.`
                  : `Try again and select the features that apply to your business.`
                }
              </p>
              <button
                onClick={handleReset}
                className="py-3 px-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Show results for other demos */}
        {currentDemo !== 'tinder' && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setThisOrThatChoice('')
                setStyleChoice('')
                setFontChoice('')
                setMultipleChoices([])
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset Selection
            </button>
          </div>
        )}

        <div className="mt-12 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">✨ Enhanced Features:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h4 className="font-medium text-purple-600 mb-2">🎯 Fluid Animations</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Smooth drag with spring physics</li>
                <li>• Natural rotation on swipe</li>
                <li>• Card stack visualization</li>
                <li>• Dynamic opacity indicators</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h4 className="font-medium text-pink-600 mb-2">💡 Clear UX</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Yes/No question format</li>
                <li>• Visual swipe feedback</li>
                <li>• Progress tracking</li>
                <li>• Undo functionality</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h4 className="font-medium text-green-600 mb-2">📱 Mobile Ready</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Touch gestures</li>
                <li>• Velocity-based swipes</li>
                <li>• Responsive design</li>
                <li>• Keyboard shortcuts</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h4 className="font-medium text-blue-600 mb-2">🎨 Tinder-Like Feel</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Card underneath preview</li>
                <li>• YES!/NOPE indicators</li>
                <li>• Heart/X button style</li>
                <li>• Elastic drag constraints</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}