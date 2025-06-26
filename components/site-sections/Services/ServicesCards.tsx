"use client";
import { ServicesSection } from '@/types/site-builder';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GrowingBotanical } from "@/components/ui/growing-botanical";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import { Wrench, Shield, Clock, Star, Zap, Leaf, Home, Hammer } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EditableText } from '@/components/EditableText';

interface ServicesProps {
  section: ServicesSection;
  siteData: {
    businessName: string;
    primaryColor: string;
    subdomain: string;
    services?: Array<{
      id: string;
      name: string;
      description: string | null;
      price: string | null;
    }>;
  };
  onUpdate?: (fieldPath: string, value: any) => Promise<void>;
  isEditable?: boolean;
}

// Get service icon based on service name with dynamic color
const getServiceIcon = (serviceName: string, index: number) => {
  const name = serviceName.toLowerCase();
  const iconProps = "h-10 w-10";
  const style = { color: 'var(--color-primary)' };
  
  if (name.includes('maintenance') || name.includes('repair')) {
    return <Wrench className={iconProps} style={style} />;
  }
  if (name.includes('design') || name.includes('landscap')) {
    return <Leaf className={iconProps} style={style} />;
  }
  if (name.includes('install') || name.includes('build')) {
    return <Hammer className={iconProps} style={style} />;
  }
  if (name.includes('protect') || name.includes('security')) {
    return <Shield className={iconProps} style={style} />;
  }
  if (name.includes('emergency') || name.includes('quick')) {
    return <Clock className={iconProps} style={style} />;
  }
  
  // Default icons rotation
  const icons = [
    <Leaf className={iconProps} style={style} />,
    <Home className={iconProps} style={style} />,
    <Hammer className={iconProps} style={style} />,
    <Star className={iconProps} style={style} />,
    <Shield className={iconProps} style={style} />,
    <Clock className={iconProps} style={style} />,
    <Wrench className={iconProps} style={style} />,
    <Zap className={iconProps} style={style} />,
  ];
  
  return icons[index % icons.length];
};

export function ServicesCards({ section, siteData, onUpdate, isEditable = false }: ServicesProps) {
  const { data } = section;
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });

  // Map existing services to the new card format
  const displayServices = data.services.map((service, index) => ({
    icon: getServiceIcon(service.name, index),
    title: service.name,
    description: service.description,
    image: service.image || `/placeholder.svg?height=150&width=150`,
    alt: `${service.name} illustration`,
    price: service.price,
    features: service.features,
    id: service.id,
  }));

  const getGridCols = () => {
    const count = displayServices.length;
    if (count <= 2) return 'sm:grid-cols-2';
    if (count <= 3) return 'sm:grid-cols-2 lg:grid-cols-3';
    if (count === 4) return 'sm:grid-cols-2 lg:grid-cols-4';
    return 'sm:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <section id="services" ref={sectionRef} className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-muted)' }}>
      <div className="container">
        <div
          className={cn(
            "text-center mb-12 md:mb-16 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          )}
        >
          {isEditable ? (
            <EditableText
              value={data.title}
              onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate('title', value);
                }
              }}
              as="h2"
              className="font-serif-heading text-4xl md:text-5xl font-bold mb-4 text-primary-dark"
              editClassName="font-serif-heading text-4xl md:text-5xl font-bold text-gray-900"
              placeholder="Our Services"
            />
          ) : (
            <h2 className="font-serif-heading text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>
              {data.title}
            </h2>
          )}
          {(data.subtitle || isEditable) && (
            isEditable ? (
              <EditableText
                value={data.subtitle || ''}
                onSave={async (value: string) => {
                  if (onUpdate) {
                    await onUpdate('subtitle', value);
                  }
                }}
                className="font-serif-body text-lg md:text-xl max-w-2xl mx-auto text-neutral"
                editClassName="font-serif-body text-lg md:text-xl text-gray-900 max-w-2xl mx-auto"
                placeholder="Services subtitle..."
              />
            ) : (
              <p className="font-serif-body text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--color-neutral)' }}>
                {data.subtitle}
              </p>
            )
          )}
        </div>

        {/* Grid variant with premium cards */}
        {data.variant === 'grid' && (
          <div className={`grid grid-cols-1 ${getGridCols()} gap-8`}>
            {displayServices.map((service, index) => (
              <div
                key={service.id}
                className={cn(
                  "transition-all duration-700 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                )}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Card 
                  className="h-full flex flex-col bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden group"
                  style={{ borderColor: 'var(--color-primary-light)' }}
                >
                  <CardHeader className="items-center text-center">
                    <div 
                      className="p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: 'var(--color-primary-light)', opacity: 0.3 }}
                    >
                      {service.icon}
                    </div>
                    {isEditable ? (
                      <EditableText
                        value={service.title}
                        onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${index}.name`, value);
                }
              }}
                        as="h3"
                        className="font-serif-heading text-2xl text-primary-dark"
                        editClassName="font-serif-heading text-2xl text-gray-900"
                        placeholder="Service Name"
                      />
                    ) : (
                      <CardTitle className="font-serif-heading text-2xl" style={{ color: 'var(--color-primary-dark)' }}>{service.title}</CardTitle>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col items-center text-center">
                    {isEditable ? (
                      <EditableText
                        value={service.description}
                        onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${index}.description`, value);
                }
              }}
                        className="font-serif-body mb-6 flex-grow text-neutral"
                        editClassName="font-serif-body text-gray-900"
                        placeholder="Service description..."
                        multiline
                      />
                    ) : (
                      <CardDescription className="font-serif-body mb-6 flex-grow" style={{ color: 'var(--color-neutral)' }}>
                        {service.description}
                      </CardDescription>
                    )}
                    {service.features && service.features.length > 0 && (
                      <ul className="text-sm mb-4 space-y-1 w-full text-left" style={{ color: 'var(--color-neutral)', opacity: 0.8 }}>
                        {service.features.map((feature, featureIdx) => (
                          <li key={featureIdx} className="flex items-start">
                            <span className="mr-2" style={{ color: 'var(--color-primary)' }}>✓</span>
                            {isEditable ? (
                              <EditableText
                                value={feature}
                                onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${index}.features.${featureIdx}`, value);
                }
              }}
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
                      <p className="text-lg font-semibold mb-4" style={{ color: 'var(--color-primary-dark)' }}>
                        {isEditable ? (
                          <EditableText
                            value={service.price || ''}
                            onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${index}.price`, value);
                }
              }}
                            placeholder="Price"
                            editClassName="text-lg font-semibold text-gray-900"
                          />
                        ) : (
                          service.price
                        )}
                      </p>
                    )}
                    <GrowingBotanical
                      src={service.image}
                      alt={service.alt}
                      width={100}
                      height={100}
                      className="mt-auto group-hover:scale-105 transition-transform duration-300"
                      animationDelay={`delay-${(index % 3) * 100 + 300}`}
                    />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Cards variant (larger cards) */}
        {data.variant === 'cards' && (
          <div className="grid md:grid-cols-2 gap-8">
            {displayServices.map((service, index) => (
              <div
                key={service.id}
                className={cn(
                  "transition-all duration-700 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                )}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Card 
                  className="h-full bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden group"
                  style={{ borderColor: 'var(--color-primary-light)' }}
                >
                  {service.image && service.image !== '/placeholder.svg?height=150&width=150' && (
                    <div 
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${service.image})` }}
                    />
                  )}
                  <div className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div 
                        className="p-3 rounded-full group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: 'var(--color-primary-light)', opacity: 0.3 }}
                      >
                        {service.icon}
                      </div>
                      <div className="flex-1">
                        {isEditable ? (
                          <EditableText
                            value={service.title}
                            onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${index}.name`, value);
                }
              }}
                            as="h3"
                            className="font-serif-heading text-2xl mb-2"
                            style={{ color: 'var(--color-primary-dark)' }}
                            editClassName="font-serif-heading text-2xl text-gray-900"
                            placeholder="Service Name"
                          />
                        ) : (
                          <h3 className="font-serif-heading text-2xl mb-2" style={{ color: 'var(--color-primary-dark)' }}>{service.title}</h3>
                        )}
                        {isEditable ? (
                          <EditableText
                            value={service.description}
                            onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${index}.description`, value);
                }
              }}
                            className="font-serif-body"
                            style={{ color: 'var(--color-neutral)' }}
                            editClassName="font-serif-body text-gray-900"
                            placeholder="Service description..."
                            multiline
                          />
                        ) : (
                          <p className="font-serif-body" style={{ color: 'var(--color-neutral)' }}>{service.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {service.features && service.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.features.map((feature, featureIdx) => (
                          <span 
                            key={featureIdx} 
                            className="text-sm px-3 py-1 rounded-full"
                            style={{ 
                              backgroundColor: 'var(--color-primary-light)', 
                              color: 'var(--color-primary-dark)',
                              opacity: 0.3
                            }}
                          >
                            {isEditable ? (
                              <EditableText
                                value={feature}
                                onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${index}.features.${featureIdx}`, value);
                }
              }}
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
                    
                    <div className="flex items-center justify-between mt-6">
                      {(service.price || isEditable) && (
                        <p className="text-xl font-semibold" style={{ color: 'var(--color-primary-dark)' }}>
                          {isEditable ? (
                            <EditableText
                              value={service.price || ''}
                              onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${index}.price`, value);
                }
              }}
                              placeholder="Price"
                              editClassName="text-xl font-semibold text-gray-900"
                            />
                          ) : (
                            service.price
                          )}
                        </p>
                      )}
                      <Link href="#contact" className="inline-block">
                        <button
                          className="text-white px-6 py-2 rounded-md transition-all hover:scale-105 hover:brightness-90"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          Get Started
                        </button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* List variant - simplified for brevity */}
        {data.variant === 'list' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Similar pattern with dynamic colors */}
          </div>
        )}
      </div>
    </section>
  );
}