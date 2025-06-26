'use client';

import { HeroSection } from '@/types/site-builder';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EditableText } from '@/components/EditableText';
import { ParallaxSection } from '@/components/animations/parallax-section';
import { ParticleEffectArea } from '@/components/ui/particle-effect-area';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  section: HeroSection;
  siteData: {
    businessName: string;
    primaryColor: string;
    phone?: string | null;
  };
  onUpdate?: (fieldPath: string, value: any) => Promise<void>;
  isEditable?: boolean;
}

export function HeroModern({ section, siteData, onUpdate, isEditable = false }: HeroProps) {
  const { data } = section;
  
  // Apply different layouts based on variant
  const getLayoutClasses = () => {
    switch (data.variant) {
      case 'centered':
        return 'text-center items-center';
      case 'left-aligned':
        return 'text-left items-start';
      case 'right-aligned':
        return 'text-right items-end';
      case 'split':
        return 'text-left items-start md:w-1/2';
      default:
        return 'text-center items-center';
    }
  };

  const hasBackgroundMedia = data.backgroundImage || data.backgroundVideo;

  // For now, using placeholder images for parallax layers
  // In production, these would be dynamic based on industry/content
  const parallaxLayers = [
    { 
      src: data.backgroundImage || "/placeholder.svg?height=1200&width=1920", 
      alt: "Background Layer", 
      speed: 0.05, 
      zIndex: 0,
      className: "opacity-70"
    },
    {
      src: "/placeholder.svg?height=1000&width=1920",
      alt: "Middle Layer",
      speed: 0.1,
      zIndex: 1,
      className: "opacity-50",
    },
    {
      type: "gradient" as const,
      src: "", // Empty string to satisfy type requirement
      gradient: "bg-gradient-to-t from-background/80 via-transparent to-transparent",
      alt: "Gradient overlay",
      speed: 0,
      zIndex: 2,
    },
  ];

  // If no background image provided, use simple section
  if (!hasBackgroundMedia) {
    return (
      <section 
        className={`relative min-h-[600px] md:min-h-[700px] flex items-center`}
        style={{ background: `linear-gradient(to bottom right, var(--color-primary-light), var(--color-background))` }}
      >
        <ParticleEffectArea particleType="leaf" particleCount={20} className="opacity-30" />
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className={`flex flex-col gap-6 ${getLayoutClasses()} animate-fadeInUp animation-delay-300`}>
            {renderContent()}
          </div>
        </div>
      </section>
    );
  }

  // Premium parallax version
  return (
    <ParallaxSection
      id="hero"
      layers={parallaxLayers}
      height="h-screen md:h-[calc(100vh-5rem)]"
      containerClassName="bg-gradient-to-br"
    >
      <ParticleEffectArea particleType="seed" particleCount={25} className="opacity-60" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 animate-fadeInUp animation-delay-300">
        {renderContent()}
        <Link
          href="#services"
          aria-label="Scroll to next section"
          className="absolute bottom-10 md:bottom-16 animate-bounce"
        >
          <ArrowDown className="h-10 w-10 text-white/70 hover:text-white transition-colors" />
        </Link>
      </div>
    </ParallaxSection>
  );

  function renderContent() {
    return (
      <>
        {isEditable ? (
          <EditableText
            value={data.headline}
            onSave={async (value: string) => {
              if (onUpdate) {
                await onUpdate('headline', value);
              }
            }}
            as="h1"
            className="font-serif-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white drop-shadow-xl mb-6"
            editClassName="font-serif-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900"
            placeholder="Enter your headline"
          />
        ) : (
          <h1 className="font-serif-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white drop-shadow-xl mb-6">
            {data.headline}
          </h1>
        )}
        
        {data.subheadline && (
          isEditable ? (
            <EditableText
              value={data.subheadline}
              onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate('subheadline', value);
                }
              }}
              as="p"
              className="font-serif-body text-xl md:text-2xl text-brand-cream max-w-2xl mb-10 drop-shadow-lg"
              editClassName="font-serif-body text-xl md:text-2xl text-gray-900 max-w-2xl"
              placeholder="Enter a subheadline"
            />
          ) : (
            <p className="font-serif-body text-xl md:text-2xl max-w-2xl mb-10 drop-shadow-lg" style={{ color: 'var(--color-neutral-light)' }}>
              {data.subheadline}
            </p>
          )
        )}
        
        {data.description && (
          isEditable ? (
            <EditableText
              value={data.description}
              onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate('description', value);
                }
              }}
              as="p"
              className="text-lg md:text-xl text-white/90 max-w-3xl mb-10 drop-shadow"
              editClassName="text-lg md:text-xl text-gray-900 max-w-3xl"
              placeholder="Enter a description"
              multiline
            />
          ) : (
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mb-10 drop-shadow">
              {data.description}
            </p>
          )
        )}
        
        {/* CTA Buttons */}
        {(data.primaryButton || data.secondaryButton) && (
          <div className="flex flex-wrap gap-4 justify-center">
            {data.primaryButton && (
              <Link href={data.primaryButton.href} className="inline-block">
                <button
                  className="text-white text-lg px-10 py-7 rounded-md shadow-lg transition-all hover:scale-105 hover:brightness-90"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {data.primaryButton.text}
                </button>
              </Link>
            )}
            
            {data.secondaryButton && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20 text-lg px-10 py-7 rounded-md shadow-lg transition-transform hover:scale-105"
              >
                <Link href={data.secondaryButton.href}>
                  {data.secondaryButton.text}
                </Link>
              </Button>
            )}
          </div>
        )}
        
        {/* Quick contact for service businesses */}
        {siteData.phone && (
          <div className="mt-8">
            <a
              href={`tel:${siteData.phone}`}
              className="text-lg font-medium text-white transition-colors drop-shadow hover:opacity-90"
            >
              Call Now: {siteData.phone}
            </a>
          </div>
        )}
      </>
    );
  }
}