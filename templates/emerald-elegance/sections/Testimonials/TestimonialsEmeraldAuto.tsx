'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Quote } from 'lucide-react';
import { EditableText } from '@/components/EditableText';

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
}

interface TestimonialsEmeraldAutoProps {
  data: {
    title?: string;
    subtitle?: string;
    testimonials?: Testimonial[];
  };
  siteId: string;
  isEditable?: boolean;
}

export default function TestimonialsEmeraldAuto({ data, siteId, isEditable = false }: TestimonialsEmeraldAutoProps) {
  const defaultTestimonials: Testimonial[] = [
    { 
      quote: "Our garden is now our favorite 'room' in the house. The transformation is beyond what we ever imagined.", 
      author: "The Hamilton Family",
      role: "Residential Client"
    },
    { 
      quote: "Incredibly professional and creative. They listened to our vision and executed it flawlessly. Worth every penny.", 
      author: "James & Sarah P.",
      role: "Homeowners"
    },
    { 
      quote: "The attention to detail is what sets them apart. From the design phase to the final planting, everything was perfect.", 
      author: "M. Chen",
      role: "Garden Enthusiast"
    }
  ];

  const testimonials = data.testimonials || defaultTestimonials;
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);
  
  useEffect(() => {
    const timer = setTimeout(next, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex, next]);

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-emerald-900">
          <EditableText
            value={data.title || 'What Our Clients Say'}
            onSave={(value) => {}}
            isEditable={isEditable}
          />
        </h2>
        {data.subtitle && (
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            <EditableText
              value={data.subtitle}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </p>
        )}
        
        <div className="relative mt-12 max-w-3xl mx-auto h-64 md:h-48 flex items-center">
          <Quote className="absolute top-0 left-1/2 transform -translate-x-1/2 h-12 w-12 text-emerald-200" />
          
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`absolute w-full transition-all duration-500 ease-in-out ${
                index === currentIndex 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-4'
              }`}
            >
              <p className="text-xl md:text-2xl italic text-gray-700 mb-6">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="font-semibold text-emerald-700">
                  — {testimonial.author}
                </p>
                {testimonial.role && (
                  <p className="text-sm text-gray-500 mt-1">
                    {testimonial.role}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8 space-x-3">
          {testimonials.map((_, index) => (
            <button 
              key={index} 
              onClick={() => setCurrentIndex(index)} 
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-emerald-600 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}