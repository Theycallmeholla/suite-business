'use client';

import React, { useState } from 'react';
import { EditableText } from '@/components/EditableText';
import { useTheme } from '@/contexts/ThemeContext';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
}

interface PortfolioArtistryMasonryProps {
  content: {
    sectionTitle?: string;
    portfolio?: PortfolioItem[];
  };
  onUpdate?: (updates: any) => void;
}

export default function PortfolioArtistryMasonry({ content, onUpdate }: PortfolioArtistryMasonryProps) {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const defaultPortfolio: PortfolioItem[] = content.portfolio || [
    { id: '1', title: 'Modern Garden Retreat', category: 'residential', image: '/images/portfolio-1.jpg' },
    { id: '2', title: 'Corporate Landscape', category: 'commercial', image: '/images/portfolio-2.jpg' },
    { id: '3', title: 'Zen Garden Design', category: 'residential', image: '/images/portfolio-3.jpg' },
    { id: '4', title: 'Urban Oasis', category: 'residential', image: '/images/portfolio-4.jpg' },
    { id: '5', title: 'Sustainable Landscape', category: 'commercial', image: '/images/portfolio-5.jpg' },
    { id: '6', title: 'Classic Estate', category: 'residential', image: '/images/portfolio-6.jpg' }
  ];

  const categories = ['all', ...Array.from(new Set(defaultPortfolio.map(item => item.category)))];
  const filteredPortfolio = selectedCategory === 'all' 
    ? defaultPortfolio 
    : defaultPortfolio.filter(item => item.category === selectedCategory);

  const sectionTitle = content.sectionTitle || 'Our Work';

  return (
    <section className="py-24 bg-gray-50">
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
          <div className="w-20 h-0.5 bg-gray-900 mx-auto mb-8" />
          
          {/* Filter buttons */}
          <div className="flex justify-center gap-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-sm uppercase tracking-wider transition-colors duration-200 ${
                  selectedCategory === category 
                    ? 'text-gray-900 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {filteredPortfolio.map((item, index) => (
            <div 
              key={item.id} 
              className="break-inside-avoid group cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <div 
                  className={`bg-gray-200 ${
                    index % 3 === 0 ? 'aspect-square' : index % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[4/3]'
                  }`}
                  style={{
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!item.image && (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <span className="text-4xl font-light">{index + 1}</span>
                    </div>
                  )}
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-light mb-2">{item.title}</h3>
                    <p className="text-sm uppercase tracking-wider opacity-80">{item.category}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}