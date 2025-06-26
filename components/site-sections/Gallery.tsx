"use client"
import { InteractiveSlider } from "@/components/ui/interactive-slider"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"
import Image from "next/image"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"
import { EditableText } from "@/components/EditableText"

interface GalleryProps {
  data: {
    testimonials?: Array<{
      quote: string
      name: string
      location?: string
      image?: string
    }>
    transformations?: Array<{
      before: string
      after: string
      alt: string
    }>
  }
  siteData: {
    businessName: string
    city?: string | null
    state?: string | null
    primaryColor?: string | null
  }
  isEditable?: boolean
  onContentChange?: (path: string, value: string) => void
}

export function Gallery({ data, siteData, isEditable = false, onContentChange }: GalleryProps) {
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true })

  // Default data if not provided
  const testimonials = data.testimonials || [
    {
      quote: `${siteData.businessName} transformed our space beyond recognition. Their attention to detail and creativity is unparalleled.`,
      name: "The Miller Family",
      location: siteData.city ? `${siteData.city}, ${siteData.state}` : "Local Area",
      image: "/api/placeholder/600/400"
    },
    {
      quote: "The team was professional, listened to our ideas, and delivered beyond our wildest dreams. Highly recommend!",
      name: "John & Sarah P.",
      location: siteData.city ? `${siteData.city}, ${siteData.state}` : "Local Area",
      image: "/api/placeholder/600/400"
    }
  ]

  const transformations = data.transformations || [
    {
      before: "/api/placeholder/800/450",
      after: "/api/placeholder/800/450",
      alt: "Project transformation"
    },
    {
      before: "/api/placeholder/800/450",
      after: "/api/placeholder/800/450",
      alt: "Before and after showcase"
    }
  ]

  return (
    <section id="gallery" ref={sectionRef} className="py-16 md:py-24 bg-accent/10">
      <div className="container">
        <div
          className={cn(
            "text-center mb-12 md:mb-16 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          )}
        >
          {isEditable ? (
            <EditableText
              value="Our Work & Testimonials"
              onSave={async (value: string) => {
                if (onContentChange) {
                  onContentChange('gallery.title', value);
                }
              }}
              as="h2"
              className="font-serif-heading text-4xl md:text-5xl font-bold text-primary-dark mb-4"
            />
          ) : (
            <h2 className="font-serif-heading text-4xl md:text-5xl font-bold text-primary-dark mb-4">
              Our Work & Testimonials
            </h2>
          )}
          {isEditable ? (
            <EditableText
              value="See the transformations and hear from those who've experienced our exceptional service."
              onSave={async (value: string) => {
                if (onContentChange) {
                  onContentChange('gallery.subtitle', value);
                }
              }}
              as="p"
              className="font-serif-body text-lg md:text-xl text-secondary max-w-2xl mx-auto"
            />
          ) : (
            <p className="font-serif-body text-lg md:text-xl text-secondary max-w-2xl mx-auto">
              See the transformations and hear from those who've experienced our exceptional service.
            </p>
          )}
        </div>

        {transformations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
            {transformations.map((slider, index) => (
              <div
                key={index}
                className={cn(
                  "transition-all duration-700 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                )}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <InteractiveSlider beforeImage={slider.before} afterImage={slider.after} altText={slider.alt} />
              </div>
            ))}
          </div>
        )}

        {testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={cn(
                  "transition-all duration-700 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                )}
                style={{ transitionDelay: `${(index + transformations.length) * 200}ms` }}
              >
                <Card className="h-full flex flex-col bg-white/70 backdrop-blur-sm shadow-lg border-primary-light overflow-hidden group relative">
                  {testimonial.image && (
                    <div className="relative h-64 w-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={`Work for ${testimonial.name}`}
                        layout="fill"
                        objectFit="cover"
                        className="group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div
                          className="absolute inset-0 animate-ripple bg-white/30 rounded-full scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100"
                          style={{ animationIterationCount: 1 }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <Quote className="h-8 w-8 text-primary mb-4" />
                    {isEditable ? (
                      <EditableText
                        value={`"${testimonial.quote}"`}
                        onSave={async (value: string) => {
                          if (onContentChange) {
                            onContentChange(`gallery.testimonials.${index}.quote`, value);
                          }
                        }}
                        as="p"
                        className="font-serif-body text-secondary italic mb-4 flex-grow"
                      />
                    ) : (
                      <p className="font-serif-body text-secondary italic mb-4 flex-grow">
                        "{testimonial.quote}"
                      </p>
                    )}
                    {isEditable ? (
                      <EditableText
                        value={testimonial.name}
                        onSave={async (value: string) => {
                          if (onContentChange) {
                            onContentChange(`gallery.testimonials.${index}.name`, value);
                          }
                        }}
                        as="p"
                        className="font-semibold text-primary-dark"
                      />
                    ) : (
                      <p className="font-semibold text-primary-dark">
                        {testimonial.name}
                      </p>
                    )}
                    {testimonial.location && (
                      isEditable ? (
                        <EditableText
                          value={testimonial.location}
                          onSave={async (value: string) => {
                            if (onContentChange) {
                              onContentChange(`gallery.testimonials.${index}.location`, value);
                            }
                          }}
                          as="p"
                          className="text-sm text-secondary-dark"
                        />
                      ) : (
                        <p className="text-sm text-secondary-dark">
                          {testimonial.location}
                        </p>
                      )
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}