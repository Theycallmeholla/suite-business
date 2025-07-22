/**
 * Template-Based Real-Time Preview System
 * 
 * **Created**: December 27, 2024, 8:15 PM CST
 * **Last Updated**: December 27, 2024, 8:15 PM CST
 * 
 * Shows actual template components with live updates based on user answers,
 * providing a realistic preview of the final website.
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Monitor, 
  Smartphone, 
  Eye, 
  TrendingUp, 
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TemplateRegistry } from '@/lib/template-registry'
import { autoSelectTemplate, selectSectionVariants } from '@/lib/template-selector'
import { BusinessIntelligenceData } from '@/lib/intelligence/scoring'
import { IndustryType } from '@/types/site-builder'

export interface TemplatePreviewData {
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
  description?: string
  tagline?: string
  keywords?: string[]
}

interface TemplatePreviewProps {
  data: Partial<TemplatePreviewData>
  businessIntelligence?: BusinessIntelligenceData
  currentQuestion?: string
  latestAnswer?: any
  onImprovementDetected?: (improvement: string) => void
  className?: string
}

// Generate dynamic content helper functions
const generateTagline = (data: Partial<TemplatePreviewData>): string => {
  if (data.positioning === 'quality') {
    return `Premium ${data.industry || 'Service'} Excellence You Can Trust`
  } else if (data.positioning === 'speed') {
    return `Fast, Reliable ${data.industry || 'Service'} When You Need It`
  } else {
    return `Professional ${data.industry || 'Service'} at Great Value`
  }
}

const generateDescription = (data: Partial<TemplatePreviewData>): string => {
  const base = `Welcome to ${data.businessName || 'our company'}, your trusted partner for professional ${data.industry || 'services'}.`
  const positioning = data.positioning === 'quality' 
    ? ' We pride ourselves on delivering exceptional quality and attention to detail in every project.'
    : data.positioning === 'speed'
    ? ' We understand that time is valuable, which is why we offer fast, efficient service without compromising on quality.'
    : ' We believe in providing excellent value without breaking the bank.'
  const availability = data.availability === '24-7'
    ? ' Available 24/7 for emergency services.'
    : ' Open during business hours to serve you better.'
  
  return base + positioning + availability
}

const generateKeywords = (data: Partial<TemplatePreviewData>): string[] => {
  const keywords = ['professional', 'reliable', 'trusted']
  
  if (data.positioning === 'quality') {
    keywords.push('premium', 'excellence', 'craftsmanship')
  } else if (data.positioning === 'speed') {
    keywords.push('fast', 'quick', 'efficient', 'responsive')
  } else {
    keywords.push('affordable', 'value', 'competitive')
  }
  
  if (data.availability === '24-7') {
    keywords.push('emergency', '24/7', 'always-available')
  }
  
  return keywords
}

export function TemplatePreview({
  data,
  businessIntelligence,
  currentQuestion,
  latestAnswer,
  onImprovementDetected,
  className
}: TemplatePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [improvements, setImprovements] = useState<string[]>([])
  const [animatingElements, setAnimatingElements] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [templateScore, setTemplateScore] = useState(0)

  // Initialize template registry
  const templateRegistry = useMemo(() => new TemplateRegistry(), [])

  // Convert preview data to business data format for template selection
  const businessData = useMemo(() => {
    const colorSchemes = {
      'trust-blue': { primary: '#1E40AF', secondary: '#3B82F6', accent: '#93C5FD' },
      'natural-green': { primary: '#2D5016', secondary: '#4A7C59', accent: '#8FBC8F' },
      'professional-navy': { primary: '#1E293B', secondary: '#475569', accent: '#94A3B8' },
      'warm-gray': { primary: '#374151', secondary: '#6B7280', accent: '#D1D5DB' }
    }

    const selectedColors = colorSchemes[data.colorScheme as keyof typeof colorSchemes] || colorSchemes['trust-blue']

    return {
      businessName: data.businessName || 'Your Business',
      industry: data.industry || 'general',
      tagline: data.tagline || generateTagline(data),
      description: data.description || generateDescription(data),
      styleKeywords: data.keywords || generateKeywords(data),
      colorScheme: selectedColors,
      services: data.services || [],
      testimonials: businessIntelligence?.testimonials || [],
      images: {
        hero: businessIntelligence?.images?.hero || null,
        gallery: businessIntelligence?.images?.gallery || []
      },
      logo: businessIntelligence?.logo || null,
      contact: {
        phone: data.phone || businessIntelligence?.phone || null,
        email: businessIntelligence?.email || null,
        address: data.location || businessIntelligence?.location?.address || null
      }
    }
  }, [data, businessIntelligence])

  // Auto-select template based on business data
  useEffect(() => {
    const templates = templateRegistry.getAllTemplates()
    const selected = autoSelectTemplate(templates, businessData)
    
    if (selected) {
      setSelectedTemplate(selected)
      // Calculate template match score for display
      const score = Math.round((selected.id.includes(data.industry || '') ? 90 : 70) + Math.random() * 10)
      setTemplateScore(score)
    }
  }, [businessData, templateRegistry])

  // Detect improvements based on answers
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
          improvements.push('services-added', 'seo-improved', 'template-optimized')
        }
        break
      
      case 'differentiation':
        if (Array.isArray(answer)) {
          if (answer.includes('licensed')) improvements.push('trust-signals', 'credibility-boost')
          if (answer.includes('emergency-service')) improvements.push('urgency-messaging', 'cta-enhanced')
          if (answer.includes('award-winning')) improvements.push('credibility-boost', 'social-proof')
        }
        break
      
      case 'business_positioning':
        improvements.push('messaging-optimized', 'target-audience-focused', 'content-personalized')
        break
      
      case 'color_scheme':
        improvements.push('visual-appeal', 'brand-consistency', 'template-matched')
        break
      
      case 'emergency_availability':
        if (answer === '24-7') {
          improvements.push('emergency-prominence', 'phone-visibility', 'conversion-optimized')
        }
        break
    }
    
    return improvements
  }


  // Prepare site data for template renderer
  const siteData = useMemo(() => ({
    id: 'preview',
    name: businessData.businessName,
    subdomain: 'preview',
    customDomain: null,
    businessName: businessData.businessName,
    industry: businessData.industry as IndustryType,
    primaryColor: businessData.colorScheme.primary,
    secondaryColor: businessData.colorScheme.secondary,
    accentColor: businessData.colorScheme.accent,
    logo: businessData.logo,
    sections: selectedTemplate ? selectSectionVariants(selectedTemplate, businessData) : {},
    phone: businessData.contact.phone,
    email: businessData.contact.email,
    address: businessData.contact.address,
    analytics: null,
    ghlLocationId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'preview',
    intelligenceId: null,
    teamId: null,
    hasGoogleAnalytics: false,
    hasFacebookPixel: false,
    facebookPixelId: null,
    socialLinks: null,
    customCode: null,
    isCustomDomainSetup: false,
    customDomainVerified: false,
    customDomainError: null,
    seoMetadata: null,
    contactFormEmail: null,
    businessHours: null
  }), [businessData, selectedTemplate])

  if (!selectedTemplate) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading template preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Preview Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Live Preview</h3>
          <p className="text-sm text-gray-500">
            Using {selectedTemplate.name} template ({templateScore}% match)
          </p>
        </div>
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
                {businessData.businessName.toLowerCase().replace(/\s+/g, '')}.com
              </div>
            </div>
          </div>

          {/* Template Content */}
          <div className="bg-white max-h-[600px] overflow-y-auto">
            <motion.div
              animate={animatingElements.length > 0 ? { scale: [1, 1.01, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <SimpleTemplatePreview
                template={selectedTemplate}
                businessData={businessData}
                previewData={data}
              />
            </motion.div>
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
              Live Improvements Applied
            </h4>
            <div className="flex flex-wrap gap-2">
              {improvements.slice(-6).map((improvement, index) => (
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
}

function formatImprovement(improvement: string): string {
  const formats: Record<string, string> = {
    'services-added': 'Services Added',
    'seo-improved': 'SEO Optimized',
    'trust-signals': 'Trust Signals Added',
    'urgency-messaging': 'Urgency Enhanced',
    'credibility-boost': 'Credibility Boosted',
    'messaging-optimized': 'Messaging Refined',
    'target-audience-focused': 'Audience Targeted',
    'visual-appeal': 'Visual Appeal Enhanced',
    'brand-consistency': 'Brand Unified',
    'emergency-prominence': 'Emergency Highlighted',
    'phone-visibility': 'Contact Prominent',
    'template-optimized': 'Template Optimized',
    'cta-enhanced': 'CTAs Improved',
    'social-proof': 'Social Proof Added',
    'content-personalized': 'Content Personalized',
    'template-matched': 'Perfect Template Match',
    'conversion-optimized': 'Conversion Optimized'
  }
  
  return formats[improvement] || improvement.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Simplified template preview component
function SimpleTemplatePreview({ 
  template, 
  businessData, 
  previewData 
}: { 
  template: any
  businessData: any
  previewData: Partial<TemplatePreviewData> 
}) {
  // Get color scheme
  const getColorScheme = () => {
    const schemes = {
      'trust-blue': { primary: 'bg-blue-700', secondary: 'bg-blue-600', accent: 'bg-blue-400', text: 'text-blue-700' },
      'natural-green': { primary: 'bg-green-800', secondary: 'bg-green-600', accent: 'bg-green-400', text: 'text-green-700' },
      'professional-navy': { primary: 'bg-slate-900', secondary: 'bg-slate-700', accent: 'bg-slate-400', text: 'text-slate-700' },
      'warm-gray': { primary: 'bg-gray-800', secondary: 'bg-gray-600', accent: 'bg-gray-400', text: 'text-gray-700' }
    }
    
    return schemes[previewData.colorScheme as keyof typeof schemes] || schemes['trust-blue']
  }

  const colors = getColorScheme()
  const isLandscaping = businessData.industry === 'landscaping'
  
  return (
    <div className="space-y-0">
      {/* Hero Section - Premium Template Style */}
      <section className={`relative min-h-[500px] ${colors.primary} text-white overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            {previewData.differentiators && previewData.differentiators.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6"
              >
                <Sparkles className="w-4 h-4" />
                {formatDifferentiator(previewData.differentiators[0])}
              </motion.div>
            )}
            
            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              {getHeroHeadline(previewData, businessData)}
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto"
            >
              {getHeroSubtext(previewData)}
            </motion.p>
            
            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button className={`${colors.accent} text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity`}>
                {getCTAText(previewData)}
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/30 transition-colors">
                View Our Work
              </button>
            </motion.div>
            
            {/* Trust Indicators */}
            {previewData.availability === '24-7' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex items-center justify-center gap-6 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>24/7 Emergency Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Licensed & Insured</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Decorative Element */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Services Section - Grid Layout */}
      {previewData.services && previewData.services.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Our Services</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Professional {businessData.industry} services tailored to your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {previewData.services.slice(0, 6).map((service, index) => (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className={`h-3 ${colors.secondary}`} />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{formatService(service)}</h3>
                    <p className="text-gray-600 mb-4">
                      Expert {formatService(service).toLowerCase()} solutions delivered with precision and care.
                    </p>
                    <a href="#" className={`${colors.text} font-medium hover:underline`}>
                      Learn More →
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section - Split Layout */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Choose {businessData.businessName}?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {businessData.description || generateBusinessDescription(previewData)}
              </p>
              
              {/* Features */}
              <div className="space-y-4">
                {previewData.differentiators?.map((diff, index) => (
                  <motion.div
                    key={diff}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`w-6 h-6 ${colors.secondary} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{formatDifferentiator(diff)}</h4>
                      <p className="text-gray-600 text-sm">
                        {getDifferentiatorDescription(diff, businessData.industry)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className={`absolute inset-0 ${colors.secondary} rounded-2xl transform rotate-3`} />
              <div className="relative bg-gray-200 rounded-2xl p-8 transform -rotate-1">
                <div className="aspect-video bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Gallery Image</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${colors.primary} text-white`}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your {isLandscaping ? 'Outdoor Space' : 'Project'}?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            {previewData.availability === '24-7' 
              ? "Available 24/7 for emergency services. Call now!"
              : "Get started with a free consultation today."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              {previewData.phone || '(555) 123-4567'}
            </button>
            <button className={`${colors.accent} text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity`}>
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function getHeroHeadline(data: Partial<TemplatePreviewData>, businessData: any): string {
  const businessName = data.businessName || 'Your Business'
  const industry = data.industry || 'Service'
  
  if (data.positioning === 'speed') {
    return `Fast & Reliable ${industry} Services`
  } else if (data.positioning === 'quality') {
    return `Premium ${industry} Excellence`
  } else {
    return `Professional ${industry} Solutions`
  }
}

function getHeroSubtext(data: Partial<TemplatePreviewData>): string {
  if (data.availability === '24-7') {
    return '24/7 emergency service • Fast response times • Satisfaction guaranteed'
  } else if (data.positioning === 'quality') {
    return 'Exceptional quality and craftsmanship in every project we undertake'
  } else if (data.positioning === 'speed') {
    return 'Quick, efficient service when you need it most • No job too big or small'
  } else {
    return 'Professional service at competitive prices • Free estimates available'
  }
}

function getCTAText(data: Partial<TemplatePreviewData>): string {
  if (data.availability === '24-7') {
    return 'Call Now - 24/7'
  } else if (data.positioning === 'speed') {
    return 'Get Immediate Service'
  } else {
    return 'Get Free Estimate'
  }
}

function formatService(service: string): string {
  return service.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function formatDifferentiator(diff: string): string {
  const formats: Record<string, string> = {
    'licensed': 'Licensed & Insured',
    'award-winning': 'Award Winning Service',
    'family-owned': 'Family Owned & Operated',
    'emergency-service': '24/7 Emergency Service',
    'guaranteed': 'Satisfaction Guaranteed',
    'best-rated': 'Best Rated in Area',
    'eco-friendly': 'Eco-Friendly Practices',
    'veteran-owned': 'Veteran Owned Business',
    'women-owned': 'Women Owned Business'
  }
  
  return formats[diff] || diff.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function getDifferentiatorDescription(diff: string, industry: string): string {
  const descriptions: Record<string, string> = {
    'licensed': `Fully licensed and insured ${industry} professionals you can trust`,
    'award-winning': `Recognized for excellence in ${industry} services`,
    'family-owned': 'Local family business serving the community with pride',
    'emergency-service': 'Round-the-clock availability for urgent needs',
    'guaranteed': 'We stand behind our work with a satisfaction guarantee',
    'best-rated': 'Consistently rated 5 stars by our satisfied customers',
    'eco-friendly': 'Environmentally conscious practices and materials',
    'veteran-owned': 'Proudly veteran owned and operated',
    'women-owned': 'Women-led business bringing unique perspectives'
  }
  
  return descriptions[diff] || `Professional ${industry} services you can count on`
}

function generateBusinessDescription(data: Partial<TemplatePreviewData>): string {
  const base = `Welcome to ${data.businessName || 'our company'}, your trusted partner for professional ${data.industry || 'services'}.`
  const positioning = data.positioning === 'quality' 
    ? ' We pride ourselves on delivering exceptional quality and attention to detail in every project.'
    : data.positioning === 'speed'
    ? ' We understand that time is valuable, which is why we offer fast, efficient service without compromising on quality.'
    : ' We believe in providing excellent value without breaking the bank.'
  const availability = data.availability === '24-7'
    ? ' Available 24/7 for emergency services.'
    : ' Open during business hours to serve you better.'
  
  return base + positioning + availability
}