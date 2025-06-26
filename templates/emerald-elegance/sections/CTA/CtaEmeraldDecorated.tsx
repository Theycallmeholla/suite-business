'use client';

import React from 'react';
import { Leaf, Trees } from 'lucide-react';
import { EditableText } from '@/components/EditableText';
import Link from 'next/link';

interface CtaEmeraldDecoratedProps {
  data: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  siteId: string;
  isEditable?: boolean;
}

export default function CtaEmeraldDecorated({ data, siteId, isEditable = false }: CtaEmeraldDecoratedProps) {
  return (
    <section className="py-20 md:py-32 bg-emerald-700 text-white overflow-hidden">
      <div className="container mx-auto px-6 text-center relative">
        {/* Decorative Background Elements */}
        <div className="absolute -top-20 -left-20 opacity-10 text-white">
          <Leaf className="h-48 w-48 transform rotate-12" />
        </div>
        <div className="absolute -bottom-24 -right-12 opacity-10 text-white transform rotate-12">
          <Trees className="h-64 w-64" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold">
            <EditableText
              value={data.title || 'Ready for Your Dream Garden?'}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </h2>
          <p className="mt-4 text-lg text-emerald-100 max-w-2xl mx-auto">
            <EditableText
              value={data.subtitle || "Let's start the conversation. Contact us today for a complimentary consultation and discover the potential of your outdoor space."}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </p>
          <Link 
            href={data.ctaLink || '#contact'}
            className="mt-8 inline-block bg-white text-emerald-800 font-bold px-10 py-5 rounded-full hover:bg-emerald-100 transition-colors text-lg shadow-lg transform hover:scale-105"
          >
            {data.ctaText || 'Get Your Free Consultation'}
          </Link>
        </div>
      </div>
    </section>
  );
}