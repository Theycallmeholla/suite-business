'use client';

import { ServicesSection } from '@/types/site-builder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import { Paintbrush, Wrench, Scissors, Hammer, TreeDeciduous, Droplets, Flower, Mountain } from "lucide-react";
import Image from "next/image";
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

// Get landscaping-specific icons
const getLandscapeIcon = (serviceName: string, index: number) => {
  const name = serviceName.toLowerCase();
  const iconClass = "h-10 w-10";
  const iconStyle = { color: 'var(--color-primary-light)' };
  
  // Specific landscaping services
  if (name.includes('design') || name.includes('planning')) {
    return <Paintbrush className={iconClass} style={iconStyle} />;
  }
  if (name.includes('installation') || name.includes('build')) {
    return <Wrench className={iconClass} style={iconStyle} />;
  }
  if (name.includes('maintenance') || name.includes('care') || name.includes('pruning')) {
    return <Scissors className={iconClass} style={iconStyle} />;
  }
  if (name.includes('hardscape') || name.includes('patio') || name.includes('wall')) {
    return <Hammer className={iconClass} style={iconStyle} />;
  }
  if (name.includes('tree') || name.includes('arborist')) {
    return <TreeDeciduous className={iconClass} style={iconStyle} />;
  }
  if (name.includes('irrigation') || name.includes('water')) {
    return <Droplets className={iconClass} style={iconStyle} />;
  }
  if (name.includes('flower') || name.includes('garden')) {
    return <Flower className={iconClass} style={iconStyle} />;
  }
  if (name.includes('landscape') || name.includes('lawn')) {
    return <Mountain className={iconClass} style={iconStyle} />;
  }
  
  // Default rotation for generic services
  const icons = [Paintbrush, Wrench, Scissors, Hammer];
  const Icon = icons[index % icons.length];
  return <Icon className={iconClass} style={iconStyle} />;
};

export function ServicesDreamCards({ section, siteData, onUpdate, isEditable = false }: ServicesProps) {
  const { data } = section;
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });

  const displayServices = data.services.map((service, index) => ({
    icon: getLandscapeIcon(service.name, index),
    title: service.name,
    description: service.description,
    image: service.image || `/placeholder.svg?height=300&width=400&text=${encodeURIComponent(service.name)}`,
    delay: `${(index + 1) * 0.1}s`,
    id: service.id,
  }));

  return (
    <section ref={sectionRef} id="services" className="py-16 md:py-24 bg-neutral-light">
      <div className="container mx-auto px-4 md:px-6">
        <div className={cn(
          "text-center mb-12 md:mb-16 transition-all duration-1000 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          {isEditable ? (
            <EditableText
              value={data.title}
              onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate('title', value);
                }
              }}
              as="h2"
              className="text-4xl md:text-5xl font-bold text-primary-dark mb-4"
              editClassName="text-4xl md:text-5xl font-bold text-gray-900"
              placeholder="Our Expertise"
            />
          ) : (
            <h2 className="text-4xl md:text-5xl font-bold text-primary-dark mb-4">{data.title}</h2>
          )}
          {isEditable ? (
            <EditableText
              value={data.subtitle || "From initial concept to final bloom, we offer a comprehensive suite of services"}
              onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate('subtitle', value);
                }
              }}
              as="p"
              className="text-lg md:text-xl text-secondary max-w-2xl mx-auto"
              editClassName="text-lg md:text-xl text-gray-700 max-w-2xl"
              placeholder="Describe your services..."
            />
          ) : (
            <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto">
              {data.subtitle || "From initial concept to final bloom, we offer a comprehensive suite of services"}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayServices.map((service) => (
            <div 
              key={service.id} 
              className={cn(
                "animate-grow-in transition-all duration-700 ease-out",
                isVisible ? "opacity-100" : "opacity-0"
              )}
              style={{ animationDelay: service.delay }}
            >
              <Card className="h-full overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border-primary/20 bg-white group">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      {service.icon}
                      {isEditable ? (
                        <EditableText
                          value={service.title}
                          onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${service.id}.name`, value);
                }
              }}
                          as="h3"
                          className="text-2xl font-semibold text-white mt-2"
                          editClassName="text-2xl font-semibold text-gray-900"
                        />
                      ) : (
                        <CardTitle className="text-2xl font-semibold text-white mt-2">{service.title}</CardTitle>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {isEditable ? (
                    <EditableText
                      value={service.description || ""}
                      onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate(`services.${service.id}.description`, value);
                }
              }}
                      className="text-secondary text-base leading-relaxed"
                      editClassName="text-gray-700"
                      placeholder="Describe this service..."
                      multiline
                    />
                  ) : (
                    <CardDescription className="text-secondary text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}