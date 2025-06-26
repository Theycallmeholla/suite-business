'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartQuestion, QuestionOption } from '@/types/intelligence';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartQuestionsProps {
  questions: SmartQuestion[];
  onComplete: (answers: Record<string, any>) => void;
  businessName?: string;
}

export function SmartQuestions({ questions, onComplete, businessName }: SmartQuestionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  
  const handleAnswer = (value: any) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    } else {
      onComplete(newAnswers);
    }
  };
  
  const handleMultiSelect = (value: string) => {
    const current = answers[currentQuestion.id] || [];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    
    if (currentQuestion.maxSelections && updated.length > currentQuestion.maxSelections) {
      return;
    }
    
    setAnswers({ ...answers, [currentQuestion.id]: updated });
  };
  
  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'tinder-swipe':
        return <TinderSwipeQuestion 
          question={currentQuestion} 
          onSwipe={handleAnswer}
          swipeDirection={swipeDirection}
          setSwipeDirection={setSwipeDirection}
        />;
        
      case 'service-grid':
        return <ServiceGridQuestion 
          question={currentQuestion} 
          onSelect={currentQuestion.multiSelect ? handleMultiSelect : handleAnswer}
          selected={answers[currentQuestion.id] || []}
          multiSelect={currentQuestion.multiSelect}
        />;
        
      case 'quick-select':
        return <QuickSelectQuestion 
          question={currentQuestion} 
          onSelect={handleAnswer}
          selected={answers[currentQuestion.id]}
        />;
        
      case 'yes-no-visual':
        return <YesNoVisualQuestion 
          question={currentQuestion} 
          onSelect={handleAnswer}
        />;
        
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">
            {businessName ? `Setting up ${businessName}` : 'Quick Setup'}
          </h2>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderQuestion()}
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        
        {currentQuestion.multiSelect && (
          <Button
            onClick={() => handleAnswer(answers[currentQuestion.id] || [])}
            disabled={!answers[currentQuestion.id]?.length}
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Tinder-style swipe question
 */
function TinderSwipeQuestion({ 
  question, 
  onSwipe,
  swipeDirection,
  setSwipeDirection
}: {
  question: SmartQuestion;
  onSwipe: (values: string[]) => void;
  swipeDirection: 'left' | 'right' | null;
  setSwipeDirection: (dir: 'left' | 'right' | null) => void;
}) {
  const [currentCard, setCurrentCard] = useState(0);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  
  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    
    if (direction === 'right') {
      setSelectedValues([...selectedValues, question.options[currentCard].value]);
    }
    
    setTimeout(() => {
      if (currentCard < question.options.length - 1) {
        setCurrentCard(currentCard + 1);
        setSwipeDirection(null);
      } else {
        onSwipe(selectedValues);
      }
    }, 300);
  };
  
  if (currentCard >= question.options.length) {
    return null;
  }
  
  const option = question.options[currentCard];
  
  return (
    <div className="text-center">
      <h3 className="text-2xl font-semibold mb-2">{question.question}</h3>
      {question.description && (
        <p className="text-gray-600 mb-8">{question.description}</p>
      )}
      
      <div className="relative h-96 flex items-center justify-center">
        <motion.div
          className="absolute"
          animate={{
            x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
            opacity: swipeDirection ? 0 : 1,
            rotate: swipeDirection === 'left' ? -30 : swipeDirection === 'right' ? 30 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-80 h-80 p-8 flex flex-col items-center justify-center shadow-xl">
            <div className="text-6xl mb-4">{option.icon}</div>
            <h4 className="text-2xl font-semibold mb-2">{option.label}</h4>
            {option.description && (
              <p className="text-gray-600">{option.description}</p>
            )}
          </Card>
        </motion.div>
        
        {/* Swipe buttons */}
        <button
          onClick={() => handleSwipe('left')}
          className="absolute left-0 p-4 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
        >
          <X className="w-8 h-8" />
        </button>
        
        <button
          onClick={() => handleSwipe('right')}
          className="absolute right-0 p-4 rounded-full bg-green-100 hover:bg-green-200 text-green-600"
        >
          <Check className="w-8 h-8" />
        </button>
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        Swipe right for yes, left for no
      </p>
    </div>
  );
}

/**
 * Service grid selection
 */
function ServiceGridQuestion({ 
  question, 
  onSelect, 
  selected,
  multiSelect 
}: {
  question: SmartQuestion;
  onSelect: (value: string) => void;
  selected: string | string[];
  multiSelect?: boolean;
}) {
  const selectedArray = Array.isArray(selected) ? selected : [selected];
  
  return (
    <div>
      <h3 className="text-2xl font-semibold mb-2">{question.question}</h3>
      {question.description && (
        <p className="text-gray-600 mb-6">{question.description}</p>
      )}
      
      {multiSelect && question.maxSelections && (
        <p className="text-sm text-gray-500 mb-4">
          Select up to {question.maxSelections} ({selectedArray.length} selected)
        </p>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {question.options.map((option) => {
          const isSelected = selectedArray.includes(option.value);
          
          return (
            <Card
              key={option.value}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-lg",
                isSelected && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => onSelect(option.value)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{option.label}</h4>
                  {option.description && (
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  )}
                  {option.popular && (
                    <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Popular choice
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-sm text-primary hover:underline">
          Don't see yours? Add custom service
        </button>
      </div>
    </div>
  );
}

/**
 * Quick select buttons
 */
function QuickSelectQuestion({ 
  question, 
  onSelect,
  selected 
}: {
  question: SmartQuestion;
  onSelect: (value: string) => void;
  selected?: string;
}) {
  return (
    <div className="text-center">
      <h3 className="text-2xl font-semibold mb-2">{question.question}</h3>
      {question.description && (
        <p className="text-gray-600 mb-8">{question.description}</p>
      )}
      
      <div className="space-y-3 max-w-md mx-auto">
        {question.options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              "w-full p-4 rounded-lg border-2 transition-all text-left",
              selected === option.value
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{option.label}</h4>
                {option.description && (
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                )}
              </div>
              {option.popular && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Most common
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Visual yes/no question
 */
function YesNoVisualQuestion({ 
  question, 
  onSelect 
}: {
  question: SmartQuestion;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="text-center">
      <h3 className="text-2xl font-semibold mb-8">{question.question}</h3>
      
      <div className="flex gap-6 justify-center">
        {question.options.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => onSelect(option.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-8 rounded-xl border-2 border-gray-200 hover:border-primary transition-all"
          >
            <div className="text-5xl mb-4">{option.icon}</div>
            <h4 className="text-xl font-medium">{option.label}</h4>
            {option.description && (
              <p className="text-sm text-gray-600 mt-2">{option.description}</p>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}