/**
 * Enhanced Site Generation - Claim Verifier Component
 * 
 * **Created**: December 28, 2024, 7:48 PM CST
 * **Last Updated**: December 28, 2024, 7:48 PM CST
 * 
 * Interactive interface for verifying business claims and certifications
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  Shield, CheckCircle2, XCircle, AlertCircle, 
  Award, BadgeCheck, FileCheck, ExternalLink,
  Upload, Plus, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface Claim {
  id: string
  type: 'certification' | 'award' | 'license' | 'insurance' | 'guarantee' | 'other'
  title: string
  description?: string
  issuer?: string
  dateIssued?: string
  expiryDate?: string
  verificationUrl?: string
  verificationStatus?: 'verified' | 'pending' | 'unverified'
  documentUrl?: string
}

export interface ClaimVerificationQuestion {
  question: string
  context?: string
  existingClaims?: Claim[]
  suggestedClaims?: Claim[]
  required?: boolean
  minClaims?: number
  maxClaims?: number
}

interface ClaimVerifierProps {
  question: ClaimVerificationQuestion
  onComplete: (claims: Claim[]) => void
  onSkip?: () => void
  className?: string
}

const claimTypeIcons = {
  certification: Award,
  award: BadgeCheck,
  license: FileCheck,
  insurance: Shield,
  guarantee: CheckCircle2,
  other: AlertCircle
}

const claimTypeLabels = {
  certification: 'Certification',
  award: 'Award',
  license: 'License',
  insurance: 'Insurance',
  guarantee: 'Guarantee',
  other: 'Other'
}

export function ClaimVerifier({
  question,
  onComplete,
  onSkip,
  className
}: ClaimVerifierProps) {
  const [claims, setClaims] = useState<Claim[]>(question.existingClaims || [])
  const [isAddingClaim, setIsAddingClaim] = useState(false)
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null)
  
  // Form state for new/edit claim
  const [formData, setFormData] = useState<Partial<Claim>>({
    type: 'certification',
    title: '',
    description: '',
    issuer: '',
    verificationStatus: 'unverified'
  })
  
  const handleAddClaim = () => {
    setIsAddingClaim(true)
    setEditingClaim(null)
    setFormData({
      type: 'certification',
      title: '',
      description: '',
      issuer: '',
      verificationStatus: 'unverified'
    })
  }
  
  const handleEditClaim = (claim: Claim) => {
    setEditingClaim(claim)
    setIsAddingClaim(false)
    setFormData(claim)
  }
  
  const handleSaveClaim = () => {
    if (!formData.title || !formData.type) return
    
    const newClaim: Claim = {
      id: editingClaim?.id || `claim-${Date.now()}`,
      type: formData.type as Claim['type'],
      title: formData.title,
      description: formData.description,
      issuer: formData.issuer,
      dateIssued: formData.dateIssued,
      expiryDate: formData.expiryDate,
      verificationUrl: formData.verificationUrl,
      verificationStatus: formData.verificationStatus as Claim['verificationStatus'],
      documentUrl: formData.documentUrl
    }
    
    if (editingClaim) {
      setClaims(claims.map(c => c.id === editingClaim.id ? newClaim : c))
    } else {
      setClaims([...claims, newClaim])
    }
    
    setIsAddingClaim(false)
    setEditingClaim(null)
    setFormData({
      type: 'certification',
      title: '',
      description: '',
      issuer: '',
      verificationStatus: 'unverified'
    })
  }
  
  const handleDeleteClaim = (id: string) => {
    setClaims(claims.filter(c => c.id !== id))
  }
  
  const handleAddSuggestedClaim = (suggestedClaim: Claim) => {
    setClaims([...claims, { ...suggestedClaim, id: `claim-${Date.now()}` }])
  }
  
  const handleComplete = () => {
    if (question.minClaims && claims.length < question.minClaims) {
      return
    }
    onComplete(claims)
  }
  
  const verifiedCount = claims.filter(c => c.verificationStatus === 'verified').length
  const pendingCount = claims.filter(c => c.verificationStatus === 'pending').length

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-6', className)} data-testid="claim-verifier">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{question.question}</h2>
        {question.context && (
          <p className="text-muted-foreground">{question.context}</p>
        )}
        
        {/* Stats */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm">{verifiedCount} verified</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm">{pendingCount} pending</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{claims.length} total claims</span>
          </div>
        </div>
      </div>

      {/* Suggested Claims */}
      {question.suggestedClaims && question.suggestedClaims.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Suggested Claims</h3>
          <div className="grid gap-3">
            {question.suggestedClaims.map((suggestion, index) => {
              const Icon = claimTypeIcons[suggestion.type]
              const isAdded = claims.some(c => c.title === suggestion.title)
              
              return (
                <Card 
                  key={index}
                  className={cn(
                    'p-4 transition-all',
                    isAdded && 'opacity-50'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">{suggestion.title}</h4>
                        {suggestion.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {suggestion.description}
                          </p>
                        )}
                        {suggestion.issuer && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Issued by: {suggestion.issuer}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddSuggestedClaim(suggestion)}
                      disabled={isAdded}
                    >
                      {isAdded ? 'Added' : 'Add'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Current Claims */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Claims & Certifications</h3>
          {(!question.maxClaims || claims.length < question.maxClaims) && (
            <Button
              size="sm"
              onClick={handleAddClaim}
              disabled={isAddingClaim || !!editingClaim}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Claim
            </Button>
          )}
        </div>
        
        <div className="grid gap-3">
          {claims.map((claim) => {
            const Icon = claimTypeIcons[claim.type]
            const isEditing = editingClaim?.id === claim.id
            
            return (
              <Card key={claim.id} className="p-4">
                {isEditing ? (
                  <ClaimForm
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSaveClaim}
                    onCancel={() => {
                      setEditingClaim(null)
                      setFormData({})
                    }}
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{claim.title}</h4>
                          <VerificationBadge status={claim.verificationStatus} />
                        </div>
                        {claim.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {claim.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {claim.issuer && <span>Issued by: {claim.issuer}</span>}
                          {claim.dateIssued && <span>Date: {claim.dateIssued}</span>}
                          {claim.verificationUrl && (
                            <a
                              href={claim.verificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              Verify
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClaim(claim)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClaim(claim.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
          
          {/* Add New Claim Form */}
          {isAddingClaim && (
            <Card className="p-4">
              <ClaimForm
                formData={formData}
                setFormData={setFormData}
                onSave={handleSaveClaim}
                onCancel={() => {
                  setIsAddingClaim(false)
                  setFormData({})
                }}
              />
            </Card>
          )}
        </div>
      </div>

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
          disabled={question.required && claims.length === 0}
          className="ml-auto"
        >
          Continue
          {claims.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {claims.length} claims
            </Badge>
          )}
        </Button>
      </div>
    </div>
  )
}

// Verification Badge Component
function VerificationBadge({ status }: { status?: Claim['verificationStatus'] }) {
  if (!status) return null
  
  const config = {
    verified: { icon: CheckCircle2, label: 'Verified', className: 'text-green-600 bg-green-50' },
    pending: { icon: AlertCircle, label: 'Pending', className: 'text-yellow-600 bg-yellow-50' },
    unverified: { icon: XCircle, label: 'Unverified', className: 'text-gray-600 bg-gray-50' }
  }
  
  const { icon: Icon, label, className } = config[status]
  
  return (
    <Badge variant="outline" className={cn('text-xs', className)}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  )
}

// Claim Form Component
function ClaimForm({
  formData,
  setFormData,
  onSave,
  onCancel
}: {
  formData: Partial<Claim>
  setFormData: (data: Partial<Claim>) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Type</label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as Claim['type'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(claimTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Title *</label>
          <Input
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., ISO 9001 Certified"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">Description</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe this certification or claim..."
          rows={2}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Issuer</label>
          <Input
            value={formData.issuer || ''}
            onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
            placeholder="e.g., Better Business Bureau"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Verification URL</label>
          <Input
            value={formData.verificationUrl || ''}
            onChange={(e) => setFormData({ ...formData, verificationUrl: e.target.value })}
            placeholder="https://..."
            type="url"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!formData.title}>
          Save Claim
        </Button>
      </div>
    </div>
  )
}