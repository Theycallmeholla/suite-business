"use client"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"
import { EditableText } from "@/components/EditableText"

interface ServiceAreasProps {
  data: {
    areas?: string[]
    mapImage?: string
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

// Generate default service areas based on city/state
function getDefaultAreas(siteData: { city?: string | null; state?: string | null }): string[] {
  const city = siteData.city || "Local Area"
  const state = siteData.state || ""
  
  // Create a list of nearby areas based on the main city
  const areas = [city]
  
  // Add generic neighboring areas
  const neighboringAreas = [
    "Downtown " + city,
    city + " Heights",
    "North " + city,
    "South " + city,
    city + " Valley",
    "Greater " + city + " Area"
  ]
  
  // Limit to 6 areas for visual balance
  return areas.concat(neighboringAreas.slice(0, 5))
}

export function ServiceAreas({ data, siteData, isEditable = false, onContentChange }: ServiceAreasProps) {
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.2, freezeOnceVisible: true })
  
  const areas = data.areas || getDefaultAreas(siteData)

  return (
    <section id="service-areas" ref={sectionRef} className="py-16 md:py-24 bg-primary-dark text-white">
      <div className="container">
        <div
          className={cn(
            "text-center mb-12 md:mb-16 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          )}
        >
          {isEditable ? (
            <EditableText
              value="Proudly Serving"
              onSave={async (value: string) => {
                if (onContentChange) {
                  onContentChange('serviceAreas.title', value);
                }
              }}
              as="h2"
              className="font-serif-heading text-4xl md:text-5xl font-bold mb-4"
            />
          ) : (
            <h2 className="font-serif-heading text-4xl md:text-5xl font-bold mb-4">
              Proudly Serving
            </h2>
          )}
          {isEditable ? (
            <EditableText
              value={`We bring our passion for exceptional service to communities throughout the region.`}
              onSave={async (value: string) => {
                if (onContentChange) {
                  onContentChange('serviceAreas.subtitle', value);
                }
              }}
              as="p"
              className="font-serif-body text-lg md:text-xl text-primary-light max-w-2xl mx-auto"
            />
          ) : (
            <p className="font-serif-body text-lg md:text-xl text-primary-light max-w-2xl mx-auto">
              We bring our passion for exceptional service to communities throughout the region.
            </p>
          )}
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Image
              src={data.mapImage || "/api/placeholder/700/500"}
              alt="Map of service areas"
              width={700}
              height={500}
              className={cn(
                "rounded-lg shadow-xl transition-all duration-1000 ease-out",
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90",
              )}
            />
          </div>
          <div>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-4">
              {areas.map((area, index) => (
                <li
                  key={index}
                  className={cn(
                    "flex items-center transition-all duration-700 ease-out",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10",
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <MapPin className="h-5 w-5 text-primary-light mr-3 flex-shrink-0" />
                  {isEditable ? (
                    <EditableText
                      value={area}
                      onSave={async (value: string) => {
                        if (onContentChange) {
                          onContentChange(`serviceAreas.areas.${index}`, value);
                        }
                      }}
                      as="span"
                      className="font-serif-body text-lg"
                    />
                  ) : (
                    <span className="font-serif-body text-lg">{area}</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="font-serif-body mt-8 text-primary-light">
              {isEditable ? (
                <EditableText
                  value="Don't see your area listed? "
                  onSave={async (value: string) => {
                    if (onContentChange) {
                      onContentChange('serviceAreas.disclaimer', value);
                    }
                  }}
                  as="span"
                  className="inline"
                />
              ) : (
                <span>Don't see your area listed? </span>
              )}
              <a href="#contact" className="font-semibold underline hover:text-white transition-colors">
                Contact us
              </a>
              <span> to inquire about service availability.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}