/**
 * Real-Time Preview System - Live Website Preview
 * 
 * **Created**: December 23, 2024, 11:15 AM CST
 * **Last Updated**: December 23, 2024, 11:15 AM CST
 * 
 * Shows users how their answers immediately improve their website,
 * creating engagement and demonstrating value in real-time.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Monitor, 
  Smartphone, 
  Eye, 
  TrendingUp, 
  Star,
  Phone,
  MapPin,
  Clock,
  Shield,
  Award,
  Zap,
  Heart,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PreviewData {
  businessName: string
  industry: string
  services: string[]
  differentiators: string[]
  positioning: 'speed' | 'quality' | 'value'
  colorScheme: string
  typography: string
  availability: '24-7' | 'business-hours'
  location?: string
  phone?: string
}

interface RealTimePreviewProps {
  data: Partial<PreviewData>
  currentQuestion?: string
  latestAnswer?: any
  onImprovementDetected?: (improvement: string) => void
  className?: string
}

export function RealTimePreview({
  data,
  currentQuestion,
  latestAnswer,
  onImprovementDetected,
  className
}: RealTimePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [improvements, setImprovements] = useState<string[]>([])
  const [animatingElements, setAnimatingElements] = useState<string[]>([])

  useEffect(() => {
    if (currentQuestion && latestAnswer) {
      const newImprovements = detectImprovements(currentQuestion, latestAnswer)
      if (newImprovements.length > 0) {
        setImprovements(prev => [...prev, ...newImprovements])
        setAnimatingElements(newImprovements)
        
        // Notify parent of improvements
        newImprovements.forEach(improvement => {
          onImprovementDetected?.(improvement)
        })
        
        // Clear animation after delay
        setTimeout(() => setAnimatingElements([]), 2000)
      }
    }
  }, [currentQuestion, latestAnswer, onImprovementDetected])

  const detectImprovements = (questionId: string, answer: any): string[] => {
    const improvements: string[] = []
    
    switch (questionId) {
      case 'services':
        if (Array.isArray(answer) && answer.length > 0) {
          improvements.push('services-added', 'seo-improved')
        }
        break
      
      case 'differentiation':
        if (Array.isArray(answer)) {
          if (answer.includes('licensed')) improvements.push('trust-signals')
          if (answer.includes('emergency-service')) improvements.push('urgency-messaging')
          if (answer.includes('award-winning')) improvements.push('credibility-boost')
        }
        break
      
      case 'business_positioning':
        improvements.push('messaging-optimized', 'target-audience-focused')
        break
      
      case 'color_scheme':
        improvements.push('visual-appeal', 'brand-consistency')
        break
      
      case 'emergency_availability':
        if (answer === '24-7') {
          improvements.push('emergency-prominence', 'phone-visibility')
        }
        break
    }
    
    return improvements
  }

  const getColorScheme = () => {
    const schemes = {
      'trust-blue': { primary: '#1E40AF', secondary: '#3B82F6', accent: '#93C5FD' },
      'natural-green': { primary: '#2D5016', secondary: '#4A7C59', accent: '#8FBC8F' },
      'professional-navy': { primary: '#1E293B', secondary: '#475569', accent: '#94A3B8' },
      'warm-gray': { primary: '#374151', secondary: '#6B7280', accent: '#D1D5DB' }
    }
    
    return schemes[data.colorScheme as keyof typeof schemes] || schemes['trust-blue']
  }

  const colors = getColorScheme()

  return (
    <div className={cn("space-y-6", className)}>
      {/* Preview Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Preview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('desktop')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'desktop' ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            )}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'mobile' ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            )}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Website Preview */}
      <Card className="overflow-hidden">
        <div className={cn(
          "transition-all duration-500",
          viewMode === 'desktop' ? "w-full" : "w-80 mx-auto"
        )}>
          {/* Browser/Phone Frame */}
          <div className="bg-gray-100 p-2 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500">
                {data.businessName?.toLowerCase().replace(/\s+/g, '') || 'yourbusiness'}.com
              </div>
            </div>
          </div>

          {/* Website Content */}
          <div className="bg-white min-h-96">
            {/* Header */}
            <motion.header 
              className="p-6 border-b"
              style={{ backgroundColor: colors.primary }}
              animate={animatingElements.includes('brand-consistency') ? { scale: [1, 1.02, 1] } : {}}
            >
              <div className="flex items-center justify-between text-white">
                <motion.h1 
                  className="text-2xl font-bold"
                  animate={animatingElements.includes('visual-appeal') ? { y: [-5, 0] } : {}}
                >
                  {data.businessName || 'Your Business Name'}
                </motion.h1>
                
                <motion.div 
                  className="flex items-center gap-4"
                  animate={animatingElements.includes('phone-visibility') ? { scale: [1, 1.1, 1] } : {}}
                >
                  {data.availability === '24-7' && (
                    <Badge variant="secondary" className="bg-red-500 text-white">
                      24/7 Emergency
                    </Badge>
                  )}
                  <Phone className="w-5 h-5" />
                </motion.div>
              </div>
            </motion.header>

            {/* Hero Section */}
            <motion.section 
              className="p-8 text-center"
              style={{ backgroundColor: `${colors.primary}10` }}
            >
              <motion.h2 
                className="text-3xl font-bold mb-4"
                animate={animatingElements.includes('messaging-optimized') ? { scale: [1, 1.05, 1] } : {}}
              >
                {getHeroHeadline()}
              </motion.h2>
              
              <motion.p 
                className="text-lg text-gray-600 mb-6"
                animate={animatingElements.includes('target-audience-focused') ? { opacity: [0.5, 1] } : {}}
              >
                {getHeroSubtext()}
              </motion.p>

              {/* Trust Signals */}
              <motion.div 
                className="flex justify-center gap-4 mb-6"
                animate={animatingElements.includes('trust-signals') ? { y: [-10, 0] } : {}}
              >
                {data.differentiators?.map((diff, index) => (
                  <motion.div
                    key={diff}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm"
                  >
                    {getTrustIcon(diff)}
                    <span className="text-sm font-medium">{formatDifferentiator(diff)}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.button
                className="px-8 py-3 rounded-lg text-white font-semibold"
                style={{ backgroundColor: colors.secondary }}
                animate={animatingElements.includes('urgency-messaging') ? { scale: [1, 1.05, 1] } : {}}
                whileHover={{ scale: 1.05 }}
              >
                {getCTAText()}
              </motion.button>
            </motion.section>

            {/* Services Section */}
            <motion.section 
              className="p-8"
              animate={animatingElements.includes('services-added') ? { opacity: [0.3, 1] } : {}}
            >
              <h3 className="text-2xl font-bold mb-6 text-center">Our Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(data.services || []).slice(0, 6).map((service, index) => (
                  <motion.div
                    key={service}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-semibold mb-2">{formatService(service)}</h4>
                    <p className="text-sm text-gray-600">Professional {formatService(service).toLowerCase()} services</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Contact Section */}
            <section className="p-8 bg-gray-50">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Get In Touch</h3>
                <div className="flex justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    <span>{data.phone || '(555) 123-4567'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{data.location || 'Your City, State'}</span>
                  </div>
                  {data.availability === '24-7' && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>24/7 Available</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </Card>

      {/* Improvement Indicators */}
      <AnimatePresence>
        {improvements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Recent Improvements
            </h4>
            <div className="flex flex-wrap gap-2">
              {improvements.slice(-5).map((improvement, index) => (
                <motion.div
                  key={`${improvement}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {formatImprovement(improvement)}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  function getHeroHeadline(): string {
    const businessName = data.businessName || 'Your Business'
    
    if (data.positioning === 'speed') {
      return `Fast, Reliable ${data.industry || 'Service'} - ${businessName}`
    } else if (data.positioning === 'quality') {
      return `Premium ${data.industry || 'Service'} Excellence - ${businessName}`
    } else {
      return `Professional ${data.industry || 'Service'} - ${businessName}`
    }
  }

  function getHeroSubtext(): string {
    if (data.availability === '24-7') {
      return '24/7 emergency service available. Call now for immediate assistance!'
    } else if (data.positioning === 'quality') {
      return 'Delivering exceptional quality and craftsmanship you can trust.'
    } else if (data.positioning === 'speed') {
      return 'Quick response times and efficient service when you need it most.'
    } else {
      return 'Professional service you can count on for all your needs.'
    }
  }

  function getCTAText(): string {
    if (data.availability === '24-7') {
      return 'Call Now: 24/7 Emergency'
    } else if (data.positioning === 'speed') {
      return 'Get Fast Service'
    } else {
      return 'Get Free Estimate'
    }
  }

  function getTrustIcon(differentiator: string) {
    const icons = {
      'licensed': <Shield className="w-4 h-4 text-blue-600" />,
      'award-winning': <Award className="w-4 h-4 text-yellow-600" />,
      'family-owned': <Heart className="w-4 h-4 text-red-600" />,
      'emergency-service': <Zap className="w-4 h-4 text-orange-600" />,
      'guaranteed': <CheckCircle2 className="w-4 h-4 text-green-600" />,
      'best-rated': <Star className="w-4 h-4 text-yellow-600" />
    }
    
    return icons[differentiator as keyof typeof icons] || <CheckCircle2 className="w-4 h-4 text-gray-600" />
  }

  function formatDifferentiator(diff: string): string {
    const formats = {
      'licensed': 'Licensed & Insured',
      'award-winning': 'Award Winning',
      'family-owned': 'Family Owned',
      'emergency-service': '24/7 Emergency',
      'guaranteed': 'Satisfaction Guaranteed',
      'best-rated': 'Best Rated',
      'eco-friendly': 'Eco-Friendly',
      'veteran-owned': 'Veteran Owned',
      'women-owned': 'Women Owned'
    }
    
    return formats[diff as keyof typeof formats] || diff.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  function formatService(service: string): string {
    return service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  function formatImprovement(improvement: string): string {
    const formats = {
      'services-added': 'Services Added',
      'seo-improved': 'SEO Improved',
      'trust-signals': 'Trust Signals Added',
      'urgency-messaging': 'Urgency Messaging',
      'credibility-boost': 'Credibility Boosted',
      'messaging-optimized': 'Messaging Optimized',
      'target-audience-focused': 'Audience Focused',
      'visual-appeal': 'Visual Appeal Enhanced',
      'brand-consistency': 'Brand Consistency',
      'emergency-prominence': 'Emergency Prominence',
      'phone-visibility': 'Phone Visibility'
    }
    
    return formats[improvement as keyof typeof formats] || improvement.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}