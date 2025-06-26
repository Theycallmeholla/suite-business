"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"

interface FAQProps {
  data: {
    questions?: Array<{
      question: string
      answer: string
    }>
  }
  siteData: {
    businessName: string
    primaryColor?: string | null
    city?: string | null
    state?: string | null
    industry?: string | null
  }
  isEditable?: boolean
  onContentChange?: (path: string, value: string) => void
}

// Generate industry-specific FAQs based on business type
function getDefaultFAQs(siteData: any) {
  const businessName = siteData.businessName || "our company"
  const industry = siteData.industry?.toLowerCase() || "service"
  
  // Common FAQs that apply to most service businesses
  const commonFAQs = [
    {
      question: `What areas does ${businessName} serve?`,
      answer: `We serve ${siteData.city || "the local area"} and surrounding communities. Please contact us to confirm service availability in your specific location.`
    },
    {
      question: "How do I get started?",
      answer: `The best way to start is by scheduling a consultation through our website or by giving us a call. We look forward to discussing your needs!`
    }
  ]

  // Industry-specific FAQs
  const industryFAQs: Record<string, Array<{ question: string; answer: string }>> = {
    landscaping: [
      {
        question: "What is the typical process for a landscape design project?",
        answer: "Our process begins with an initial consultation to understand your vision and assess your space. We then move to conceptual design, detailed planning, material selection, installation, and finally, a walkthrough to ensure your complete satisfaction."
      },
      {
        question: "Do you offer sustainable or eco-friendly landscaping options?",
        answer: "We are passionate about sustainable practices, including native plant selection, water-wise irrigation, organic soil enrichment, and creating habitats for local wildlife."
      }
    ],
    hvac: [
      {
        question: "How often should I service my HVAC system?",
        answer: "We recommend servicing your heating and cooling system at least twice a year - once before the cooling season and once before the heating season to ensure optimal performance and efficiency."
      },
      {
        question: "What are signs my HVAC system needs repair?",
        answer: "Common signs include unusual noises, uneven heating/cooling, increased energy bills, frequent cycling, and poor air quality. If you notice any of these, contact us for an inspection."
      }
    ],
    plumbing: [
      {
        question: "Do you offer emergency plumbing services?",
        answer: "Yes, we provide 24/7 emergency plumbing services for urgent issues like burst pipes, major leaks, or sewer backups."
      },
      {
        question: "How can I prevent plumbing issues?",
        answer: "Regular maintenance is key. Avoid putting grease down drains, fix small leaks promptly, and schedule annual inspections to catch problems early."
      }
    ],
    cleaning: [
      {
        question: "What cleaning products do you use?",
        answer: "We use eco-friendly, non-toxic cleaning products that are safe for your family and pets while still providing excellent cleaning results."
      },
      {
        question: "How often should I schedule cleaning services?",
        answer: "This depends on your needs. We offer weekly, bi-weekly, monthly, and one-time cleaning services to fit your lifestyle and budget."
      }
    ]
  }

  const specificFAQs = industryFAQs[industry] || [
    {
      question: "What services do you offer?",
      answer: "We offer a comprehensive range of services tailored to meet your needs. Contact us for a detailed list of our offerings and how we can help you."
    },
    {
      question: "How long have you been in business?",
      answer: "We have years of experience serving our community with dedication and professionalism. Our team is committed to delivering quality service."
    }
  ]

  return [...specificFAQs, ...commonFAQs]
}

export function FAQ({ data, siteData, isEditable = false, onContentChange }: FAQProps) {
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true })
  
  const faqs = data.questions || getDefaultFAQs(siteData)

  return (
    <section id="faq" ref={sectionRef} className="py-16 md:py-24 bg-accent/10">
      <div className="container">
        <div
          className={cn(
            "text-center mb-12 md:mb-16 transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          )}
        >
          <h2 className="font-serif-heading text-4xl md:text-5xl font-bold text-primary-dark mb-4">
            Frequently Asked Questions
          </h2>
          <p className="font-serif-body text-lg md:text-xl text-secondary max-w-2xl mx-auto">
            Answers to common questions about our services and process.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  "transition-all duration-700 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <AccordionItem value={`item-${index}`} className="border-b-primary-light/50">
                  <AccordionTrigger className="font-serif-heading text-lg md:text-xl text-primary-dark hover:no-underline text-left">
                    <span className="w-full pr-4">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="font-serif-body text-base text-secondary leading-relaxed pt-2">
                    <span className="block">
                      {faq.answer}
                    </span>
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}