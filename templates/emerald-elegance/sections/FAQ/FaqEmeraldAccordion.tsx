'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { EditableText } from '@/components/EditableText';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqEmeraldAccordionProps {
  data: {
    title?: string;
    subtitle?: string;
    faq?: FaqItem[];
  };
  siteId: string;
  isEditable?: boolean;
}

const FaqItemComponent = ({ q, a, isEditable }: { q: string; a: string; isEditable: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center text-left group"
      >
        <h3 className="text-lg font-semibold text-emerald-800 pr-8">
          <EditableText
            value={q}
            onSave={(value) => {}}
            isEditable={isEditable}
          />
        </h3>
        <div className={`transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-6 w-6 text-emerald-500" />
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 mt-4' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600 pr-8">
          <EditableText
            value={a}
            onSave={(value) => {}}
            isEditable={isEditable}
          />
        </p>
      </div>
    </div>
  );
};

export default function FaqEmeraldAccordion({ data, siteId, isEditable = false }: FaqEmeraldAccordionProps) {
  const defaultFaqs: FaqItem[] = [
    { 
      q: "What is the typical timeline for a garden design project?", 
      a: "A standard design project takes 4-6 weeks from initial consultation to final design presentation. Installation timelines vary based on complexity, but we'll provide a detailed schedule upfront." 
    },
    { 
      q: "Do you offer maintenance plans for gardens you didn't install?", 
      a: "Yes, we offer our comprehensive maintenance services for all types of gardens. We begin with a consultation to assess the garden's needs and create a custom care plan." 
    },
    { 
      q: "How do you handle project budgets?", 
      a: "We believe in full transparency. We work with you to establish a clear budget during the design phase and provide detailed cost breakdowns. Any changes are discussed and approved by you before implementation." 
    },
    { 
      q: "What is your service area?", 
      a: "We primarily serve the greater metropolitan area and surrounding counties. For large-scale projects, we are open to traveling further. Please contact us to discuss your project's location." 
    }
  ];

  const faqs = data.faq || defaultFaqs;

  return (
    <section className="py-20 md:py-32 bg-stone-50">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 text-center">
          <EditableText
            value={data.title || 'Frequently Asked Questions'}
            onSave={(value) => {}}
            isEditable={isEditable}
          />
        </h2>
        {data.subtitle && (
          <p className="mt-4 text-lg text-gray-600 text-center max-w-2xl mx-auto">
            <EditableText
              value={data.subtitle}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </p>
        )}
        
        <div className="mt-12">
          {faqs.map((faq, i) => (
            <FaqItemComponent 
              key={i} 
              q={faq.q} 
              a={faq.a}
              isEditable={isEditable}
            />
          ))}
        </div>
      </div>
    </section>
  );
}