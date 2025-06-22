import { CTASection } from '@/types/site-builder';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CTAProps {
  section: CTASection;
  siteData: {
    businessName: string;
    primaryColor: string;
    phone?: string | null;
  };
}

export function CTA({ section, siteData }: CTAProps) {
  const { data } = section;
  
  const getBackgroundStyle = () => {
    switch (data.variant) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${siteData.primaryColor} 0%, ${siteData.primaryColor}dd 100%)`
        };
      case 'image-bg':
        return data.backgroundImage
          ? {
              backgroundImage: `url(${data.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative' as const
            }
          : { backgroundColor: siteData.primaryColor };
      case 'simple':
      default:
        return { backgroundColor: siteData.primaryColor };
    }
  };

  return (
    <section 
      className="py-16 md:py-20 text-white"
      style={getBackgroundStyle()}
    >
      {/* Overlay for image background */}
      {data.variant === 'image-bg' && data.backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      )}
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {data.headline}
        </h2>
        
        {data.description && (
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {data.description}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            variant="secondary"
            className="font-semibold"
            asChild
          >
            <Link href={data.buttonHref}>
              {data.buttonText}
            </Link>
          </Button>
          
          {siteData.phone && (
            <div className="text-lg">
              or call{' '}
              <a href={`tel:${siteData.phone}`} className="font-bold underline">
                {siteData.phone}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
