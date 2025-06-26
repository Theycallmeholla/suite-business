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

// Get service icon based on service name
const getServiceIcon = (serviceName: string, index: number) => {
  const name = serviceName.toLowerCase();
  const icons = [
    <Leaf className="h-10 w-10 text-brand-green" />,
    <Home className="h-10 w-10 text-brand-green" />,
    <Hammer className="h-10 w-10 text-brand-green" />,
    <Star className="h-10 w-10 text-brand-green" />,
    <Shield className="h-10 w-10 text-brand-green" />,
    <Clock className="h-10 w-10 text-brand-green" />,
    <Wrench className="h-10 w-10 text-brand-green" />,
    <Zap className="h-10 w-10 text-brand-green" />,
  ];
  
  if (name.includes('maintenance') || name.includes('repair')) {
    return <Wrench className="h-10 w-10 text-brand-green" />;
  }
  if (name.includes('design') || name.includes('landscap')) {
    return <Leaf className="h-10 w-10 text-brand-green" />;
  }
  if (name.includes('install') || name.includes('build')) {
    return <Hammer className="h-10 w-10 text-brand-green" />;
  }
  if (name.includes('protect') || name.includes('security')) {
    return <Shield className="h-10 w-10 text-brand-green" />;
  }
  if (name.includes('emergency') || name.includes('quick')) {
    return <Clock className="h-10 w-10 text-brand-green" />;
  }
  
  // Return a different icon based on index
  return icons[index % icons.length];
};

export function Services({ section, siteData, onUpdate, isEditable = false }: ServicesProps) {
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
    <section id="services" ref={sectionRef} className="py-16 md:py-24 bg-brand-cream">
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
              className="font-serif-heading text-4xl md:text-5xl font-bold text-brand-green-dark mb-4"
              editClassName="font-serif-heading text-4xl md:text-5xl font-bold text-gray-900"
              placeholder="Our Services"
            />
          ) : (
            <h2 className="font-serif-heading text-4xl md:text-5xl font-bold text-brand-green-dark mb-4">
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
                className="font-serif-body text-lg md:text-xl text-brand-brown max-w-2xl mx-auto"
                editClassName="font-serif-body text-lg md:text-xl text-gray-900 max-w-2xl mx-auto"
                placeholder="Services subtitle..."
              />
            ) : (
              <p className="font-serif-body text-lg md:text-xl text-brand-brown max-w-2xl mx-auto">
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
                <Card className="h-full flex flex-col bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-shadow duration-300 border-brand-green-light overflow-hidden group">
                  <CardHeader className="items-center text-center">
                    <div className="p-4 bg-brand-green-light/30 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
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
                        className="font-serif-heading text-2xl text-brand-green-dark"
                        editClassName="font-serif-heading text-2xl text-gray-900"
                        placeholder="Service Name"
                      />
                    ) : (
                      <CardTitle className="font-serif-heading text-2xl text-brand-green-dark">{service.title}</CardTitle>
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
                        className="font-serif-body text-brand-brown mb-6 flex-grow"
                        editClassName="font-serif-body text-gray-900"
                        placeholder="Service description..."
                        multiline
                      />
                    ) : (
                      <CardDescription className="font-serif-body text-brand-brown mb-6 flex-grow">
                        {service.description}
                      </CardDescription>
                    )}
                    {service.features && service.features.length > 0 && (
                      <ul className="text-sm text-brand-brown/80 mb-4 space-y-1 w-full text-left">
                        {service.features.map((feature, featureIdx) => (
                          <li key={featureIdx} className="flex items-start">
                            <span className="text-brand-green mr-2">✓</span>
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
                      <p className="text-lg font-semibold text-brand-green-dark mb-4">
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
                <Card className="h-full bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-shadow duration-300 border-brand-green-light overflow-hidden group">
                  {service.image && service.image !== '/placeholder.svg?height=150&width=150' && (
                    <div 
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${service.image})` }}
                    />
                  )}
                  <div className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 bg-brand-green-light/30 rounded-full group-hover:scale-110 transition-transform duration-300">
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
                            className="font-serif-heading text-2xl text-brand-green-dark mb-2"
                            editClassName="font-serif-heading text-2xl text-gray-900"
                            placeholder="Service Name"
                          />
                        ) : (
                          <h3 className="font-serif-heading text-2xl text-brand-green-dark mb-2">{service.title}</h3>
                        )}
                        {isEditable ? (
                          <EditableText
                            value={service.description}
                            onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${index}.description`, value);
                }
              }}
                            className="font-serif-body text-brand-brown"
                            editClassName="font-serif-body text-gray-900"
                            placeholder="Service description..."
                            multiline
                          />
                        ) : (
                          <p className="font-serif-body text-brand-brown">{service.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {service.features && service.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.features.map((feature, featureIdx) => (
                          <span key={featureIdx} className="text-sm bg-brand-green-light/30 text-brand-green-dark px-3 py-1 rounded-full">
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
                        <p className="text-xl font-semibold text-brand-green-dark">
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
                      <Button
                        className="bg-brand-green hover:bg-brand-green-dark text-white transition-transform hover:scale-105"
                        asChild
                      >
                        <Link href="#contact">
                          Get Started
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* List variant with premium styling */}
        {data.variant === 'list' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {displayServices.map((service, index) => (
              <div
                key={service.id}
                className={cn(
                  "transition-all duration-700 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                )}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-brand-green-light overflow-hidden">
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-brand-green-light/30 rounded-full">
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
                              className="font-serif-heading text-2xl text-brand-green-dark mb-3"
                              editClassName="font-serif-heading text-2xl text-gray-900"
                              placeholder="Service Name"
                            />
                          ) : (
                            <h3 className="font-serif-heading text-2xl text-brand-green-dark mb-3">{service.title}</h3>
                          )}
                          {isEditable ? (
                            <EditableText
                              value={service.description}
                              onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${index}.description`, value);
                }
              }}
                              className="font-serif-body text-brand-brown mb-4"
                              editClassName="font-serif-body text-gray-900"
                              placeholder="Service description..."
                              multiline
                            />
                          ) : (
                            <p className="font-serif-body text-brand-brown mb-4">{service.description}</p>
                          )}
                          {service.features && service.features.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {service.features.map((feature, featureIdx) => (
                                <span key={featureIdx} className="text-sm text-brand-green-dark">
                                  <span className="text-brand-green mr-1">✓</span>
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
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        {(service.price || isEditable) && (
                          <p className="text-2xl font-semibold text-brand-green-dark mb-4">
                            {isEditable ? (
                              <EditableText
                                value={service.price || ''}
                                onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${index}.price`, value);
                }
              }}
                                placeholder="Price"
                                editClassName="text-2xl font-semibold text-gray-900"
                              />
                            ) : (
                              service.price
                            )}
                          </p>
                        )}
                        <Button
                          className="bg-brand-green hover:bg-brand-green-dark text-white transition-transform hover:scale-105"
                          asChild
                        >
                          <Link href="#contact">
                            Learn More
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Carousel variant - keep existing with enhanced styling */}
        {data.variant === 'carousel' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
              {displayServices.map((service, index) => (
                <div key={service.id} className="w-80 flex-shrink-0">
                  <div
                    className={cn(
                      "transition-all duration-700 ease-out h-full",
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                    )}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <Card className="h-full flex flex-col bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-shadow duration-300 border-brand-green-light overflow-hidden group">
                      <CardHeader className="items-center text-center">
                        <div className="p-4 bg-brand-green-light/30 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
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
                            className="font-serif-heading text-2xl text-brand-green-dark"
                            editClassName="font-serif-heading text-2xl text-gray-900"
                            placeholder="Service Name"
                          />
                        ) : (
                          <CardTitle className="font-serif-heading text-2xl text-brand-green-dark">{service.title}</CardTitle>
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
                            className="font-serif-body text-brand-brown mb-6 flex-grow"
                            editClassName="font-serif-body text-gray-900"
                            placeholder="Service description..."
                            multiline
                          />
                        ) : (
                          <CardDescription className="font-serif-body text-brand-brown mb-6 flex-grow">
                            {service.description}
                          </CardDescription>
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}