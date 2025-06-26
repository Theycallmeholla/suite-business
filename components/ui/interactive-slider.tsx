"use client"
import type React from "react"
import {
  useState,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  useEffect,
} from "react"
import Image from "next/image"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface InteractiveSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  altText?: string
  containerClassName?: string
}

export const InteractiveSlider: React.FC<InteractiveSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  altText = "Before and after comparison",
  containerClassName,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50) // Percentage
  const [isBlooming, setIsBlooming] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = (clientX: number) => {
    if (!containerRef.current || !isDragging.current) return
    const rect = containerRef.current.getBoundingClientRect()
    let newPosition = ((clientX - rect.left) / rect.width) * 100
    newPosition = Math.max(0.5, Math.min(99.5, newPosition)) // Clamp to avoid full overlap of labels
    setSliderPosition(newPosition)
  }

  const startDragging = () => {
    isDragging.current = true
  }

  const stopDragging = () => {
    if (isDragging.current) {
      isDragging.current = false
      setIsBlooming(true)
      setTimeout(() => setIsBlooming(false), 600) // Duration of bloom animation
    }
  }

  useEffect(() => {
    const currentContainerRef = containerRef.current
    const handleMouseMoveWindow = (e: MouseEvent) => handleMove(e.clientX)
    const handleTouchMoveWindow = (e: TouchEvent) => handleMove(e.touches[0].clientX)

    if (isDragging.current) {
      window.addEventListener("mousemove", handleMouseMoveWindow)
      window.addEventListener("touchmove", handleTouchMoveWindow)
      window.addEventListener("mouseup", stopDragging)
      window.addEventListener("touchend", stopDragging)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMoveWindow)
      window.removeEventListener("touchmove", handleTouchMoveWindow)
      window.removeEventListener("mouseup", stopDragging)
      window.removeEventListener("touchend", stopDragging)
    }
  }, [isDragging.current]) // Re-attach listeners if isDragging changes

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full max-w-3xl mx-auto aspect-[16/9] overflow-hidden cursor-ew-resize select-none group rounded-lg shadow-xl",
        containerClassName,
      )}
      onMouseDown={(e: ReactMouseEvent) => {
        e.preventDefault()
        startDragging()
      }}
      onTouchStart={(e: ReactTouchEvent) => {
        startDragging()
      }}
    >
      <div className={cn("relative w-full h-full", isBlooming && "animate-bloom")}>
        <Image
          src={afterImage || "/placeholder.svg"}
          alt={`${altText} - ${afterLabel}`}
          layout="fill"
          objectFit="cover"
          quality={80}
        />
        <div
          className="absolute top-0 left-0 h-full w-full overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={beforeImage || "/placeholder.svg"}
            alt={`${altText} - ${beforeLabel}`}
            layout="fill"
            objectFit="cover"
            quality={80}
          />
        </div>
      </div>

      <div
        className="absolute top-0 h-full w-1.5 bg-brand-cream/80 backdrop-blur-sm cursor-ew-resize flex items-center justify-center shadow-md"
        style={{ left: `calc(${sliderPosition}% - 3px)` }}
        aria-hidden="true"
      >
        <GripVertical className="text-brand-brown-dark h-8 w-8" />
      </div>

      <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1.5 rounded text-xs sm:text-sm font-semibold pointer-events-none shadow-md">
        {beforeLabel}
      </div>
      <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded text-xs sm:text-sm font-semibold pointer-events-none shadow-md">
        {afterLabel}
      </div>
    </div>
  )
}