'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MessageCircle, Target, Palette, Trophy, 
  Users, Sparkles, CheckCircle2, Loader2 
} from 'lucide-react';

interface IntelligentQuestionsProps {
  questions: Array<{
    question: string;
    type: 'text' | 'select' | 'multiselect' | 'boolean';
    options?: string[];
    reason: string;
    category: 'branding' | 'services' | 'target' | 'goals';
  }>;
  businessIntelligence?: {
    colors: any;
    photos: any[];
    aiContent: any;
  };
  onComplete: (answers: Record<string, any>) => void;
  onSkip: () => void;
}

const categoryIcons = {
  branding: <Palette className="h-5 w-5" />,
  services: <Trophy className="h-5 w-5" />,
  target: <Target className="h-5 w-5" />,
  goals: <Users className="h-5 w-5" />,
};

const categoryColors = {
  branding: 'text-purple-600 bg-purple-50',
  services: 'text-blue-600 bg-blue-50',
  target: 'text-green-600 bg-green-50',
  goals: 'text-orange-600 bg-orange-50',
};

export function IntelligentQuestions({ 
  questions, 
  businessIntelligence,
  onComplete, 
  onSkip 
}: IntelligentQuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.question]: value
    }));
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleComplete = async () => {
    setIsSubmitting(true);
    await onComplete(answers);
    setIsSubmitting(false);
  };
  
  const currentAnswer = answers[currentQuestion.question];
  const canProceed = currentAnswer !== undefined && currentAnswer !== '';
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          Let's Personalize Your Website
        </h2>
        <p className="text-gray-600">
          We've analyzed your business. Answer a few questions to make your site perfect.
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* AI Insights Preview */}
      {businessIntelligence && currentQuestionIndex === 0 && (
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
            What We Found About Your Business
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {businessIntelligence.colors.extracted && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[businessIntelligence.colors.primary, businessIntelligence.colors.secondary].map((color, i) => (
                    <div 
                      key={i}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span>Brand colors detected</span>
              </div>
            )}
            {businessIntelligence.photos.length > 0 && (
              <div>✅ {businessIntelligence.photos.length} business photos found</div>
            )}
            {businessIntelligence.aiContent.heroTitle && (
              <div>✅ Generated compelling copy</div>
            )}
          </div>
        </Card>
      )}
      
      {/* Question Card */}
      <Card className="p-8">
        <div className="space-y-6">
          {/* Question Header */}
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-4 ${categoryColors[currentQuestion.category]}`}>
              {categoryIcons[currentQuestion.category]}
              <span className="font-medium capitalize">{currentQuestion.category}</span>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">
              {currentQuestion.question}
            </h3>
            
            <p className="text-sm text-gray-500">
              <MessageCircle className="h-4 w-4 inline mr-1" />
              {currentQuestion.reason}
            </p>
          </div>
          
          {/* Answer Input */}
          <div className="space-y-4">
            {currentQuestion.type === 'text' && (
              <Textarea
                value={currentAnswer || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[100px]"
                autoFocus
              />
            )}
            
            {currentQuestion.type === 'select' && currentQuestion.options && (
              <RadioGroup
                value={currentAnswer || ''}
                onValueChange={handleAnswer}
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <RadioGroupItem value={option} />
                      <span className="flex-1">{option}</span>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            )}
            
            {currentQuestion.type === 'multiselect' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      checked={(currentAnswer || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const current = currentAnswer || [];
                        if (checked) {
                          handleAnswer([...current, option]);
                        } else {
                          handleAnswer(current.filter((v: string) => v !== option));
                        }
                      }}
                    />
                    <span className="flex-1">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {currentQuestion.type === 'boolean' && (
              <RadioGroup
                value={currentAnswer?.toString() || ''}
                onValueChange={(value) => handleAnswer(value === 'true')}
              >
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="true" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="false" />
                    <span>No</span>
                  </label>
                </div>
              </RadioGroup>
            )}
          </div>
        </div>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {currentQuestionIndex > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              Previous
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={isSubmitting}
          >
            Skip All & Use AI Suggestions
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : currentQuestionIndex < questions.length - 1 ? (
              'Next'
            ) : (
              'Complete'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
