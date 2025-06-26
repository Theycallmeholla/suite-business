/**
 * Content Generation Studio
 * 
 * Interactive component for generating and editing AI-powered website content.
 * Integrates with the question system to create unique, compelling copy.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner, LoadingButton } from '@/components/ui/loading-states';
import { 
  Wand2, 
  RefreshCw, 
  Copy, 
  Check, 
  Eye, 
  Edit3,
  Sparkles,
  Target,
  TrendingUp,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ContentGenerationStudioProps {
  businessIntelligenceId: string;
  industry: string;
  answers: Record<string, any>;
  onContentGenerated?: (content: any) => void;
  initialContent?: any;
  className?: string;
}

interface GeneratedContent {
  hero: {
    headline: { content: string; alternatives: string[]; seoScore: number };
    subheadline: { content: string; alternatives: string[]; seoScore: number };
    ctaText: { content: string; alternatives: string[] };
  };
  about: {
    headline: { content: string; alternatives: string[] };
    description: { content: string; alternatives: string[]; seoScore: number };
  };
  services: {
    headline: { content: string; alternatives: string[] };
    description: { content: string; alternatives: string[] };
    serviceDescriptions: Record<string, { content: string; alternatives: string[]; seoScore: number }>;
  };
  cta: {
    headline: { content: string; alternatives: string[] };
    description: { content: string; alternatives: string[] };
    ctaText: { content: string; alternatives: string[] };
  };
  contact: {
    headline: { content: string; alternatives: string[] };
    description: { content: string; alternatives: string[] };
  };
}

export function ContentGenerationStudio({
  businessIntelligenceId,
  industry,
  answers,
  onContentGenerated,
  initialContent,
  className = ''
}: ContentGenerationStudioProps) {
  const [content, setContent] = useState<GeneratedContent | null>(initialContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [editingContent, setEditingContent] = useState<Record<string, string>>({});
  const [generationOptions, setGenerationOptions] = useState({
    tone: 'professional',
    includeAlternatives: true,
    optimizeForSEO: true,
  });

  /**
   * Generate complete website content
   */
  const generateCompleteContent = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/content-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessIntelligenceId,
          industry,
          answers,
          contentType: 'complete-website',
          options: generationOptions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setContent(data.content);
      onContentGenerated?.(data.content);
    } catch (error) {
      console.error('Content generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Regenerate specific section
   */
  const regenerateSection = async (sectionType: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/content-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessIntelligenceId,
          industry,
          answers,
          contentType: 'single-section',
          sectionType,
          options: generationOptions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate section');
      }

      const data = await response.json();
      setContent(prev => prev ? { ...prev, [sectionType]: data.content } : null);
    } catch (error) {
      console.error('Section regeneration failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Copy content to clipboard
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  /**
   * Update content with edited version
   */
  const updateContent = (sectionType: string, contentType: string, newContent: string) => {
    setContent(prev => {
      if (!prev) return null;
      
      const prevSection = (prev as any)[sectionType];
      if (!prevSection) return prev;
      
      return {
        ...prev,
        [sectionType]: {
          ...prevSection,
          [contentType]: {
            ...prevSection[contentType],
            content: newContent,
          },
        },
      } as GeneratedContent;
    });
  };

  if (!content && !isGenerating) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Wand2 className="h-8 w-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Generate Unique Website Content</h3>
            <p className="text-gray-600 mb-6">
              Create compelling, AI-powered content that's unique to your business and optimized for conversions.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="h-4 w-4 text-green-500" />
              <span>Industry-specific messaging</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>SEO-optimized content</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Multiple alternatives to choose from</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Select value={generationOptions.tone} onValueChange={(value) => 
              setGenerationOptions(prev => ({ ...prev, tone: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="traditional">Traditional</SelectItem>
              </SelectContent>
            </Select>

            <LoadingButton
              onClick={generateCompleteContent}
              loading={isGenerating}
              loadingText="Generating Content..."
              className="w-full"
              size="lg"
            >
              <Wand2 className="h-5 w-5 mr-2" />
              Generate Website Content
            </LoadingButton>
          </div>
        </div>
      </Card>
    );
  }

  if (isGenerating && !content) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="space-y-4">
          <LoadingSpinner size="lg" className="mx-auto text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold">Generating Your Content</h3>
            <p className="text-gray-600">Creating unique, compelling copy for your website...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Content Studio
          </h2>
          <p className="text-gray-600">AI-generated content for your website</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={generationOptions.tone} onValueChange={(value) => 
            setGenerationOptions(prev => ({ ...prev, tone: value }))
          }>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="traditional">Traditional</SelectItem>
            </SelectContent>
          </Select>
          
          <LoadingButton
            onClick={generateCompleteContent}
            loading={isGenerating}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Regenerate All
          </LoadingButton>
        </div>
      </div>

      {/* Content Sections */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="cta">Call to Action</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {content && (
          <>
            <TabsContent value="hero">
              <ContentSection
                title="Hero Section"
                description="The first thing visitors see on your website"
                content={content.hero}
                sectionType="hero"
                onRegenerate={() => regenerateSection('hero')}
                onCopy={copyToClipboard}
                onEdit={updateContent}
                isGenerating={isGenerating}
              />
            </TabsContent>

            <TabsContent value="about">
              <ContentSection
                title="About Section"
                description="Tell your story and build trust with visitors"
                content={content.about}
                sectionType="about"
                onRegenerate={() => regenerateSection('about')}
                onCopy={copyToClipboard}
                onEdit={updateContent}
                isGenerating={isGenerating}
              />
            </TabsContent>

            <TabsContent value="services">
              <ContentSection
                title="Services Section"
                description="Showcase what you offer to potential customers"
                content={content.services}
                sectionType="services"
                onRegenerate={() => regenerateSection('services')}
                onCopy={copyToClipboard}
                onEdit={updateContent}
                isGenerating={isGenerating}
              />
            </TabsContent>

            <TabsContent value="cta">
              <ContentSection
                title="Call to Action"
                description="Motivate visitors to take the next step"
                content={content.cta}
                sectionType="cta"
                onRegenerate={() => regenerateSection('cta')}
                onCopy={copyToClipboard}
                onEdit={updateContent}
                isGenerating={isGenerating}
              />
            </TabsContent>

            <TabsContent value="contact">
              <ContentSection
                title="Contact Section"
                description="Make it easy for customers to reach you"
                content={content.contact}
                sectionType="contact"
                onRegenerate={() => regenerateSection('contact')}
                onCopy={copyToClipboard}
                onEdit={updateContent}
                isGenerating={isGenerating}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

/**
 * Individual content section component
 */
interface ContentSectionProps {
  title: string;
  description: string;
  content: any;
  sectionType: string;
  onRegenerate: () => void;
  onCopy: (text: string) => void;
  onEdit: (sectionType: string, contentType: string, newContent: string) => void;
  isGenerating: boolean;
}

function ContentSection({
  title,
  description,
  content,
  sectionType,
  onRegenerate,
  onCopy,
  onEdit,
  isGenerating
}: ContentSectionProps) {
  const [expandedAlternatives, setExpandedAlternatives] = useState<Record<string, boolean>>({});

  const toggleAlternatives = (contentType: string) => {
    setExpandedAlternatives(prev => ({
      ...prev,
      [contentType]: !prev[contentType]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        
        <LoadingButton
          onClick={onRegenerate}
          loading={isGenerating}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Regenerate
        </LoadingButton>
      </div>

      {/* Content Items */}
      <div className="space-y-4">
        {Object.entries(content).map(([contentType, contentData]: [string, any]) => (
          <ContentItem
            key={contentType}
            contentType={contentType}
            contentData={contentData}
            sectionType={sectionType}
            onCopy={onCopy}
            onEdit={onEdit}
            expanded={expandedAlternatives[contentType]}
            onToggleExpanded={() => toggleAlternatives(contentType)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual content item component
 */
interface ContentItemProps {
  contentType: string;
  contentData: any;
  sectionType: string;
  onCopy: (text: string) => void;
  onEdit: (sectionType: string, contentType: string, newContent: string) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}

function ContentItem({
  contentType,
  contentData,
  sectionType,
  onCopy,
  onEdit,
  expanded,
  onToggleExpanded
}: ContentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(contentData.content);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy(contentData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onEdit(sectionType, contentType, editValue);
    setIsEditing(false);
  };

  const getContentTypeLabel = (type: string) => {
    const labels = {
      headline: 'Headline',
      subheadline: 'Subheadline',
      description: 'Description',
      ctaText: 'Button Text',
      serviceDescriptions: 'Service Descriptions',
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (contentType === 'serviceDescriptions') {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Service Descriptions</h4>
        </div>
        
        <div className="space-y-3">
          {Object.entries(contentData).map(([serviceName, serviceData]: [string, any]) => (
            <div key={serviceName} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm">{serviceName}</h5>
                <div className="flex gap-1">
                  {serviceData.seoScore && (
                    <Badge variant="outline" className="text-xs">
                      SEO: {serviceData.seoScore}%
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">{serviceData.content}</p>
              
              {serviceData.alternatives && serviceData.alternatives.length > 0 && (
                <div className="space-y-1">
                  <button
                    onClick={() => onToggleExpanded()}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {serviceData.alternatives.length} alternatives
                  </button>
                  
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 pt-2"
                      >
                        {serviceData.alternatives.map((alt: string, index: number) => (
                          <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                            {alt}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{getContentTypeLabel(contentType)}</h4>
          {contentData.seoScore && (
            <Badge variant="outline" className="text-xs">
              SEO: {contentData.seoScore}%
            </Badge>
          )}
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-700">{contentData.content}</p>
          
          {contentData.alternatives && contentData.alternatives.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={onToggleExpanded}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {contentData.alternatives.length} alternatives
              </button>
              
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {contentData.alternatives.map((alternative: string, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => onEdit(sectionType, contentType, alternative)}
                      >
                        {alternative}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}