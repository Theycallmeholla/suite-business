/**
 * Demo Component: Enhanced Site Generator UI
 * 
 * Shows how to use the enhanced multi-source site generator
 * with intelligent questions flow
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Question {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'boolean' | 'text' | 'photo-label';
  category: string;
  context?: any;
  required?: boolean;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  photos?: Array<{
    id: string;
    url: string;
    alt?: string;
  }>;
}

interface PhotoLabel {
  photoId: string;
  label: string;
  customLabel?: string;
}

export default function EnhancedSiteGeneratorDemo({ 
  locationId,
  industry,
  isPlaceId = false 
}: {
  locationId: string;
  industry?: string;
  isPlaceId?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<'initial' | 'questions' | 'generating' | 'complete'>('initial');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Fetch questions
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sites/create-from-gbp-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          industry,
          isPlaceId,
          generateQuestionsOnly: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch questions');
      }

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setStep('questions');
      } else {
        // No questions needed, generate site directly
        generateSite({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      toast({
        title: 'Error',
        description: 'Failed to fetch questions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Generate site with answers
  const generateSite = async (userAnswers: Record<string, any>) => {
    setStep('generating');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sites/create-from-gbp-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          industry,
          isPlaceId,
          userAnswers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate site');
      }

      setSiteData(data);
      setStep('complete');
      
      toast({
        title: 'Success!',
        description: 'Your website has been created successfully.',
      });

      // Redirect to site editor after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/sites/${data.id}/editor`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('questions');
      toast({
        title: 'Error',
        description: 'Failed to create site. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Handle photo labeling
  const handlePhotoLabel = (photoId: string, label: string, customLabel?: string) => {
    setAnswers(prev => ({
      ...prev,
      photoContexts: {
        ...(prev.photoContexts || {}),
        [photoId]: {
          label,
          customLabel,
        },
      },
    }));
  };

  // Submit answers
  const handleSubmit = () => {
    generateSite(answers);
  };

  // Render question based on type
  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'single':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <span className="font-medium">{option.label}</span>
                  {option.description && (
                    <span className="block text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={(answers[question.id] || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const current = answers[question.id] || [];
                    if (checked) {
                      handleAnswerChange(question.id, [...current, option.value]);
                    } else {
                      handleAnswerChange(question.id, current.filter((v: string) => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <span className="font-medium">{option.label}</span>
                  {option.description && (
                    <span className="block text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <RadioGroup
            value={answers[question.id]?.toString() || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value === 'true')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false">No</Label>
            </div>
          </RadioGroup>
        );

      case 'text':
        return (
          <Input
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer..."
          />
        );

      case 'photo-label':
        return (
          <div className="grid grid-cols-2 gap-4">
            {question.photos?.map((photo) => (
              <div key={photo.id} className="space-y-2">
                <img
                  src={photo.url}
                  alt={photo.alt || 'Business photo'}
                  className="w-full h-32 object-cover rounded"
                />
                <Select
                  value={answers.photoContexts?.[photo.id]?.label || ''}
                  onValueChange={(value) => handlePhotoLabel(photo.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a label" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Before">Before</SelectItem>
                    <SelectItem value="After">After</SelectItem>
                    <SelectItem value="Completed Project">Completed Project</SelectItem>
                    <SelectItem value="Team Photo">Team Photo</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Office/Building">Office/Building</SelectItem>
                    <SelectItem value="Custom">Custom Label</SelectItem>
                  </SelectContent>
                </Select>
                {answers.photoContexts?.[photo.id]?.label === 'Custom' && (
                  <Input
                    value={answers.photoContexts?.[photo.id]?.customLabel || ''}
                    onChange={(e) => handlePhotoLabel(photo.id, 'Custom', e.target.value)}
                    placeholder="Enter custom label..."
                  />
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Group questions by category
  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<string, Question[]>);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Initial State */}
      {step === 'initial' && (
        <Card>
          <CardHeader>
            <CardTitle>Create Enhanced Website</CardTitle>
            <CardDescription>
              We'll analyze your business data from multiple sources and ask a few smart questions
              to create a comprehensive, competitive website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchQuestions} disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing business data...
                </>
              ) : (
                'Start Website Creation'
              )}
            </Button>
            {error && (
              <div className="mt-4 text-sm text-destructive flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Questions State */}
      {step === 'questions' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Let's Fine-Tune Your Website</CardTitle>
              <CardDescription>
                We've analyzed your business data. Please answer these questions to help us create
                the perfect website for your business.
              </CardDescription>
            </CardHeader>
          </Card>

          {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryQuestions.map((question) => (
                  <div key={question.id} className="space-y-2">
                    <Label className="text-base">
                      {question.question}
                      {question.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('initial')}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating website...
                </>
              ) : (
                'Create Website'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Generating State */}
      {step === 'generating' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Creating Your Website</h3>
              <p className="text-muted-foreground">
                We're using competitive intelligence and your answers to build a unique,
                comprehensive website...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete State */}
      {step === 'complete' && siteData && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Website Created Successfully!</h3>
              <p className="text-muted-foreground">
                Your website has been created with the "{siteData.template}" template
                using a {siteData.competitiveStrategy?.positioning} positioning strategy.
              </p>
              <div className="text-sm text-muted-foreground">
                Data Quality Score: {Math.round(siteData.dataQuality * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting to the editor...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
