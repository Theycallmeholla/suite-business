"use client"
import Image from "next/image"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

const seasonsData = [
  {
    name: "Spring",
    image: "/placeholder.svg?height=800&width=1200",
    description: "Life awakens in a symphony of color and fresh growth.",
  },
  {
    name: "Summer",
    image: "/placeholder.svg?height=800&width=1200",
    description: "Gardens thrive under the warm sun, full of life and vibrancy.",
  },
  {
    name: "Autumn",
    image: "/placeholder.svg?height=800&width=1200",
    description: "A tapestry of gold, red, and orange hues paints the landscape.",
  },
  {
    name: "Winter",
    image: "/placeholder.svg?height=800&width=1200",
    description: "Quiet beauty and structural elegance emerge in the calm of winter.",
  },
]

export const SeasonalDisplay: React.FC = () => {
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0)
  const [containerRef, isVisible] = useIntersectionObserver({ threshold: 0.2, freezeOnceVisible: false })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isVisible) {
      intervalRef.current = setInterval(() => {
        setCurrentSeasonIndex((prevIndex) => (prevIndex + 1) % seasonsData.length)
      }, 5000) // Change season every 5 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isVisible])

  const currentSeason = seasonsData[currentSeasonIndex]

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] md:h-[600px] lg:h-[700px] overflow-hidden rounded-lg shadow-2xl"
    >
      {seasonsData.map((season, index) => (
        <Image
          key={season.name}
          src={season.image || "/placeholder.svg"}
          alt={`${season.name} landscape`}
          layout="fill"
          objectFit="cover"
          className={`transition-opacity duration-[2000ms] ease-in-out absolute inset-0 ${currentSeasonIndex === index ? "opacity-100 animate-seasonFade" : "opacity-0"}`}
          priority={index === 0}
          quality={85}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col items-center justify-end p-8 md:p-12 text-center">
        <h3 className="font-serif-heading text-4xl md:text-6xl font-bold text-white mb-2 capitalize drop-shadow-lg">
          {currentSeason.name}
        </h3>
        <p className="text-lg md:text-xl text-brand-cream max-w-xl drop-shadow-md">{currentSeason.description}</p>
      </div>
    </div>
  )
}