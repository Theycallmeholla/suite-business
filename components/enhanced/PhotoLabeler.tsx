/**
 * Enhanced Site Generation - Photo Labeler Component
 * 
 * **Created**: December 28, 2024, 7:45 PM CST
 * **Last Updated**: December 28, 2024, 7:45 PM CST
 * 
 * Drag-and-drop interface for categorizing business photos
 */

'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  Image, Upload, Check, X, Camera, 
  Sparkles, Building, Users, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface Photo {
  url: string
  id: string
  caption?: string
  category?: string
}

export interface PhotoCategory {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  maxPhotos?: number
}

export interface PhotoLabelingQuestion {
  question: string
  context?: string
  photos: Photo[]
  categories: PhotoCategory[]
  required?: boolean
  minLabeled?: number
}

interface PhotoLabelerProps {
  question: PhotoLabelingQuestion
  onComplete: (labeledPhotos: Photo[]) => void
  onSkip?: () => void
  className?: string
}

const defaultCategories: PhotoCategory[] = [
  { value: 'before-after', label: 'Before & After', icon: Sparkles, description: 'Show your transformations' },
  { value: 'completed', label: 'Completed Project', icon: Check, description: 'Showcase finished work' },
  { value: 'team', label: 'Team Photos', icon: Users, description: 'Your staff at work' },
  { value: 'equipment', label: 'Equipment', icon: Package, description: 'Tools and machinery' },
  { value: 'facility', label: 'Facility', icon: Building, description: 'Office or workspace' },
  { value: 'other', label: 'Other', icon: Image, description: 'Everything else' }
]

export function PhotoLabeler({
  question,
  onComplete,
  onSkip,
  className
}: PhotoLabelerProps) {
  const [photos, setPhotos] = useState<Photo[]>(question.photos)
  const [draggedPhoto, setDraggedPhoto] = useState<Photo | null>(null)
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  
  const categories = question.categories.length > 0 ? question.categories : defaultCategories
  
  const labeledPhotos = photos.filter(p => p.category)
  const unlabeledPhotos = photos.filter(p => !p.category)
  const progress = (labeledPhotos.length / photos.length) * 100
  
  const handleDragStart = (photo: Photo) => {
    setDraggedPhoto(photo)
  }
  
  const handleDragEnd = () => {
    setDraggedPhoto(null)
    setDragOverCategory(null)
  }
  
  const handleDragOver = (e: React.DragEvent, categoryValue: string) => {
    e.preventDefault()
    setDragOverCategory(categoryValue)
  }
  
  const handleDragLeave = () => {
    setDragOverCategory(null)
  }
  
  const handleDrop = (e: React.DragEvent, categoryValue: string) => {
    e.preventDefault()
    if (!draggedPhoto) return
    
    const updatedPhotos = photos.map(p => 
      p.id === draggedPhoto.id ? { ...p, category: categoryValue } : p
    )
    setPhotos(updatedPhotos)
    setDraggedPhoto(null)
    setDragOverCategory(null)
  }
  
  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo)
  }
  
  const handleCategoryClick = (categoryValue: string) => {
    if (!selectedPhoto) return
    
    const updatedPhotos = photos.map(p => 
      p.id === selectedPhoto.id ? { ...p, category: categoryValue } : p
    )
    setPhotos(updatedPhotos)
    setSelectedPhoto(null)
  }
  
  const handleRemoveLabel = (photo: Photo) => {
    const updatedPhotos = photos.map(p => 
      p.id === photo.id ? { ...p, category: undefined } : p
    )
    setPhotos(updatedPhotos)
  }
  
  const handleComplete = () => {
    if (question.minLabeled && labeledPhotos.length < question.minLabeled) {
      return
    }
    onComplete(labeledPhotos)
  }
  
  const getCategoryPhotos = (categoryValue: string) => {
    return photos.filter(p => p.category === categoryValue)
  }

  return (
    <div className={cn('w-full max-w-5xl mx-auto p-6', className)} data-testid="photo-labeler">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{question.question}</h2>
        {question.context && (
          <p className="text-muted-foreground">{question.context}</p>
        )}
        
        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {labeledPhotos.length} of {photos.length} photos labeled
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        </div>
      </div>

      {/* Unlabeled Photos */}
      {unlabeledPhotos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Unlabeled Photos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {unlabeledPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                data-testid={`photo-${photo.id}`}
                draggable
                onDragStart={() => handleDragStart(photo)}
                onDragEnd={handleDragEnd}
                onClick={() => handlePhotoClick(photo)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'relative cursor-pointer rounded-lg overflow-hidden',
                  'border-2 transition-all',
                  selectedPhoto?.id === photo.id 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                )}
              >
                <img 
                  src={photo.url} 
                  alt={photo.caption || 'Business photo'}
                  className="w-full h-32 object-cover"
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                    {photo.caption}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Drop photos into categories:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((category) => {
            const CategoryIcon = category.icon || Image
            const categoryPhotos = getCategoryPhotos(category.value)
            const isFull = category.maxPhotos && categoryPhotos.length >= category.maxPhotos
            
            return (
              <Card
                key={category.value}
                data-label={category.label}
                onDragOver={(e) => !isFull && handleDragOver(e, category.value)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => !isFull && handleDrop(e, category.value)}
                onClick={() => selectedPhoto && !isFull && handleCategoryClick(category.value)}
                className={cn(
                  'p-4 transition-all cursor-pointer',
                  dragOverCategory === category.value && 'ring-2 ring-primary bg-primary/5',
                  selectedPhoto && !isFull && 'hover:bg-accent',
                  isFull && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-medium">{category.label}</h4>
                  {categoryPhotos.length > 0 && (
                    <Badge variant="secondary">
                      {categoryPhotos.length}
                      {category.maxPhotos && ` / ${category.maxPhotos}`}
                    </Badge>
                  )}
                </div>
                
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                )}
                
                {/* Category Photos */}
                {categoryPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {categoryPhotos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img 
                          src={photo.url}
                          alt={photo.caption || 'Business photo'}
                          className="w-full h-16 object-cover rounded"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveLabel(photo)
                          }}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Drop Zone */}
                {categoryPhotos.length === 0 && (
                  <div className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center',
                    dragOverCategory === category.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  )}>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drop photos here
                    </p>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8">
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
          disabled={question.required && labeledPhotos.length === 0}
          className="ml-auto"
        >
          Continue
          {labeledPhotos.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {labeledPhotos.length} labeled
            </Badge>
          )}
        </Button>
      </div>
    </div>
  )
}