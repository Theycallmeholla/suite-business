'use client';

import React from 'react';
import { EditableText } from '@/components/EditableText';
import { useTheme } from '@/contexts/ThemeContext';

interface Testimonial {
  content: string;
  author: string;
  role?: string;
}

interface TestimonialsArtistryGridProps {
  content: {
    sectionTitle?: string;
    testimonials?: Testimonial[];
  };
  onUpdate?: (updates: any) => void;
}

export default function TestimonialsArtistryGrid({ content, onUpdate }: TestimonialsArtistryGridProps) {
  const { colors } = useTheme();
  
  const defaultTestimonials: Testimonial[] = content.testimonials || [
    {
      content: "The transformation of our backyard has been nothing short of magical. Every detail was carefully considered and beautifully executed.",
      author: "Sarah Johnson",
      role: "Homeowner"
    },
    {
      content: "Professional, creative, and attentive to our vision. The team brought ideas we never would have imagined and made them reality.",
      author: "Michael Chen",
      role: "Property Developer"
    },
    {
      content: "Our garden has become the centerpiece of our home. Friends and family are constantly amazed by the beauty and functionality.",
      author: "Emily Rodriguez",
      role: "Homeowner"
    },
    {
      content: "Exceptional attention to detail and a true understanding of landscape architecture. The results speak for themselves.",
      author: "David Thompson",
      role: "Architect"
    }
  ];

  const sectionTitle = content.sectionTitle || 'Client Stories';

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-4">
            <EditableText
              value={sectionTitle}
              onSave={async (value) => {
                if (onUpdate) {
                  await onUpdate({ sectionTitle: value });
                }
              }}
              className="inline-block"
            />
          </h2>
          <div className="w-20 h-0.5 bg-gray-900 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {defaultTestimonials.map((testimonial, index) => (
            <div key={index} className="space-y-4">
              <div className="text-6xl text-gray-200 font-serif leading-none">"</div>
              <p className="text-gray-700 text-lg leading-relaxed -mt-8 pl-8">
                <EditableText
                  value={testimonial.content}
                  onSave={(value) => {
                    const updatedTestimonials = [...defaultTestimonials];
                    updatedTestimonials[index].content = value;
                    onUpdate?.({ testimonials: updatedTestimonials });
                  }}
                  multiline
                  className="inline-block"
                />
              </p>
              <div className="pl-8 pt-4">
                <p className="font-medium text-gray-900">
                  <EditableText
                    value={testimonial.author}
                    onSave={(value) => {
                      const updatedTestimonials = [...defaultTestimonials];
                      updatedTestimonials[index].author = value;
                      onUpdate?.({ testimonials: updatedTestimonials });
                    }}
                    className="inline-block"
                  />
                </p>
                {testimonial.role && (
                  <p className="text-sm text-gray-500">
                    <EditableText
                      value={testimonial.role}
                      onSave={(value) => {
                        const updatedTestimonials = [...defaultTestimonials];
                        updatedTestimonials[index].role = value;
                        onUpdate?.({ testimonials: updatedTestimonials });
                      }}
                      className="inline-block"
                    />
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}