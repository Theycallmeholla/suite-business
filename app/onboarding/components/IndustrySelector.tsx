'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Briefcase, Trees, Snowflake, Wrench, Sparkles, 
  Zap, Hammer, Building, Check, AlertCircle 
} from 'lucide-react';

interface IndustrySelectorProps {
  detectedIndustry?: string;
  onSelect: (industry: string) => void;
  onBack: () => void;
}

const industries = [
  {
    value: 'landscaping',
    label: 'Landscaping & Lawn Care',
    icon: Trees,
    description: 'Lawn maintenance, garden design, tree services',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    value: 'hvac',
    label: 'HVAC (Heating & Cooling)',
    icon: Snowflake,
    description: 'Heating, ventilation, air conditioning services',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    value: 'plumbing',
    label: 'Plumbing',
    icon: Wrench,
    description: 'Plumbing installation, repair, and maintenance',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    value: 'cleaning',
    label: 'Cleaning Services',
    icon: Sparkles,
    description: 'Residential and commercial cleaning',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    value: 'electrical',
    label: 'Electrical',
    icon: Zap,
    description: 'Electrical installation and repair services',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    value: 'roofing',
    label: 'Roofing',
    icon: Hammer,
    description: 'Roof installation, repair, and inspection',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    value: 'general',
    label: 'General Services',
    icon: Building,
    description: 'Other service-based businesses',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
];

export function IndustrySelector({ detectedIndustry, onSelect, onBack }: IndustrySelectorProps) {
  const [selectedIndustry, setSelectedIndustry] = useState(detectedIndustry || '');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleContinue = () => {
    if (selectedIndustry) {
      setIsConfirming(true);
      onSelect(selectedIndustry);
    }
  };

  const detectedIndustryInfo = industries.find(i => i.value === detectedIndustry);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          Select Your Industry
        </h2>
        <p className="text-gray-600">
          This helps us customize your website with industry-specific features
        </p>
      </div>

      {detectedIndustry && detectedIndustryInfo && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Based on your Google Business Profile, we detected:
              </p>
              <div className="flex items-center mt-2">
                <detectedIndustryInfo.icon className={`h-5 w-5 ${detectedIndustryInfo.color} mr-2`} />
                <span className="font-semibold">{detectedIndustryInfo.label}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      <RadioGroup value={selectedIndustry} onValueChange={setSelectedIndustry}>
        <div className="grid grid-cols-1 gap-3">
          {industries.map((industry) => {
            const Icon = industry.icon;
            const isSelected = selectedIndustry === industry.value;
            const isDetected = detectedIndustry === industry.value;
            
            return (
              <label
                key={industry.value}
                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <RadioGroupItem value={industry.value} className="sr-only" />
                <div className={`${industry.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${industry.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center">
                    <p className="font-semibold">{industry.label}</p>
                    {isDetected && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Detected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {industry.description}
                  </p>
                </div>
                {isSelected && (
                  <Check className="h-5 w-5 text-blue-600 ml-4" />
                )}
              </label>
            );
          })}
        </div>
      </RadioGroup>

      {/* Enhanced Question Flow Option */}
      {selectedIndustry && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="text-center">
            <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Want an Even Better Website?</h3>
            <p className="text-gray-600 mb-4">
              Answer 3-5 quick questions and we'll create a website that's perfectly tailored to your business. 
              See changes happen in real-time!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  // Redirect to enhanced question flow
                  const params = new URLSearchParams({
                    name: 'Your Business', // This would come from business data
                    industry: selectedIndustry
                  });
                  window.location.href = `/onboarding/enhance?${params.toString()}`;
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Enhance My Website
              </Button>
              <Button
                variant="outline"
                onClick={handleContinue}
                disabled={isConfirming}
                className="flex-1"
              >
                Create Basic Website
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isConfirming}
          className="flex-1"
        >
          Back
        </Button>
        {!selectedIndustry && (
          <Button
            onClick={handleContinue}
            disabled={!selectedIndustry || isConfirming}
            className="flex-1"
          >
            {isConfirming ? 'Confirming...' : 'Continue'}
          </Button>
        )}
      </div>
    </div>
  );
}
