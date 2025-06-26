/**
 * Enhanced Questions Demo Page
 * 
 * **Created**: December 23, 2024, 12:30 PM CST
 * **Last Updated**: December 23, 2024, 12:30 PM CST
 * 
 * Demo page for testing the complete enhanced question system
 */

'use client'

import { useState } from 'react'
import { QuestionFlowOrchestrator } from '@/components/SmartQuestionComponents'
import { BusinessIntelligenceData } from '@/lib/intelligence/scoring'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2,
  Eye,
  Zap,
  Target
} from 'lucide-react'

export default function EnhancedQuestionsDemo() {
  const [currentDemo, setCurrentDemo] = useState<'landscaping' | 'plumbing' | 'hvac' | null>(null)
  const [completedData, setCompletedData] = useState<any>(null)

  const demoBusinessData: Record<string, any> = {
    landscaping: {
      id: 'demo-landscaping',
      name: 'Green Thumb Landscaping',
      industry: 'landscaping',
      dataScore: { total: 45, breakdown: { services: 20, differentiation: 10, content: 15 } },
      services: ['lawn-mowing', 'landscape-design'],
      location: { address: '123 Garden St, Springfield, IL', city: 'Springfield', state: 'IL' },
      phone: '(555) 123-4567',
      website: null,
      hours: null,
      differentiationScore: 25,
      contentTier: 'standard'
    },
    plumbing: {
      id: 'demo-plumbing',
      name: 'Rapid Response Plumbing',
      industry: 'plumbing',
      dataScore: { total: 35, breakdown: { services: 15, differentiation: 5, content: 15 } },
      services: ['emergency-plumbing', 'drain-cleaning'],
      location: { address: '456 Pipe Ave, Springfield, IL', city: 'Springfield', state: 'IL' },
      phone: '(555) 987-6543',
      website: null,
      hours: null,
      differentiationScore: 15,
      contentTier: 'minimal'
    },
    hvac: {
      id: 'demo-hvac',
      name: 'Climate Control Experts',
      industry: 'hvac',
      dataScore: { total: 55, breakdown: { services: 25, differentiation: 15, content: 15 } },
      services: ['ac-repair', 'heating-repair', 'installation'],
      location: { address: '789 Cool St, Springfield, IL', city: 'Springfield', state: 'IL' },
      phone: '(555) 456-7890',
      website: 'https://climatecontrolexperts.com',
      hours: { monday: '8:00 AM - 6:00 PM', tuesday: '8:00 AM - 6:00 PM' },
      differentiationScore: 35,
      contentTier: 'premium'
    }
  }

  const handleDemoComplete = (enhancedData: any) => {
    setCompletedData(enhancedData)
    console.log('Enhanced Data:', enhancedData)
  }

  const resetDemo = () => {
    setCurrentDemo(null)
    setCompletedData(null)
  }

  if (completedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Demo Complete! 🎉</h1>
            <p className="text-lg text-gray-600 mb-6">
              Here's what the enhanced question system captured:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Responses</h3>
              <div className="space-y-2">
                {Object.entries(completedData.userAnswers || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span className="text-gray-600">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Inferences</h3>
              <div className="space-y-2">
                {[
                  'positioning',
                  'brandPersonality',
                  'targetDemographic',
                  'messagingTone'
                ].map(field => (
                  completedData[field] && (
                    <div key={field} className="flex justify-between">
                      <span className="font-medium">{field}:</span>
                      <span className="text-gray-600">{completedData[field]}</span>
                    </div>
                  )
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Data Completeness</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {completedData.dataCompleteness || 0}%
                </div>
                <p className="text-gray-600">Website optimization</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Improvements Made</h3>
              <div className="flex flex-wrap gap-2">
                {(completedData.improvementsSuggested || []).map((improvement: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {improvement.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button onClick={resetDemo} size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Another Demo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (currentDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={resetDemo}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Demo Selection
              </Button>
              <Badge variant="outline">
                Demo: {demoBusinessData[currentDemo].name}
              </Badge>
            </div>

            <QuestionFlowOrchestrator
              businessData={demoBusinessData[currentDemo]}
              onComplete={handleDemoComplete}
              onSkip={() => {
                setCompletedData({
                  ...demoBusinessData[currentDemo],
                  userAnswers: {},
                  dataCompleteness: 30,
                  improvementsSuggested: []
                })
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Enhanced Question System Demo</h1>
          <p className="text-xl text-gray-600 mb-8">
            Experience the complete question flow with real-time preview and smart inferences
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            <Card className="p-6 text-center">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Smart Questions</h3>
              <p className="text-sm text-gray-600">Adaptive questions based on business data</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Eye className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Live Preview</h3>
              <p className="text-sm text-gray-600">See website changes in real-time</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Zap className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI Inferences</h3>
              <p className="text-sm text-gray-600">Extract maximum info from minimal input</p>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center mb-6">Choose a Demo Business</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(demoBusinessData).map(([key, business]) => (
              <Card 
                key={key}
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => setCurrentDemo(key as any)}
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                    {business.name.charAt(0)}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{business.name}</h3>
                  <p className="text-gray-600 mb-4 capitalize">{business.industry} Business</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Data Score:</span>
                      <span className="font-medium">{business.dataScore.total}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Services:</span>
                      <span className="font-medium">{business.services?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Content Tier:</span>
                      <Badge variant="outline" className="text-xs">
                        {business.contentTier}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    Start Demo
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">
            Each demo showcases different aspects of the enhanced question system
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              High data score = fewer questions
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              Low data score = more questions
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}