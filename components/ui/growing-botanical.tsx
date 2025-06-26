"use client"
import Image from "next/image"
import type React from "react"

import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"

interface GrowingBotanicalProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  animationDelay?: string // e.g., 'delay-200'
}

export const GrowingBotanical: React.FC<GrowingBotanicalProps> = ({
  src,
  alt,
  width,
  height,
  className,
  animationDelay,
}) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3, freezeOnceVisible: true })

  return (
    <div
      ref={ref}
      className={cn(
        "origin-bottom",
        className,
        isVisible ? `animate-grow ${animationDelay || ""}` : "opacity-0 scale-y-0",
      )}
    >
      <Image src={src || "/placeholder.svg"} alt={alt} width={width} height={height} />
    </div>
  )
}