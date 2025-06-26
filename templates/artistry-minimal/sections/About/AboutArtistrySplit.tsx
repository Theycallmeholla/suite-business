'use client';

import React from 'react';
import { EditableText } from '@/components/EditableText';
import { useTheme } from '@/contexts/ThemeContext';

interface AboutArtistrySplitProps {
  content: {
    sectionTitle?: string;
    headline?: string;
    description?: string;
    stats?: Array<{
      number: string;
      label: string;
    }>;
    image?: string;
  };
  onUpdate?: (updates: any) => void;
}

export default function AboutArtistrySplit({ content, onUpdate }: AboutArtistrySplitProps) {
  const { colors } = useTheme();
  
  const defaultContent = {
    sectionTitle: content.sectionTitle || 'About Us',
    headline: content.headline || 'Creating Beautiful Spaces Since 1985',
    description: content.description || `With over three decades of experience, we've mastered the art of transforming outdoor spaces into living works of art. Our approach combines innovative design with time-tested techniques to create landscapes that are both beautiful and sustainable.
    
We believe that every space has the potential to become something extraordinary. Our team of skilled designers and craftsmen work closely with each client to understand their vision and bring it to life with precision and care.`,
    stats: content.stats || [
      { number: '500+', label: 'Projects Completed' },
      { number: '38', label: 'Years of Excellence' },
      { number: '15', label: 'Expert Team Members' },
      { number: '100%', label: 'Client Satisfaction' }
    ],
    image: content.image || '/images/about-team.jpg'
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">
                <EditableText
                  value={defaultContent.sectionTitle}
                  onSave={async (value) => {
                if (onUpdate) {
                  await onUpdate({ sectionTitle: value });
                }
              }}
                  className="inline-block"
                />
              </p>
              <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-6">
                <EditableText
                  value={defaultContent.headline}
                  onSave={async (value) => {
                if (onUpdate) {
                  await onUpdate({ headline: value });
                }
              }}
                  className="inline-block"
                />
              </h2>
              <div className="prose prose-gray max-w-none">
                <EditableText
                  value={defaultContent.description}
                  onSave={async (value) => {
                if (onUpdate) {
                  await onUpdate({ description: value });
                }
              }}
                  multiline
                  className="text-gray-600 leading-relaxed whitespace-pre-line"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-gray-200">
              {defaultContent.stats.map((stat, index) => (
                <div key={index}>
                  <p className="text-3xl font-light text-gray-900 mb-1">
                    <EditableText
                      value={stat.number}
                      onSave={(value) => {
                        const updatedStats = [...defaultContent.stats];
                        updatedStats[index].number = value;
                        onUpdate?.({ stats: updatedStats });
                      }}
                      className="inline-block"
                    />
                  </p>
                  <p className="text-sm text-gray-500">
                    <EditableText
                      value={stat.label}
                      onSave={(value) => {
                        const updatedStats = [...defaultContent.stats];
                        updatedStats[index].label = value;
                        onUpdate?.({ stats: updatedStats });
                      }}
                      className="inline-block"
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div 
              className="aspect-[4/5] bg-gray-200"
              style={{
                backgroundImage: `url(${defaultContent.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!defaultContent.image && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <span className="text-6xl font-light">Team Photo</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}