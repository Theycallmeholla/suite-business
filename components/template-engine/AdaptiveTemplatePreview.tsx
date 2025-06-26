/**
 * Adaptive Template Preview Component
 * 
 * This component integrates with the other agent's question system to show
 * real-time template generation and preview as users answer questions.
 * 
 * It demonstrates how the answers create unique website layouts and designs.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Palette, 
  Layout, 
  Sparkles, 
  Eye, 
  TrendingUp,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';

interface AdaptiveTemplatePreviewProps {
  // Question answers from the conversational flow
  answers: Record<string, any>;
  businessIntelligenceId: string;
  industry: string;
  
  // Callbacks
  onTemplateGenerated?: (template: any) => void;
  onTemplateSelected?: (templateId: string) => void;
  
  // Options
  showVariations?: boolean;
  autoGenerate?: boolean;
  showMetrics?: boolean;
}

interface GeneratedTemplate {
  id: string;
  name: string;
  uniquenessScore: number;
  conversionOptimized: boolean;
  css: string;
  structure: any;
  components: any;
  preview: {
    sections: Array<{
      type: string;
      variant: string;
      props: any;
    }>;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    typography: {
      heading: string;
      body: string;
    };
  };
}

export function AdaptiveTemplatePreview({
  answers,
  businessIntelligenceId,
  industry,
  onTemplateGenerated,
  onTemplateSelected,
  showVariations = true,
  autoGenerate = true,
  showMetrics = true,
}: AdaptiveTemplatePreviewProps) {
  const [templates, setTemplates] = useState<GeneratedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate template when answers change
  useEffect(() => {
    if (autoGenerate && Object.keys(answers).length > 0) {
      generateTemplates();
    }
  }, [answers, autoGenerate]);

  /**
   * Generate templates based on current answers
   */
  const generateTemplates = async (options: any = {}) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/template-engine/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          businessIntelligenceId,
          industry,
          options: {
            generateVariations: showVariations,
            variationCount: showVariations ? 3 : 1,
            ...options,
          },
        }),
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (!response.ok) {
        throw new Error('Failed to generate templates');
      }

      const data = await response.json();
      setTemplates(data.templates);
      
      // Auto-select first template
      if (data.templates.length > 0) {
        setSelectedTemplate(data.templates[0].id);
        onTemplateGenerated?.(data.templates[0]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  /**
   * Handle template selection
   */
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onTemplateSelected?.(templateId);
      onTemplateGenerated?.(template);
    }
  };

  /**
   * Regenerate with different options
   */
  const regenerateWithOptions = (options: any) => {
    generateTemplates(options);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Adaptive Template Preview
          </h3>
          <p className="text-sm text-gray-600">
            Your unique website design based on your answers
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerateWithOptions({ prioritizeConversion: true })}
            disabled={isGenerating}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Optimize for Conversion
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerateWithOptions({ emphasizeUniqueness: true })}
            disabled={isGenerating}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Make More Unique
          </Button>
        </div>
      </div>

      {/* Generation Progress */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span>Generating your unique template...</span>
              <span>{generationProgress}%</span>
            </div>
            <Progress value={generationProgress} className="h-2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600 text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateTemplates()}
            className="mt-2"
          >
            Try Again
          </Button>
        </Card>
      )}

      {/* Template Variations */}
      {templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <TemplateVariationCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              onSelect={() => handleTemplateSelect(template.id)}
              showMetrics={showMetrics}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Selected Template Details */}
      {selectedTemplate && (
        <SelectedTemplateDetails
          template={templates.find(t => t.id === selectedTemplate)!}
          answers={answers}
        />
      )}
    </div>
  );
}

/**
 * Individual template variation card
 */
interface TemplateVariationCardProps {
  template: GeneratedTemplate;
  isSelected: boolean;
  onSelect: () => void;
  showMetrics: boolean;
  index: number;
}

function TemplateVariationCard({
  template,
  isSelected,
  onSelect,
  showMetrics,
  index,
}: TemplateVariationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
        }`}
        onClick={onSelect}
      >
        {/* Template Preview */}
        <div className="p-4">
          <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
            <TemplatePreviewMiniature template={template} />
          </div>
          
          {/* Template Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{template.name}</h4>
              {isSelected && (
                <Badge variant="default" className="text-xs">
                  Selected
                </Badge>
              )}
            </div>
            
            {showMetrics && (
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>{template.uniquenessScore}% unique</span>
                </div>
                
                {template.conversionOptimized && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Optimized</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Color Palette Preview */}
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: template.preview.colors.primary }}
              />
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: template.preview.colors.secondary }}
              />
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: template.preview.colors.accent }}
              />
              <span className="text-xs text-gray-500 ml-2">
                {template.preview.typography.heading}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Miniature template preview
 */
function TemplatePreviewMiniature({ template }: { template: GeneratedTemplate }) {
  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      {/* Simulate website sections */}
      <div className="space-y-1 p-2 scale-75 origin-top-left">
        {template.preview.sections.map((section, index) => (
          <div
            key={index}
            className={`rounded ${getSectionHeight(section.type)} ${getSectionColor(section.type, template.preview.colors)}`}
          />
        ))}
      </div>
      
      {/* Overlay with template info */}
      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
        <Eye className="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

/**
 * Selected template detailed view
 */
function SelectedTemplateDetails({
  template,
  answers,
}: {
  template: GeneratedTemplate;
  answers: Record<string, any>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Template Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Design System */}
          <div>
            <h5 className="font-medium mb-2 flex items-center gap-1">
              <Palette className="h-4 w-4" />
              Design System
            </h5>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Primary Color:</span>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: template.preview.colors.primary }}
                  />
                  <code className="text-xs">{template.preview.colors.primary}</code>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Typography:</span>
                <p className="text-xs mt-1">
                  Heading: {template.preview.typography.heading}<br />
                  Body: {template.preview.typography.body}
                </p>
              </div>
            </div>
          </div>
          
          {/* Layout Structure */}
          <div>
            <h5 className="font-medium mb-2 flex items-center gap-1">
              <Layout className="h-4 w-4" />
              Layout Structure
            </h5>
            <div className="space-y-1 text-sm">
              {template.preview.sections.map((section, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="capitalize">{section.type}</span>
                  <Badge variant="outline" className="text-xs">
                    {section.variant}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          
          {/* Based On Answers */}
          <div>
            <h5 className="font-medium mb-2">Based On Your Answers</h5>
            <div className="space-y-1 text-sm">
              {Object.entries(answers).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                  </span>
                  <span className="ml-1">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button size="sm">
            <Download className="h-4 w-4 mr-1" />
            Use This Template
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            Full Preview
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Helper functions for preview rendering
 */
function getSectionHeight(sectionType: string): string {
  const heights = {
    hero: 'h-8',
    services: 'h-6',
    about: 'h-4',
    gallery: 'h-6',
    testimonials: 'h-4',
    contact: 'h-6',
    cta: 'h-4',
    'trust-bar': 'h-2',
    faq: 'h-4',
  };
  
  return heights[sectionType as keyof typeof heights] || 'h-4';
}

function getSectionColor(sectionType: string, colors: any): string {
  const colorMap = {
    hero: 'bg-gradient-to-r from-blue-500 to-purple-500',
    services: 'bg-gray-200',
    about: 'bg-gray-100',
    gallery: 'bg-gray-300',
    testimonials: 'bg-gray-100',
    contact: 'bg-gray-200',
    cta: 'bg-gradient-to-r from-green-500 to-blue-500',
    'trust-bar': 'bg-yellow-200',
    faq: 'bg-gray-100',
  };
  
  return colorMap[sectionType as keyof typeof colorMap] || 'bg-gray-100';
}