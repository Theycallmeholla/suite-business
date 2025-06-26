'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { EditableText } from '@/components/EditableText';
import Image from 'next/image';

interface PortfolioItem {
  id: string | number;
  title: string;
  category: string;
  description: string;
  beforeImage: string;
  afterImage: string;
}

interface PortfolioNatureSliderProps {
  data: {
    title?: string;
    subtitle?: string;
    portfolioItems?: PortfolioItem[];
  };
  siteId: string;
  isEditable?: boolean;
}

export default function PortfolioNatureSlider({ data, siteId, isEditable = false }: PortfolioNatureSliderProps) {
  const [sliderPositions, setSliderPositions] = useState<{ [key: string]: number }>({});
  
  // Default portfolio items if none provided
  const defaultItems: PortfolioItem[] = [
    {
      id: 1,
      title: 'Modern Oasis',
      category: 'Residential',
      description: 'A contemporary garden with clean lines and sustainable features',
      beforeImage: '/placeholder.svg?text=Before&width=600&height=400',
      afterImage: '/placeholder.svg?text=After&width=600&height=400'
    },
    {
      id: 2,
      title: 'English Cottage Garden',
      category: 'Residential',
      description: 'Traditional cottage garden with abundant flowers and herbs',
      beforeImage: '/placeholder.svg?text=Before&width=600&height=400',
      afterImage: '/placeholder.svg?text=After&width=600&height=400'
    },
    {
      id: 3,
      title: 'Corporate Courtyard',
      category: 'Commercial',
      description: 'Low-maintenance design for busy office environment',
      beforeImage: '/placeholder.svg?text=Before&width=600&height=400',
      afterImage: '/placeholder.svg?text=After&width=600&height=400'
    },
    {
      id: 4,
      title: 'Zen Meditation Space',
      category: 'Specialty',
      description: 'Peaceful Japanese-inspired garden for reflection',
      beforeImage: '/placeholder.svg?text=Before&width=600&height=400',
      afterImage: '/placeholder.svg?text=After&width=600&height=400'
    }
  ];

  const portfolioItems = data.portfolioItems || defaultItems;

  const handleSliderDrag = (itemId: string | number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPositions(prev => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(100, percentage))
    }));
  };

  const handleSliderTouch = (itemId: string | number, e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPositions(prev => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(100, percentage))
    }));
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <EditableText
              value={data.title || 'Our Portfolio'}
              onSave={(value) => {}}
              isEditable={isEditable}
              className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            />
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            <EditableText
              value={data.subtitle || 'Explore our recent projects and transformations'}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {portfolioItems.map((item, index) => {
            const position = sliderPositions[item.id] || 50;
            return (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Before/After Slider */}
                <div 
                  className="relative h-96 cursor-ew-resize select-none"
                  onMouseMove={(e) => handleSliderDrag(item.id, e)}
                  onTouchMove={(e) => handleSliderTouch(item.id, e)}
                >
                  {/* After Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={item.afterImage}
                      alt={`${item.title} - After`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Before Image */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${position}%` }}
                  >
                    <div className="relative h-full" style={{ width: `${100 / (position / 100)}%` }}>
                      <Image
                        src={item.beforeImage}
                        alt={`${item.title} - Before`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Slider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                    style={{ left: `${position}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                      <ChevronLeft className="h-4 w-4 text-gray-600 absolute -left-2" />
                      <ChevronRight className="h-4 w-4 text-gray-600 absolute -right-2" />
                    </div>
                  </div>
                  
                  {/* Labels */}
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    Before
                  </div>
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    After
                  </div>
                </div>
                
                {/* Project Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-semibold">
                      <EditableText
                        value={item.title}
                        onSave={(value) => {}}
                        isEditable={isEditable}
                      />
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    <EditableText
                      value={item.description}
                      onSave={(value) => {}}
                      isEditable={isEditable}
                    />
                  </p>
                  <button className="mt-4 text-primary font-semibold flex items-center group">
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}