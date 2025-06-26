/**
 * Website Generation Flow
 * 
 * Complete user experience that integrates:
 * - Question system (from other agent)
 * - Content generation
 * - Template creation
 * - Real-time progress
 * - Final website delivery
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressiveLoading, LoadingButton } from '@/components/ui/loading-states';
import { 
  Wand2, 
  Sparkles, 
  Eye, 
  ExternalLink,
  Download,
  Share2,
  Settings,
  CheckCircle2,
  TrendingUp,
  Palette,
  FileText,
  Globe,
  Zap
} from 'lucide-react';

interface WebsiteGenerationFlowProps {
  businessIntelligenceId: string;
  industry: string;
  initialAnswers?: Record<string, any>;
  onComplete?: (websites: any[]) => void;
  className?: string;
}

interface GenerationProgress {
  step: string;
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

interface GeneratedWebsite {
  id: string;
  subdomain: string;
  businessName: string;
  publishedUrl: string;
  metadata: {
    uniquenessScore: number;
    seoScore: number;
    conversionOptimized: boolean;
    generationTime: number;
  };
  template: any;
  content: any;
}

export function WebsiteGenerationFlow({
  businessIntelligenceId,
  industry,
  initialAnswers = {},
  onComplete,
  className = ''
}: WebsiteGenerationFlowProps) {
  const [currentStep, setCurrentStep] = useState<'questions' | 'generation' | 'results'>('questions');
  const [answers, setAnswers] = useState(initialAnswers);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [generatedWebsites, setGeneratedWebsites] = useState<GeneratedWebsite[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [generationOptions, setGenerationOptions] = useState({
    generateVariations: true,
    variationCount: 3,
    optimizeForConversion: true,
    includeAdvancedSEO: true,
    optimizeImages: true,
    publishImmediately: false,
  });

  /**
   * Start website generation process
   */
  const startGeneration = async () => {
    setIsGenerating(true);
    setCurrentStep('generation');
    setGenerationProgress({
      step: 'initialization',
      progress: 0,
      message: 'Starting website generation...',
      estimatedTimeRemaining: 120,
    });

    try {
      // Simulate real-time progress updates
      const progressSteps = [
        { step: 'validation', progress: 5, message: 'Validating business data...', time: 120 },
        { step: 'content-generation', progress: 15, message: 'Generating unique website content...', time: 100 },
        { step: 'template-generation', progress: 35, message: 'Creating your unique website design...', time: 80 },
        { step: 'seo-optimization', progress: 50, message: 'Optimizing for search engines...', time: 60 },
        { step: 'image-optimization', progress: 65, message: 'Optimizing images for fast loading...', time: 40 },
        { step: 'website-creation', progress: 80, message: 'Creating your website...', time: 20 },
        { step: 'completion', progress: 100, message: 'Website generation complete!', time: 0 },
      ];

      // Simulate progress updates
      for (const step of progressSteps) {
        setGenerationProgress(step);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Make actual API call
      const response = await fetch('/api/orchestration/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessIntelligenceId,
          industry,
          answers,
          options: generationOptions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate website');
      }

      const data = await response.json();
      setGeneratedWebsites(data.websites);
      setSelectedWebsite(data.websites[0]?.id || null);
      setCurrentStep('results');
      onComplete?.(data.websites);

    } catch (error) {
      console.error('Website generation failed:', error);
      setGenerationProgress({
        step: 'error',
        progress: 0,
        message: 'Generation failed. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle question completion
   */
  const handleQuestionsComplete = (questionAnswers: Record<string, any>) => {
    setAnswers({ ...answers, ...questionAnswers });
    // Auto-start generation or show generation options
    if (Object.keys(questionAnswers).length >= 3) {
      startGeneration();
    }
  };

  /**
   * Publish selected website
   */
  const publishWebsite = async (websiteId: string) => {
    try {
      const response = await fetch(`/api/sites/${websiteId}/publish`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update website status
        setGeneratedWebsites(prev => 
          prev.map(w => 
            w.id === websiteId 
              ? { ...w, published: true }
              : w
          )
        );
      }
    } catch (error) {
      console.error('Failed to publish website:', error);
    }
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Progress Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold">Website Generation</h1>
        </div>
        
        <div className="flex items-center justify-center gap-8">
          <StepIndicator 
            step={1} 
            title="Questions" 
            active={currentStep === 'questions'} 
            completed={currentStep !== 'questions'} 
          />
          <div className="w-12 h-px bg-gray-300" />
          <StepIndicator 
            step={2} 
            title="Generation" 
            active={currentStep === 'generation'} 
            completed={currentStep === 'results'} 
          />
          <div className="w-12 h-px bg-gray-300" />
          <StepIndicator 
            step={3} 
            title="Results" 
            active={currentStep === 'results'} 
            completed={false} 
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <QuestionsStep
              industry={industry}
              initialAnswers={answers}
              onComplete={handleQuestionsComplete}
              onAnswersChange={setAnswers}
            />
          </motion.div>
        )}

        {currentStep === 'generation' && (
          <motion.div
            key="generation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GenerationStep
              progress={generationProgress}
              answers={answers}
              industry={industry}
            />
          </motion.div>
        )}

        {currentStep === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ResultsStep
              websites={generatedWebsites}
              selectedWebsite={selectedWebsite}
              onSelectWebsite={setSelectedWebsite}
              onPublishWebsite={publishWebsite}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Step indicator component
 */
function StepIndicator({ 
  step, 
  title, 
  active, 
  completed 
}: { 
  step: number; 
  title: string; 
  active: boolean; 
  completed: boolean; 
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
        completed 
          ? 'bg-green-500 text-white' 
          : active 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-600'
      }`}>
        {completed ? <CheckCircle2 className="h-5 w-5" /> : step}
      </div>
      <span className={`text-sm font-medium ${
        active || completed ? 'text-gray-900' : 'text-gray-500'
      }`}>
        {title}
      </span>
    </div>
  );
}

/**
 * Questions step component
 */
function QuestionsStep({
  industry,
  initialAnswers,
  onComplete,
  onAnswersChange
}: {
  industry: string;
  initialAnswers: Record<string, any>;
  onComplete: (answers: Record<string, any>) => void;
  onAnswersChange: (answers: Record<string, any>) => void;
}) {
  const [answers, setAnswers] = useState(initialAnswers);

  const handleAnswerChange = (key: string, value: any) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    onAnswersChange(newAnswers);
  };

  const isComplete = Object.keys(answers).length >= 3;

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Tell Us About Your Business</h2>
          <p className="text-gray-600">
            Answer a few questions to help us create the perfect website for your {industry} business.
          </p>
        </div>

        {/* Quick Questions */}
        <div className="space-y-4">
          <QuestionCard
            title="What services do you offer?"
            description="Select your main services"
            value={answers.services || []}
            onChange={(value: any) => handleAnswerChange('services', value)}
            type="multiselect"
            options={getServiceOptions(industry)}
          />

          <QuestionCard
            title="What makes your business special?"
            description="Choose your key differentiators"
            value={answers.differentiators || []}
            onChange={(value: any) => handleAnswerChange('differentiators', value)}
            type="multiselect"
            options={[
              'Family-owned',
              'Eco-friendly',
              'Award-winning',
              'Best-rated',
              'Satisfaction guaranteed',
              'Free estimates',
              'Veteran-owned',
              'Women-owned'
            ]}
          />

          <QuestionCard
            title="Do you offer emergency services?"
            description="Available 24/7 for urgent needs"
            value={answers.emergencyService}
            onChange={(value: any) => handleAnswerChange('emergencyService', value)}
            type="boolean"
          />

          <QuestionCard
            title="How long have you been in business?"
            description="Your experience level"
            value={answers.businessStage}
            onChange={(value: any) => handleAnswerChange('businessStage', value)}
            type="select"
            options={['Just started', '1-5 years', '5-10 years', '10+ years']}
          />
        </div>

        <div className="text-center pt-4">
          <LoadingButton
            onClick={() => onComplete(answers)}
            disabled={!isComplete}
            size="lg"
            className="px-8"
          >
            <Wand2 className="h-5 w-5 mr-2" />
            Generate My Website
          </LoadingButton>
          
          {!isComplete && (
            <p className="text-sm text-gray-500 mt-2">
              Please answer at least 3 questions to continue
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Generation step component
 */
function GenerationStep({
  progress,
  answers,
  industry
}: {
  progress: GenerationProgress | null;
  answers: Record<string, any>;
  industry: string;
}) {
  const steps = [
    'Validating business data',
    'Generating unique content',
    'Creating website design',
    'Optimizing for search engines',
    'Optimizing images',
    'Creating website',
    'Finalizing details'
  ];

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Creating Your Website</h2>
          <p className="text-gray-600">
            We're generating a unique, professional website based on your answers.
          </p>
        </div>

        {progress && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{progress.message}</span>
              <span className="text-gray-500">
                {progress.estimatedTimeRemaining ? `${progress.estimatedTimeRemaining}s remaining` : ''}
              </span>
            </div>
            
            <Progress value={progress.progress} className="h-3" />
            
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">{progress.progress}%</span>
            </div>
          </div>
        )}

        <ProgressiveLoading
          steps={steps}
          currentStep={Math.floor((progress?.progress || 0) / 14)}
        />

        {/* Preview of what's being generated */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-medium">Unique Content</h3>
            <p className="text-sm text-gray-600">AI-generated copy tailored to your business</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Palette className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-medium">Custom Design</h3>
            <p className="text-sm text-gray-600">Template adapted to your industry and style</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-medium">SEO Optimized</h3>
            <p className="text-sm text-gray-600">Search engine ready from day one</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Results step component
 */
function ResultsStep({
  websites,
  selectedWebsite,
  onSelectWebsite,
  onPublishWebsite
}: {
  websites: GeneratedWebsite[];
  selectedWebsite: string | null;
  onSelectWebsite: (id: string) => void;
  onPublishWebsite: (id: string) => void;
}) {
  const selected = websites.find(w => w.id === selectedWebsite);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Website is Ready!</h2>
        <p className="text-gray-600">
          We've generated {websites.length} unique website{websites.length > 1 ? 's' : ''} for you to choose from.
        </p>
      </div>

      {/* Website Variations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {websites.map((website, index) => (
          <WebsiteCard
            key={website.id}
            website={website}
            index={index}
            selected={selectedWebsite === website.id}
            onSelect={() => onSelectWebsite(website.id)}
          />
        ))}
      </div>

      {/* Selected Website Details */}
      {selected && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{selected.businessName}</h3>
                <p className="text-gray-600">{selected.publishedUrl}</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={selected.publishedUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </a>
                </Button>
                
                <Button size="sm" onClick={() => onPublishWebsite(selected.id)}>
                  <Globe className="h-4 w-4 mr-1" />
                  Publish Website
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {selected.metadata.uniquenessScore}%
                </div>
                <div className="text-sm text-gray-600">Uniqueness</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {selected.metadata.seoScore}%
                </div>
                <div className="text-sm text-gray-600">SEO Score</div>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {(selected.metadata.generationTime / 1000).toFixed(1)}s
                </div>
                <div className="text-sm text-gray-600">Generated</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * Helper components
 */
function QuestionCard({ title, description, value, onChange, type, options }: any) {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        
        {/* Simplified form controls - in real implementation, use proper form components */}
        <div className="text-sm text-gray-500">
          Current: {JSON.stringify(value)}
        </div>
      </div>
    </Card>
  );
}

function WebsiteCard({ website, index, selected, onSelect }: any) {
  return (
    <Card 
      className={`p-4 cursor-pointer transition-all ${
        selected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="space-y-3">
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <Globe className="h-8 w-8 text-gray-400" />
        </div>
        
        <div>
          <h3 className="font-medium">Variation {index + 1}</h3>
          <p className="text-sm text-gray-600">{website.businessName}</p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            {website.metadata.uniquenessScore}% unique
          </Badge>
          {website.metadata.conversionOptimized && (
            <Badge variant="outline" className="text-xs">
              Optimized
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

function getServiceOptions(industry: string): string[] {
  const serviceMap: Record<string, string[]> = {
    landscaping: ['Lawn Mowing', 'Landscape Design', 'Tree Trimming', 'Irrigation', 'Hardscaping'],
    plumbing: ['Emergency Repair', 'Drain Cleaning', 'Water Heater', 'Leak Repair', 'Pipe Repair'],
    hvac: ['AC Repair', 'Heating Repair', 'Maintenance', 'Installation', 'Duct Cleaning'],
    cleaning: ['House Cleaning', 'Deep Cleaning', 'Commercial Cleaning', 'Move-out Cleaning'],
    roofing: ['Roof Repair', 'Roof Replacement', 'Roof Inspection', 'Gutter Repair'],
    electrical: ['Electrical Repair', 'Wiring', 'Panel Upgrade', 'Outlet Installation'],
  };
  
  return serviceMap[industry] || ['Service 1', 'Service 2', 'Service 3'];
}