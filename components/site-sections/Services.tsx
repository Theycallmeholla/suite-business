'use client';

import { ServicesSection } from '@/types/site-builder';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EditableText } from '@/components/EditableText';

interface ServicesProps {
  section: ServicesSection;
  siteData: {
    businessName: string;
    primaryColor: string;
    subdomain: string;
  };
  onUpdate?: (fieldPath: string, value: any) => Promise<void>;
  isEditable?: boolean;
}

export function Services({ section, siteData, onUpdate, isEditable = false }: ServicesProps) {
  const { data } = section;
  
  const getGridCols = () => {
    const count = data.services.length;
    if (count <= 2) return 'md:grid-cols-2';
    if (count <= 3) return 'md:grid-cols-3';
    if (count <= 4) return 'md:grid-cols-2 lg:grid-cols-4';
    return 'md:grid-cols-2 lg:grid-cols-3';
  };

  const renderServiceCard = (service: typeof data.services[0], idx: number) => (
    <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      {service.image && (
        <div 
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${service.image})` }}
        />
      )}
      <div className="p-6">
        {isEditable && EditableText ? (
          <EditableText
            value={service.name}
            onSave={(value: string) => onUpdate?.(`services.${idx}.name`, value)}
            as="h3"
            className="text-xl font-semibold mb-2"
            editClassName="text-xl font-semibold text-gray-900"
            placeholder="Service Name"
          />
        ) : (
          <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
        )}
        
        {isEditable && EditableText ? (
          <EditableText
            value={service.description}
            onSave={(value: string) => onUpdate?.(`services.${idx}.description`, value)}
            className="text-gray-600 mb-4"
            editClassName="text-gray-900"
            placeholder="Service description..."
            multiline
          />
        ) : (
          <p className="text-gray-600 mb-4">{service.description}</p>
        )}
        
        {service.features && service.features.length > 0 && (
          <ul className="text-sm text-gray-600 mb-4 space-y-1">
            {service.features.map((feature, featureIdx) => (
              <li key={featureIdx} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {isEditable ? (
                  <EditableText
                    value={feature}
                    onSave={(value: string) => onUpdate?.(`services.${idx}.features.${featureIdx}`, value)}
                    placeholder="Feature"
                    editClassName="text-gray-900"
                  />
                ) : (
                  feature
                )}
              </li>
            ))}
          </ul>
        )}
        
        {(service.price || isEditable) && (
          <p className="text-lg font-semibold mb-4" style={{ color: siteData.primaryColor }}>
            {isEditable ? (
              <EditableText
                value={service.price || ''}
                onSave={(value: string) => onUpdate?.(`services.${idx}.price`, value)}
                placeholder="Price"
                editClassName="text-lg font-semibold text-gray-900"
              />
            ) : (
              service.price
            )}
          </p>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          style={{ borderColor: siteData.primaryColor, color: siteData.primaryColor }}
          className="hover:bg-opacity-10"
          asChild
        >
          <Link href={`tel:${siteData.subdomain}`}>
            Get Quote
          </Link>
        </Button>
      </div>
    </Card>
  );

  const renderServiceList = (service: typeof data.services[0], idx: number) => (
    <div key={service.id} className="border-b last:border-0 pb-6 last:pb-0">
      <div className="flex flex-col md:flex-row gap-6">
        {service.image && (
          <div 
            className="w-full md:w-48 h-32 md:h-32 bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url(${service.image})` }}
          />
        )}
        <div className="flex-1">
          {isEditable ? (
            <EditableText
              value={service.name}
              onSave={(value: string) => onUpdate?.(`services.${idx}.name`, value)}
              as="h3"
              className="text-2xl font-semibold mb-2"
              editClassName="text-2xl font-semibold text-gray-900"
              placeholder="Service Name"
            />
          ) : (
            <h3 className="text-2xl font-semibold mb-2">{service.name}</h3>
          )}
          
          {isEditable ? (
            <EditableText
              value={service.description}
              onSave={(value: string) => onUpdate?.(`services.${idx}.description`, value)}
              className="text-gray-600 mb-3"
              editClassName="text-gray-900"
              placeholder="Service description..."
              multiline
            />
          ) : (
            <p className="text-gray-600 mb-3">{service.description}</p>
          )}
          
          {service.features && service.features.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {service.features.map((feature, featureIdx) => (
                <span key={featureIdx} className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  {isEditable ? (
                    <EditableText
                      value={feature}
                      onSave={(value: string) => onUpdate?.(`services.${idx}.features.${featureIdx}`, value)}
                      placeholder="Feature"
                      editClassName="text-gray-900"
                    />
                  ) : (
                    feature
                  )}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            {(service.price || isEditable) && (
              <p className="text-xl font-semibold" style={{ color: siteData.primaryColor }}>
                {isEditable ? (
                  <EditableText
                    value={service.price || ''}
                    onSave={(value: string) => onUpdate?.(`services.${idx}.price`, value)}
                    placeholder="Price"
                    editClassName="text-xl font-semibold text-gray-900"
                  />
                ) : (
                  service.price
                )}
              </p>
            )}
            <Button 
              variant="default" 
              size="sm"
              style={{ backgroundColor: siteData.primaryColor }}
              asChild
            >
              <Link href={`#contact`}>
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 md:py-24" id="services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {isEditable ? (
            <EditableText
              value={data.title}
              onSave={(value: string) => onUpdate?.('title', value)}
              as="h2"
              className="text-3xl md:text-4xl font-bold mb-4"
              editClassName="text-3xl md:text-4xl font-bold text-gray-900"
              placeholder="Our Services"
            />
          ) : (
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{data.title}</h2>
          )}
          {(data.subtitle || isEditable) && (
            isEditable && EditableText ? (
              <EditableText
                value={data.subtitle || ''}
                onSave={(value: string) => onUpdate?.('subtitle', value)}
                className="text-xl text-gray-600 max-w-2xl mx-auto"
                editClassName="text-xl text-gray-900 max-w-2xl mx-auto"
                placeholder="Services subtitle..."
              />
            ) : (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {data.subtitle}
              </p>
            )
          )}
        </div>

        {/* Grid variant */}
        {data.variant === 'grid' && (
          <div className={`grid gap-6 ${getGridCols()}`}>
            {data.services.map((service, idx) => renderServiceCard(service, idx))}
          </div>
        )}

        {/* Cards variant (larger cards) */}
        {data.variant === 'cards' && (
          <div className="grid md:grid-cols-2 gap-8">
            {data.services.map((service, idx) => renderServiceCard(service, idx))}
          </div>
        )}

        {/* List variant */}
        {data.variant === 'list' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {data.services.map((service, idx) => renderServiceList(service, idx))}
          </div>
        )}

        {/* Carousel variant - simplified for now */}
        {data.variant === 'carousel' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
              {data.services.map((service, idx) => (
                <div key={service.id} className="w-80 flex-shrink-0">
                  {renderServiceCard(service, idx)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}