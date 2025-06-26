'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { EditableText } from '@/components/EditableText';
import Image from 'next/image';

interface PortfolioItem {
  id: number;
  title: string;
  before: string;
  after: string;
  description: string;
}

interface PortfolioEmeraldSliderProps {
  data: {
    title?: string;
    subtitle?: string;
    portfolioItems?: PortfolioItem[];
  };
  siteId: string;
  isEditable?: boolean;
}

const BeforeAfterSlider = ({ before, after, title }: { before: string; after: string; title: string }) => {
  const [sliderValue, setSliderValue] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderValue(Math.max(0, Math.min(100, percentage)));
    }
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);
  
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl cursor-ew-resize select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
    >
      <div className="relative w-full h-[600px]">
        <Image 
          src={before} 
          alt="Before" 
          fill
          className="object-cover"
        />
      </div>
      <div 
        className="absolute top-0 left-0 h-full w-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
      >
        <div className="relative w-full h-full">
          <Image 
            src={after} 
            alt="After" 
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div
        className="absolute top-0 bottom-0 bg-white w-1.5 -translate-x-1/2 pointer-events-none"
        style={{ left: `${sliderValue}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-5 bg-white rounded-full p-2 shadow-lg h-12 w-12 grid place-items-center pointer-events-none">
          <ChevronDown className="h-6 w-6 text-emerald-700 rotate-90" />
        </div>
      </div>
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold pointer-events-none">
        BEFORE
      </div>
      <div 
        className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold pointer-events-none"
        style={{ opacity: sliderValue > 60 ? 1 : 0, transition: 'opacity 0.3s' }}
      >
        AFTER
      </div>
    </div>
  );
};

export default function PortfolioEmeraldSlider({ data, siteId, isEditable = false }: PortfolioEmeraldSliderProps) {
  const defaultWork: PortfolioItem[] = [
    {
      id: 1,
      title: 'Modern Minimalist Retreat',
      before: '/placeholder.svg?text=Before:+Overgrown+Yard&width=1200&height=800',
      after: '/placeholder.svg?text=After:+Sleek+Patio&width=1200&height=800',
      description: 'Transformed an unruly backyard into a serene, modern oasis with clean lines, a new stone patio, and carefully selected plantings.'
    },
    {
      id: 2,
      title: 'Lakeside Water Feature',
      before: '/placeholder.svg?text=Before:+Empty+Slope&width=1200&height=800',
      after: '/placeholder.svg?text=After:+Waterfall+Garden&width=1200&height=800',
      description: 'An ambitious project that turned a barren slope into a breathtaking multi-tiered waterfall and pond, surrounded by lush vegetation.'
    }
  ];

  const portfolioItems = data.portfolioItems || defaultWork;
  const [activeWork, setActiveWork] = useState(portfolioItems[0]);

  return (
    <section className="py-20 md:py-32 bg-emerald-50/50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-emerald-900">
          <EditableText
            value={data.title || 'Our Work'}
            onSave={(value) => {}}
            isEditable={isEditable}
          />
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          <EditableText
            value={data.subtitle || 'Witness the transformations. We turn potential into paradise.'}
            onSave={(value) => {}}
            isEditable={isEditable}
          />
        </p>

        <div className="mt-12">
          <div className="flex justify-center space-x-4 mb-8 flex-wrap gap-2">
            {portfolioItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveWork(item)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  activeWork.id === item.id 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-emerald-100'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          <BeforeAfterSlider 
            key={activeWork.id}
            before={activeWork.before}
            after={activeWork.after}
            title={activeWork.title}
          />
          
          <p className="mt-8 text-lg text-gray-700 max-w-3xl mx-auto">
            <EditableText
              value={activeWork.description}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </p>
        </div>
      </div>
    </section>
  );
}