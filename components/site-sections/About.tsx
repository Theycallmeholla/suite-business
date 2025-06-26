'use client';

import { AboutSection } from '@/types/site-builder';
import { EditableText } from '@/components/EditableText';
import { SeasonalDisplay } from "@/components/animations/seasonal-display";
import { GrowingBotanical } from "@/components/ui/growing-botanical";
import { CheckCircle, Star, Award, Clock } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";

interface AboutProps {
  section: AboutSection;
  siteData: {
    businessName: string;
    primaryColor: string;
  };
  onUpdate?: (fieldPath: string, value: any) => Promise<void>;
  isEditable?: boolean;
}

export function About({ section, siteData, onUpdate, isEditable = false }: AboutProps) {
  const { data } = section;
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });

  // Default craft points for service businesses
  const defaultCraftPoints = [
    "Passionate professionals dedicated to excellence.",
    "Years of experience in our field.",
    "Commitment to customer satisfaction.",
    "Quality workmanship and attention to detail.",
    "Reliable service you can trust.",
  ];

  const craftPoints = (data as any).highlights || defaultCraftPoints;

  if (data.variant === 'simple') {
    return (
      <section ref={sectionRef} className="py-16 md:py-24 bg-primary/10" id="about">
        <div className="container mx-auto px-4">
          <div className={cn(
            "max-w-3xl mx-auto text-center transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            {isEditable ? (
              <EditableText
                value={data.title}
                onSave={async (value: string) => { if (onUpdate) { await onUpdate('title', value); } }}
                as="h2"
                className="font-serif-heading text-4xl md:text-5xl font-bold text-primary-dark mb-6"
                editClassName="font-serif-heading text-4xl md:text-5xl font-bold text-gray-900"
                placeholder="About Us"
              />
            ) : (
              <h2 className="font-serif-heading text-4xl md:text-5xl font-bold text-primary-dark mb-6">{data.title}</h2>
            )}
            {isEditable ? (
              <EditableText
                value={data.content}
                onSave={async (value: string) => { if (onUpdate) { await onUpdate('content', value); } }}
                className="font-serif-body prose prose-lg mx-auto text-secondary leading-relaxed"
                editClassName="font-serif-body prose prose-lg mx-auto text-gray-900"
                placeholder="Tell your story..."
                multiline
              />
            ) : (
              <div 
                className="font-serif-body prose prose-lg mx-auto text-secondary leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            )}
            <div className="flex justify-center gap-4 mt-8">
              <GrowingBotanical
                src="/placeholder.svg?height=120&width=100"
                alt="Decorative element 1"
                width={100}
                height={120}
                className="opacity-70"
                animationDelay="delay-300"
              />
              <GrowingBotanical
                src="/placeholder.svg?height=100&width=120"
                alt="Decorative element 2"
                width={120}
                height={100}
                className="opacity-70"
                animationDelay="delay-500"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (data.variant === 'with-image') {
    return (
      <section ref={sectionRef} className="py-16 md:py-24 bg-primary-light/30" id="about">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={cn(
              "order-2 lg:order-1 transition-all duration-1000 ease-out",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            )}>
              {isEditable ? (
                <EditableText
                  value={data.title}
                  onSave={async (value: string) => { if (onUpdate) { await onUpdate('title', value); } }}
                  as="h2"
                  className="font-serif-heading text-4xl md:text-5xl font-bold text-primary-dark mb-6"
                  editClassName="font-serif-heading text-4xl md:text-5xl font-bold text-gray-900"
                  placeholder="The Art & Soul of Our Craft"
                />
              ) : (
                <h2 className="font-serif-heading text-4xl md:text-5xl font-bold text-primary-dark mb-6">{data.title}</h2>
              )}
              {isEditable ? (
                <EditableText
                  value={data.content}
                  onSave={async (value: string) => { if (onUpdate) { await onUpdate('content', value); } }}
                  className="font-serif-body text-lg text-secondary mb-6 leading-relaxed"
                  editClassName="font-serif-body text-lg text-gray-900"
                  placeholder="Tell your story..."
                  multiline
                />
              ) : (
                <div 
                  className="font-serif-body text-lg text-secondary mb-6 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: data.content }}
                />
              )}
              <ul className="space-y-3 mb-8">
                {craftPoints.map((point: any, index: number) => (
                  <li key={index} className={cn(
                    "flex items-start transition-all duration-700 ease-out",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                  )} style={{ transitionDelay: `${(index + 1) * 100}ms` }}>
                    <CheckCircle className="h-6 w-6 text-primary-dark mr-3 mt-1 flex-shrink-0" />
                    <span className="font-serif-body text-secondary">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-4">
                <GrowingBotanical
                  src="/placeholder.svg?height=120&width=100"
                  alt="Decorative element 1"
                  width={100}
                  height={120}
                  className="opacity-70"
                  animationDelay="delay-300"
                />
                <GrowingBotanical
                  src="/placeholder.svg?height=100&width=120"
                  alt="Decorative element 2"
                  width={120}
                  height={100}
                  className="opacity-70"
                  animationDelay="delay-500"
                />
              </div>
            </div>
            <div className={cn(
              "order-1 lg:order-2 transition-all duration-1000 ease-out",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            )}>
              {data.image ? (
                <div className="relative">
                  <img
                    src={data.image}
                    alt={`About ${siteData.businessName}`}
                    className="rounded-lg shadow-2xl w-full"
                  />
                  <div 
                    className="absolute -bottom-4 -right-4 w-full h-full rounded-lg -z-10"
                    style={{ backgroundColor: `${siteData.primaryColor}20` }}
                  />
                </div>
              ) : (
                <SeasonalDisplay />
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (data.variant === 'with-stats') {
    const statIcons = [Clock, Star, Award, CheckCircle];
    
    return (
      <section ref={sectionRef} className="py-16 md:py-24 bg-accent/10" id="about">
        <div className="container mx-auto px-4">
          <div className={cn(
            "text-center mb-12 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            {isEditable ? (
              <EditableText
                value={data.title}
                onSave={async (value: string) => { if (onUpdate) { await onUpdate('title', value); } }}
                as="h2"
                className="font-serif-heading text-4xl md:text-5xl font-bold text-primary-dark mb-6"
                editClassName="font-serif-heading text-4xl md:text-5xl font-bold text-gray-900"
                placeholder="About Us"
              />
            ) : (
              <h2 className="font-serif-heading text-4xl md:text-5xl font-bold text-primary-dark mb-6">{data.title}</h2>
            )}
            {isEditable ? (
              <EditableText
                value={data.content}
                onSave={async (value: string) => { if (onUpdate) { await onUpdate('content', value); } }}
                className="font-serif-body prose prose-lg mx-auto text-secondary max-w-3xl leading-relaxed"
                editClassName="font-serif-body prose prose-lg mx-auto text-gray-900 max-w-3xl"
                placeholder="Tell your story..."
                multiline
              />
            ) : (
              <div 
                className="font-serif-body prose prose-lg mx-auto text-secondary max-w-3xl leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            )}
          </div>
          
          {data.stats && data.stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 max-w-5xl mx-auto">
              {data.stats.map((stat, idx) => {
                const Icon = statIcons[idx % statIcons.length];
                return (
                  <div key={idx} className={cn(
                    "text-center group transition-all duration-700 ease-out",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  )} style={{ transitionDelay: `${idx * 150}ms` }}>
                    <div className="p-4 bg-primary-light/30 rounded-full mb-4 inline-block group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-primary-dark" />
                    </div>
                    <div 
                      className="text-4xl md:text-5xl font-bold mb-2 text-primary-dark"
                    >
                      {isEditable ? (
                        <EditableText
                          value={stat.value}
                          onSave={async (value: string) => {
                            if (onUpdate) {
                              await onUpdate(`stats.${idx}.value`, value);
                            }
                          }}
                          placeholder="0"
                          editClassName="text-4xl md:text-5xl font-bold text-gray-900"
                        />
                      ) : (
                        <span className="font-serif-heading">{stat.value}</span>
                      )}
                    </div>
                    <div className="text-secondary font-serif-body">
                      {isEditable ? (
                        <EditableText
                          value={stat.label}
                          onSave={async (value: string) => {
                            if (onUpdate) {
                              await onUpdate(`stats.${idx}.label`, value);
                            }
                          }}
                          placeholder="Label"
                          editClassName="text-gray-600"
                        />
                      ) : (
                        stat.label
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="flex justify-center gap-4 mt-12">
            <GrowingBotanical
              src="/placeholder.svg?height=80&width=80"
              alt="Decorative element"
              width={80}
              height={80}
              className="opacity-50"
              animationDelay="delay-300"
            />
            <GrowingBotanical
              src="/placeholder.svg?height=100&width=100"
              alt="Decorative element"
              width={100}
              height={100}
              className="opacity-50"
              animationDelay="delay-500"
            />
            <GrowingBotanical
              src="/placeholder.svg?height=80&width=80"
              alt="Decorative element"
              width={80}
              height={80}
              className="opacity-50"
              animationDelay="delay-700"
            />
          </div>
        </div>
      </section>
    );
  }

  return null;
}