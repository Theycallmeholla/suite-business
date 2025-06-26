"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Leaf } from "lucide-react" // Using Lucide icons as placeholders

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  animationDuration: string
  animationDelay: string
  type: "leaf" | "seed"
}

interface ParticleEffectAreaProps {
  particleCount?: number
  particleType?: "leaf" | "seed"
  className?: string
}

export const ParticleEffectArea: React.FC<ParticleEffectAreaProps> = ({
  particleCount = 15,
  particleType = "leaf",
  className,
}) => {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100, // %
        y: Math.random() * 100, // %
        size: particleType === "leaf" ? Math.random() * 12 + 8 : Math.random() * 6 + 3, // px
        opacity: Math.random() * 0.5 + 0.3,
        animationDuration: `${Math.random() * 10 + 15}s`, // 15s to 25s
        animationDelay: `${Math.random() * 5}s`, // 0s to 5s
        type: particleType,
      })
    }
    setParticles(newParticles)
  }, [particleCount, particleType])

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
          }}
        >
          {p.type === "leaf" ? (
            <Leaf className="text-brand-green-light w-full h-full" />
          ) : (
            // Using a simple dot for dandelion seed, or Dandelion icon
            // <Dandelion className="text-brand-cream/70 w-full h-full" />
            <div className="w-full h-full bg-brand-cream/70 rounded-full" />
          )}
        </div>
      ))}
    </div>
  )
}