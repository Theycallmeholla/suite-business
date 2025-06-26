'use client';

import React from 'react';
import { EditableText } from '@/components/EditableText';
import { useTheme } from '@/contexts/ThemeContext';

interface Service {
  title: string;
  description: string;
  image?: string;
}

interface ServicesArtistryGridProps {
  content: {
    sectionTitle?: string;
    services?: Service[];
  };
  onUpdate?: (updates: any) => void;
}

export default function ServicesArtistryGrid({ content, onUpdate }: ServicesArtistryGridProps) {
  const { colors } = useTheme();
  
  const defaultServices: Service[] = content.services || [
    {
      title: 'Landscape Design',
      description: 'Custom designs that blend aesthetics with functionality, creating outdoor spaces that inspire.',
      image: '/images/service-design.jpg'
    },
    {
      title: 'Garden Installation',
      description: 'Expert installation of plants, hardscapes, and features that bring your vision to life.',
      image: '/images/service-installation.jpg'
    },
    {
      title: 'Maintenance & Care',
      description: 'Ongoing care to ensure your landscape remains beautiful throughout the seasons.',
      image: '/images/service-maintenance.jpg'
    }
  ];

  const sectionTitle = content.sectionTitle || 'Our Services';

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
          <div className="w-20 h-0.5 bg-gray-900 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {defaultServices.map((service, index) => (
            <div key={index} className="group">
              <div className="relative overflow-hidden mb-6">
                <div 
                  className="aspect-[4/3] bg-gray-200"
                  style={{
                    backgroundImage: service.image ? `url(${service.image})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!service.image && (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <span className="text-6xl font-light">{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              </div>
              
              <h3 className="text-2xl font-serif font-light text-gray-900 mb-3">
                <EditableText
                  value={service.title}
                  onSave={(value) => {
                    const updatedServices = [...defaultServices];
                    updatedServices[index].title = value;
                    onUpdate?.({ services: updatedServices });
                  }}
                  className="inline-block"
                />
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                <EditableText
                  value={service.description}
                  onSave={(value) => {
                    const updatedServices = [...defaultServices];
                    updatedServices[index].description = value;
                    onUpdate?.({ services: updatedServices });
                  }}
                  multiline
                  className="inline-block"
                />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}