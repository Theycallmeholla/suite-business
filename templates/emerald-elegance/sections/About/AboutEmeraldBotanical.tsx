'use client';

import React from 'react';
import { EditableText } from '@/components/EditableText';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatedBotanical } from '../../components/AnimatedBotanical';

interface AboutEmeraldBotanicalProps {
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    secondaryDescription?: string;
    teamImage?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  siteId: string;
  isEditable?: boolean;
}

export default function AboutEmeraldBotanical({ data, siteId, isEditable = false }: AboutEmeraldBotanicalProps) {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative h-96 md:h-auto min-h-[500px]">
          {data.teamImage ? (
            <Image
              src={data.teamImage}
              alt="Our Team"
              fill
              className="object-cover rounded-2xl shadow-2xl"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl shadow-2xl" />
          )}
          <div className="absolute -bottom-8 -right-8 w-48 h-48 opacity-20">
            <AnimatedBotanical className="w-full h-full text-emerald-700" />
          </div>
        </div>
        
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900">
            <EditableText
              value={data.title || 'Passion for Perfection'}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </h2>
          <p className="mt-6 text-lg text-gray-600">
            <EditableText
              value={data.description || 'Verdant was founded on a simple principle: to create beautiful, functional, and enduring outdoor spaces. With over 20 years of combined experience in horticulture and design, our team is a blend of artists, architects, and craftsmen dedicated to the art of landscaping.'}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </p>
          <p className="mt-4 text-lg text-gray-600">
            <EditableText
              value={data.secondaryDescription || "We believe that a garden is a living piece of art, constantly evolving and growing. Our approach is collaborative and personalized, ensuring that every project is a true reflection of our client's vision and the natural character of their property."}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </p>
          <Link 
            href={data.ctaLink || '#contact'}
            className="mt-8 inline-block bg-emerald-600 text-white font-semibold px-8 py-4 rounded-full hover:bg-emerald-700 transition-colors"
          >
            {data.ctaText || 'Meet the Team'}
          </Link>
        </div>
      </div>
    </section>
  );
}