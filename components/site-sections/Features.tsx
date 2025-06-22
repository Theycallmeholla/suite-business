import { FeaturesSection } from '@/types/site-builder';
import { Card } from '@/components/ui/card';

interface FeaturesProps {
  section: FeaturesSection;
  siteData: {
    businessName: string;
    primaryColor: string;
  };
}

export function Features({ section, siteData }: FeaturesProps) {
  const { data } = section;

  const renderFeature = (feature: typeof data.features[0], index: number) => {
    if (data.variant === 'grid') {
      return (
        <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
          {feature.icon && (
            <div 
              className="text-4xl mb-4 flex justify-center"
              style={{ color: siteData.primaryColor }}
            >
              {feature.icon}
            </div>
          )}
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
        </Card>
      );
    }

    if (data.variant === 'alternating') {
      const isEven = index % 2 === 0;
      return (
        <div key={index} className={`flex flex-col md:flex-row gap-8 items-center ${isEven ? '' : 'md:flex-row-reverse'}`}>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-lg text-gray-600">{feature.description}</p>
          </div>
          {feature.icon && (
            <div 
              className="text-6xl flex-shrink-0"
              style={{ color: siteData.primaryColor }}
            >
              {feature.icon}
            </div>
          )}
        </div>
      );
    }

    // Centered variant
    return (
      <div key={index} className="text-center max-w-md mx-auto">
        {feature.icon && (
          <div 
            className="text-5xl mb-4"
            style={{ color: siteData.primaryColor }}
          >
            {feature.icon}
          </div>
        )}
        <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
        <p className="text-gray-600">{feature.description}</p>
      </div>
    );
  };

  return (
    <section className="py-16 md:py-24" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{data.title}</h2>
          {data.subtitle && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        {data.variant === 'grid' && (
          <div className={`grid md:grid-cols-2 lg:grid-cols-${Math.min(data.features.length, 3)} gap-6`}>
            {data.features.map(renderFeature)}
          </div>
        )}

        {data.variant === 'alternating' && (
          <div className="space-y-16 max-w-5xl mx-auto">
            {data.features.map(renderFeature)}
          </div>
        )}

        {data.variant === 'centered' && (
          <div className="space-y-12">
            {data.features.map(renderFeature)}
          </div>
        )}
      </div>
    </section>
  );
}
