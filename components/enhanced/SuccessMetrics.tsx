/**
 * Enhanced Site Generation - Success Metrics Component
 * 
 * **Created**: June 28, 2025, 7:53 PM CST
 * **Last Updated**: June 28, 2025, 7:53 PM CST
 * 
 * Component for capturing business success metrics and achievements
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  TrendingUp, Users, DollarSign, Clock, 
  Star, CheckCircle, Target, Award,
  Percent, Calendar, Building2, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface MetricType {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  unit?: string
  placeholder?: string
  helperText?: string
  category: 'growth' | 'customer' | 'operational' | 'financial'
}

export interface MetricValue {
  metricId: string
  value: string | number
  unit?: string
  timeframe?: string
  verified?: boolean
  description?: string
}

export interface MetricsData {
  metrics: MetricValue[]
  yearsInBusiness?: number
  teamSize?: number
  serviceArea?: string
  specialAchievements?: string[]
}

interface SuccessMetricsQuestion {
  question: string
  context?: string
  suggestedMetrics: MetricType[]
  required?: boolean
  minMetrics?: number
  allowCustom?: boolean
}

interface SuccessMetricsProps {
  question: SuccessMetricsQuestion
  existingData?: MetricsData
  onComplete: (data: MetricsData) => void
  onSkip?: () => void
  className?: string
}

const defaultMetrics: MetricType[] = [
  {
    id: 'customer-satisfaction',
    label: 'Customer Satisfaction Rate',
    icon: Star,
    unit: '%',
    placeholder: 'e.g., 98',
    helperText: 'Average rating or satisfaction score',
    category: 'customer'
  },
  {
    id: 'projects-completed',
    label: 'Projects Completed',
    icon: CheckCircle,
    unit: 'projects',
    placeholder: 'e.g., 500',
    helperText: 'Total number of completed projects',
    category: 'operational'
  },
  {
    id: 'revenue-growth',
    label: 'Revenue Growth',
    icon: TrendingUp,
    unit: '%',
    placeholder: 'e.g., 25',
    helperText: 'Year-over-year growth percentage',
    category: 'financial'
  },
  {
    id: 'repeat-customers',
    label: 'Repeat Customer Rate',
    icon: Users,
    unit: '%',
    placeholder: 'e.g., 80',
    helperText: 'Percentage of returning customers',
    category: 'customer'
  },
  {
    id: 'response-time',
    label: 'Average Response Time',
    icon: Clock,
    unit: 'hours',
    placeholder: 'e.g., 2',
    helperText: 'Time to respond to inquiries',
    category: 'operational'
  },
  {
    id: 'team-members',
    label: 'Team Members',
    icon: Users,
    unit: 'people',
    placeholder: 'e.g., 15',
    helperText: 'Number of employees',
    category: 'operational'
  }
]

const categoryColors = {
  growth: 'text-green-600 bg-green-50',
  customer: 'text-blue-600 bg-blue-50',
  operational: 'text-purple-600 bg-purple-50',
  financial: 'text-yellow-600 bg-yellow-50'
}

export function SuccessMetrics({
  question,
  existingData,
  onComplete,
  onSkip,
  className
}: SuccessMetricsProps) {
  const [metrics, setMetrics] = useState<MetricValue[]>(existingData?.metrics || [])
  const [yearsInBusiness, setYearsInBusiness] = useState(existingData?.yearsInBusiness || 1)
  const [teamSize, setTeamSize] = useState(existingData?.teamSize || 1)
  const [serviceArea, setServiceArea] = useState(existingData?.serviceArea || '')
  const [specialAchievements, setSpecialAchievements] = useState<string[]>(
    existingData?.specialAchievements || []
  )
  const [newAchievement, setNewAchievement] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
  const availableMetrics = question.suggestedMetrics.length > 0 
    ? question.suggestedMetrics 
    : defaultMetrics
  
  const getMetricValue = (metricId: string) => {
    return metrics.find(m => m.metricId === metricId)
  }
  
  const updateMetric = (metricId: string, value: string, timeframe?: string) => {
    const existingIndex = metrics.findIndex(m => m.metricId === metricId)
    const metric = availableMetrics.find(m => m.id === metricId)
    
    if (!metric) return
    
    const newMetricValue: MetricValue = {
      metricId,
      value,
      unit: metric.unit,
      timeframe
    }
    
    if (existingIndex >= 0) {
      const updated = [...metrics]
      updated[existingIndex] = newMetricValue
      setMetrics(updated)
    } else {
      setMetrics([...metrics, newMetricValue])
    }
  }
  
  const removeMetric = (metricId: string) => {
    setMetrics(metrics.filter(m => m.metricId !== metricId))
  }
  
  const addAchievement = () => {
    if (!newAchievement.trim()) return
    setSpecialAchievements([...specialAchievements, newAchievement.trim()])
    setNewAchievement('')
  }
  
  const removeAchievement = (index: number) => {
    setSpecialAchievements(specialAchievements.filter((_, i) => i !== index))
  }
  
  const handleComplete = () => {
    if (question.minMetrics && metrics.length < question.minMetrics) {
      return
    }
    
    const data: MetricsData = {
      metrics,
      yearsInBusiness,
      teamSize,
      serviceArea,
      specialAchievements
    }
    
    onComplete(data)
  }
  
  const groupedMetrics = availableMetrics.reduce((acc, metric) => {
    const category = metric.category
    if (!acc[category]) acc[category] = []
    acc[category].push(metric)
    return acc
  }, {} as Record<string, MetricType[]>)
  
  const categoryLabels = {
    growth: 'Growth Metrics',
    customer: 'Customer Metrics',
    operational: 'Operational Metrics',
    financial: 'Financial Metrics'
  }

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{question.question}</h2>
        {question.context && (
          <p className="text-muted-foreground">{question.context}</p>
        )}
        
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {metrics.length} metrics added
          </span>
          {question.minMetrics && metrics.length < question.minMetrics && (
            <span className="text-sm text-muted-foreground">
              (minimum {question.minMetrics} required)
            </span>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <Card className="mb-6 p-6">
        <h3 className="font-semibold mb-4">Basic Information</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Years in Business
            </label>
            <div className="flex items-center gap-4">
              <Slider
                value={[yearsInBusiness]}
                onValueChange={([value]) => setYearsInBusiness(value)}
                min={1}
                max={50}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12 text-right">
                {yearsInBusiness}
              </span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Team Size
            </label>
            <Select
              value={String(teamSize)}
              onValueChange={(value) => setTeamSize(Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Just me</SelectItem>
                <SelectItem value="5">2-5 people</SelectItem>
                <SelectItem value="10">6-10 people</SelectItem>
                <SelectItem value="25">11-25 people</SelectItem>
                <SelectItem value="50">26-50 people</SelectItem>
                <SelectItem value="100">50+ people</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Service Area
            </label>
            <Input
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="e.g., 50 mile radius"
            />
          </div>
        </div>
      </Card>

      {/* Metrics by Category */}
      <div className="space-y-4 mb-6">
        {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => {
          const isActive = activeCategory === category
          const categoryLabel = categoryLabels[category as keyof typeof categoryLabels]
          const colorClass = categoryColors[category as keyof typeof categoryColors]
          
          return (
            <Card key={category} className="overflow-hidden">
              <button
                className="w-full p-4 text-left hover:bg-accent/50 transition-colors"
                onClick={() => setActiveCategory(isActive ? null : category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={colorClass}>
                      {categoryLabel}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {categoryMetrics.filter(m => getMetricValue(m.id)).length} of {categoryMetrics.length} filled
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isActive ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </motion.div>
                </div>
              </button>
              
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-3">
                      {categoryMetrics.map((metric) => {
                        const Icon = metric.icon
                        const value = getMetricValue(metric.id)
                        
                        return (
                          <div key={metric.id} className="flex items-start gap-3">
                            <Icon className="h-5 w-5 text-muted-foreground mt-2" />
                            <div className="flex-1">
                              <label className="text-sm font-medium block mb-1">
                                {metric.label}
                              </label>
                              {metric.helperText && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  {metric.helperText}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                <Input
                                  value={value?.value || ''}
                                  onChange={(e) => updateMetric(metric.id, e.target.value)}
                                  placeholder={metric.placeholder}
                                  className="max-w-xs"
                                />
                                {metric.unit && (
                                  <span className="text-sm text-muted-foreground">
                                    {metric.unit}
                                  </span>
                                )}
                                {value && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeMetric(metric.id)}
                                  >
                                    Clear
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>

      {/* Special Achievements */}
      <Card className="mb-6 p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5" />
          Special Achievements
        </h3>
        
        {specialAchievements.length > 0 && (
          <div className="space-y-2 mb-4">
            {specialAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-accent rounded-lg">
                <span className="text-sm">{achievement}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAchievement(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            placeholder="e.g., Best Landscaper Award 2023"
            onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
          />
          <Button onClick={addAchievement} disabled={!newAchievement.trim()}>
            Add
          </Button>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
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
          disabled={question.required && metrics.length === 0}
          className="ml-auto"
        >
          Continue
          {metrics.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {metrics.length} metrics
            </Badge>
          )}
        </Button>
      </div>
    </div>
  )
}