'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Leaf, Flower, TreePine, Cloud, Sun, Snowflake, Award, Shield, Heart } from 'lucide-react';
import { EditableText } from '@/components/EditableText';
import Link from 'next/link';
import Image from 'next/image';

interface HeroNatureSeasonalProps {
  data: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    image?: string;
    badges?: Array<{ icon: string; title: string; description: string; }>;
  };
  siteId: string;
  isEditable?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  type: 'leaf' | 'flower' | 'snowflake';
}

export default function HeroNatureSeasonal({ data, siteId, isEditable = false }: HeroNatureSeasonalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [season, setSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  // Initialize particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < 30; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
        opacity: Math.random() * 0.5 + 0.2,
        type: ['leaf', 'flower', 'snowflake'][Math.floor(Math.random() * 3)] as 'leaf' | 'flower' | 'snowflake'
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // Set color based on season
        let color = 'var(--color-primary)';
        if (season === 'spring') color = 'var(--color-accent)';
        else if (season === 'summer') color = 'var(--color-primary)';
        else if (season === 'autumn') color = 'var(--color-secondary)';
        else if (season === 'winter') color = 'var(--color-primary-light)';
        
        ctx.fillStyle = color;
        
        if (particle.type === 'leaf') {
          ctx.beginPath();
          ctx.ellipse(particle.x, particle.y, particle.size * 2, particle.size, Math.PI / 4, 0, 2 * Math.PI);
          ctx.fill();
        } else if (particle.type === 'flower') {
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(
              particle.x + Math.cos((i * 72 * Math.PI) / 180) * particle.size,
              particle.y + Math.sin((i * 72 * Math.PI) / 180) * particle.size,
              particle.size / 2,
              0,
              2 * Math.PI
            );
            ctx.fill();
          }
        } else {
          // Snowflake
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(
              particle.x + Math.cos((i * 60 * Math.PI) / 180) * particle.size * 2,
              particle.y + Math.sin((i * 60 * Math.PI) / 180) * particle.size * 2
            );
          }
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [season]);

  // Handle scroll and season changes
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Change season based on scroll
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage < 25) setSeason('spring');
      else if (scrollPercentage < 50) setSeason('summer');
      else if (scrollPercentage < 75) setSeason('autumn');
      else setSeason('winter');
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getSeasonIcon = () => {
    switch (season) {
      case 'spring': return <Flower className="h-5 w-5" />;
      case 'summer': return <Sun className="h-5 w-5" />;
      case 'autumn': return <Leaf className="h-5 w-5" />;
      case 'winter': return <Snowflake className="h-5 w-5" />;
    }
  };

  const getSeasonText = () => {
    switch (season) {
      case 'spring': return 'Spring Renewal Special';
      case 'summer': return 'Summer Garden Care';
      case 'autumn': return 'Fall Preparation';
      case 'winter': return 'Winter Protection';
    }
  };

  const defaultBadges = [
    { icon: 'award', title: 'Award Winning', description: '5× Best Design' },
    { icon: 'shield', title: 'Fully Insured', description: '$2M Coverage' },
    { icon: 'heart', title: 'Eco-Friendly', description: 'Sustainable' }
  ];

  const badges = data.badges || defaultBadges;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Background Image */}
      {data.image && (
        <div className="absolute inset-0">
          <Image
            src={data.image}
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-20 left-10 opacity-20"
          style={{
            transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`
          }}
        >
          <Leaf className="h-40 w-40 text-primary animate-pulse" />
        </div>
        <div 
          className="absolute bottom-20 right-10 opacity-20"
          style={{
            transform: `translate(${-mousePosition.x * 0.05}px, ${-mousePosition.y * 0.05}px)`
          }}
        >
          <Flower className="h-32 w-32 text-accent animate-pulse" />
        </div>
        <div 
          className="absolute top-1/2 left-1/3 opacity-10"
          style={{
            transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px) rotate(${scrollY * 0.1}deg)`
          }}
        >
          <TreePine className="h-60 w-60 text-secondary" />
        </div>
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 text-center relative z-20">
        <div className="max-w-4xl mx-auto">
          {/* Season Indicator */}
          <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-6 py-3 rounded-full mb-8 shadow-lg">
            {getSeasonIcon()}
            <span className="text-sm font-medium">
              {getSeasonText()}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <EditableText
              value={data.title || 'Transform Your Outdoor Space'}
              onSave={(value) => {}}
              isEditable={isEditable}
              className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
            />
            <br />
            <span className="text-white">
              <EditableText
                value={data.subtitle || 'Into Living Art'}
                onSave={(value) => {}}
                isEditable={isEditable}
              />
            </span>
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href={data.ctaLink || '#contact'}
              className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <span>{data.ctaText || 'Start Your Project'}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            {data.secondaryCtaText && (
              <Link
                href={data.secondaryCtaLink || '#portfolio'}
                className="group flex items-center justify-center space-x-2 bg-white/90 text-gray-800 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <span>{data.secondaryCtaText}</span>
              </Link>
            )}
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {badges.map((badge, index) => {
              const IconComponent = badge.icon === 'award' ? Award : 
                                  badge.icon === 'shield' ? Shield : Heart;
              return (
                <div
                  key={index}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <IconComponent className="h-10 w-10 text-primary mb-4 mx-auto" />
                  <h3 className="font-semibold mb-2">{badge.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}