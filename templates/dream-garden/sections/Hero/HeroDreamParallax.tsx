'use client';

import { HeroSection } from '@/types/site-builder';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EditableText } from '@/components/EditableText';
import { ParallaxSection } from '@/components/animations/parallax-section';
import { ArrowDown, Sparkles, Leaf, Sprout } from 'lucide-react';

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

// Floating particle component
const FloatingParticle = ({
  icon: Icon,
  initialX,
  initialY,
  delay,
  duration,
}: { 
  icon: React.ElementType; 
  initialX: string; 
  initialY: string; 
  delay: string; 
  duration: string 
}) => (
  <Icon
    className="absolute pointer-events-none"
    style={{
      left: initialX,
      top: initialY,
      width: Math.random() * 15 + 10,
      height: Math.random() * 15 + 10,
      animation: `float ${duration} ease-in-out infinite ${delay}`,
      opacity: 0.3,
      color: 'var(--color-primary-light)'
    }}
  />
);

export function HeroDreamParallax({ section, siteData, onUpdate, isEditable = false }: HeroProps) {
  const { data } = section;
  
  const parallaxLayers = [
    { 
      src: data.backgroundImage || "/placeholder.svg?height=1200&width=1920", 
      alt: "Garden landscape background", 
      speed: 0.3,
      zIndex: 0,
      className: "brightness-90"
    }
  ];

  const particles = [
    { icon: Leaf, x: "10%", y: "20%", delay: "0s", duration: "5s" },
    { icon: Sparkles, x: "80%", y: "30%", delay: "1s", duration: "7s" },
    { icon: Sprout, x: "50%", y: "70%", delay: "0.5s", duration: "6s" },
    { icon: Leaf, x: "25%", y: "85%", delay: "1.5s", duration: "5.5s" },
    { icon: Sparkles, x: "70%", y: "10%", delay: "0.2s", duration: "6.5s" },
  ];

  return (
    <ParallaxSection
      id="hero"
      layers={parallaxLayers}
      height="h-screen"
      containerClassName="flex items-center justify-center text-center"
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {particles.map((p, i) => (
          <FloatingParticle
            key={i}
            icon={p.icon}
            initialX={p.x}
            initialY={p.y}
            delay={p.delay}
            duration={p.duration}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-4 md:p-8 animate-grow-in" style={{ animationDelay: "0.2s" }}>
        {/* Award badge */}
        <div
          className="inline-block bg-primary-light/20 text-primary-dark px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-float"
          style={{ animationDelay: "0.4s" }}
        >
          <Sparkles className="inline-block mr-2 h-4 w-4" />
          Award-Winning Landscape Design
        </div>
        
        {/* Main headline */}
        {isEditable ? (
          <EditableText
            value={data.headline}
            onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate('headline', value);
                }
              }}
            as="h1"
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white shadow-xl mb-6"
            editClassName="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900"
            placeholder="Your Dream Garden Awaits"
          />
        ) : (
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white shadow-xl mb-6">
            {data.headline.split(' ').map((word, i) => {
              // Highlight specific words with accent color
              if (word.toLowerCase().includes('dream') || word.toLowerCase().includes('perfect')) {
                return <span key={i} className="text-primary-light"> {word}</span>;
              }
              return <span key={i}> {word}</span>;
            })}
          </h1>
        )}
        
        {/* Subtitle */}
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
              className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-white/90 leading-relaxed"
              editClassName="text-lg md:text-xl text-gray-900 max-w-3xl"
              placeholder="Transforming outdoor spaces into living works of art"
            />
          ) : (
            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-white/90 leading-relaxed">
              {data.subheadline}
            </p>
          )
        )}
        
        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {data.primaryButton && (
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-6 rounded-lg shadow-lg transition-transform hover:scale-105"
            >
              <Link href={data.primaryButton.href}>
                {data.primaryButton.text}
              </Link>
            </Button>
          )}
          
          {data.secondaryButton && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent hover:bg-white/10 border-white text-white text-lg px-8 py-6 rounded-lg shadow-lg transition-transform hover:scale-105"
            >
              <Link href={data.secondaryButton.href}>
                {data.secondaryButton.text}
                <ArrowDown className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </ParallaxSection>
  );
}