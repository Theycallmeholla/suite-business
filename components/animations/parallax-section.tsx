"use client"
import type React from "react"
import { useEffect, useRef, type ReactNode } from "react"
import Image from "next/image"

interface ParallaxLayerConfig {
  src: string
  alt: string
  speed: number // e.g., 0.1 for slow (background), 0.5 for faster (foreground)
  className?: string
  zIndex?: number
  type?: "image" | "gradient" // For gradients or color overlays
  gradient?: string // e.g. 'bg-gradient-to-t from-brand-cream via-transparent to-transparent'
}

interface ParallaxSectionProps {
  layers: ParallaxLayerConfig[]
  children?: ReactNode
  containerClassName?: string
  height?: string // e.g., 'h-screen', 'h-[700px]'
  id?: string
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  layers,
  children,
  containerClassName = "",
  height = "h-screen",
  id,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      // Only apply parallax effect when the section is somewhat in view
      const isInView = rect.top < window.innerHeight && rect.bottom > 0

      if (isInView) {
        const scrollYRelativeToViewport = window.scrollY
        layerRefs.current.forEach((layerEl, index) => {
          if (layerEl) {
            const speed = layers[index].speed
            // Adjust translateY. Negative speed for elements moving "slower" than scroll (appearing further away)
            layerEl.style.transform = `translateY(${scrollYRelativeToViewport * speed * -0.1}px)`
          }
        })
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial position
    return () => window.removeEventListener("scroll", handleScroll)
  }, [layers]) // Rerun if layers change

  return (
    <section ref={sectionRef} id={id} className={`relative overflow-hidden ${height} ${containerClassName}`}>
      {layers.map((layer, index) => (
        <div
          key={index}
          ref={(el) => {
            layerRefs.current[index] = el
          }}
          className={`absolute inset-0 w-full h-full ${layer.className || ""}`}
          style={{ zIndex: layer.zIndex !== undefined ? layer.zIndex : index }}
        >
          {layer.type === "gradient" ? (
            <div className={`w-full h-full ${layer.gradient}`}></div>
          ) : (
            <Image
              src={layer.src || "/placeholder.svg"}
              alt={layer.alt}
              layout="fill"
              objectFit="cover"
              priority={index < 2} // Prioritize loading for first few layers
              quality={80}
            />
          )}
        </div>
      ))}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
        {children}
      </div>
    </section>
  )
}