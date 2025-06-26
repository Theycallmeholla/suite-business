'use client';

import React from 'react';
import { EditableText } from '@/components/EditableText';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface HeroArtistryMinimalProps {
  content: {
    headline?: string;
    subheadline?: string;
    ctaPrimary?: {
      text: string;
      href: string;
    };
    ctaSecondary?: {
      text: string;
      href: string;
    };
    backgroundImage?: string;
  };
  onUpdate?: (updates: any) => void;
}

export default function HeroArtistryMinimal({ content, onUpdate }: HeroArtistryMinimalProps) {
  const { colors } = useTheme();
  
  const defaultContent = {
    headline: content.headline || 'Artistry in Every Detail',
    subheadline: content.subheadline || 'Transforming outdoor spaces into living masterpieces',
    ctaPrimary: content.ctaPrimary || { text: 'View Our Work', href: '#portfolio' },
    ctaSecondary: content.ctaSecondary || { text: 'Get Started', href: '#contact' },
    backgroundImage: content.backgroundImage || '/images/hero-bg.jpg'
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${defaultContent.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Minimal overlay */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-white leading-tight">
            <EditableText
              value={defaultContent.headline}
              onSave={async (value) => {
                if (onUpdate) {
                  await onUpdate({ headline: value });
                }
              }}
              className="inline-block"
            />
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto">
            <EditableText
              value={defaultContent.subheadline}
              onSave={async (value) => {
                if (onUpdate) {
                  await onUpdate({ subheadline: value });
                }
              }}
              className="inline-block"
            />
          </p>
          
          {/* Dual CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href={defaultContent.ctaPrimary.href}
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium tracking-wider uppercase bg-white text-black hover:bg-gray-100 transition-colors duration-200"
            >
              {defaultContent.ctaPrimary.text}
            </Link>
            
            <Link
              href={defaultContent.ctaSecondary.href}
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium tracking-wider uppercase border border-white text-white hover:bg-white hover:text-black transition-colors duration-200"
            >
              {defaultContent.ctaSecondary.text}
            </Link>
          </div>
        </div>
      </div>
      
      {/* Minimal scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full p-1">
          <div className="w-1 h-3 bg-white/50 rounded-full animate-bounce mx-auto" />
        </div>
      </div>
    </section>
  );
}