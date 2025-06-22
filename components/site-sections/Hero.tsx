'use client';

import { HeroSection } from '@/types/site-builder';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EditableText } from '@/components/EditableText';

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

export function Hero({ section, siteData, onUpdate, isEditable = false }: HeroProps) {
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

  return (
    <section 
      className={`relative min-h-[600px] md:min-h-[700px] flex items-center ${
        hasBackgroundMedia ? 'text-white' : ''
      }`}
      style={{
        backgroundColor: hasBackgroundMedia ? '#000' : `${siteData.primaryColor}10`,
      }}
    >
      {/* Background Image/Video */}
      {data.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${data.backgroundImage})`,
            filter: 'brightness(0.4)'
          }}
        />
      )}
      
      {data.backgroundVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.4)' }}
        >
          <source src={data.backgroundVideo} type="video/mp4" />
        </video>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className={`flex flex-col gap-6 ${getLayoutClasses()}`}>
          {isEditable ? (
            <EditableText
              value={data.headline}
              onSave={(value: string) => onUpdate?.('headline', value)}
              as="h1"
              className="text-4xl md:text-6xl font-bold leading-tight"
              editClassName="text-4xl md:text-6xl font-bold text-gray-900"
              placeholder="Enter your headline"
            />
          ) : (
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {data.headline}
            </h1>
          )}
          
          {data.subheadline && (
            isEditable ? (
              <EditableText
                value={data.subheadline}
                onSave={(value: string) => onUpdate?.('subheadline', value)}
                as="p"
                className="text-xl md:text-2xl opacity-90"
                editClassName="text-xl md:text-2xl text-gray-900"
                placeholder="Enter a subheadline"
              />
            ) : (
              <p className="text-xl md:text-2xl opacity-90">
                {data.subheadline}
              </p>
            )
          )}
          
          {data.description && (
            isEditable ? (
              <EditableText
                value={data.description}
                onSave={(value: string) => onUpdate?.('description', value)}
                as="p"
                className="text-lg md:text-xl opacity-80 max-w-2xl"
                editClassName="text-lg md:text-xl text-gray-900 max-w-2xl"
                placeholder="Enter a description"
                multiline
              />
            ) : (
              <p className="text-lg md:text-xl opacity-80 max-w-2xl">
                {data.description}
              </p>
            )
          )}
          
          {/* CTA Buttons */}
          {(data.primaryButton || data.secondaryButton) && (
            <div className="flex flex-wrap gap-4 mt-4">
              {data.primaryButton && (
                <Button
                  asChild
                  size="lg"
                  style={{ backgroundColor: siteData.primaryColor }}
                  className="hover:opacity-90"
                >
                  <Link href={data.primaryButton.href}>
                    {data.primaryButton.text}
                  </Link>
                </Button>
              )}
              
              {data.secondaryButton && (
                <Button
                  asChild
                  size="lg"
                  variant={hasBackgroundMedia ? "secondary" : "outline"}
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
            <div className="mt-4">
              <a
                href={`tel:${siteData.phone}`}
                className={`text-lg font-medium ${
                  hasBackgroundMedia ? 'text-white' : 'text-gray-700'
                } hover:underline`}
              >
                Call Now: {siteData.phone}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}