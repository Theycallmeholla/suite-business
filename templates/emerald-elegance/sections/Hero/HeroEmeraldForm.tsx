'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { EditableText } from '@/components/EditableText';
import Link from 'next/link';
import Image from 'next/image';

interface HeroEmeraldFormProps {
  data: {
    title?: string;
    subtitle?: string;
    features?: string[];
    ctaText?: string;
    ctaLink?: string;
    image?: string;
    formTitle?: string;
    formSubtitle?: string;
  };
  siteId: string;
  isEditable?: boolean;
}

export default function HeroEmeraldForm({ data, siteId, isEditable = false }: HeroEmeraldFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const defaultFeatures = [
    'Bespoke Design & Master Planning',
    'Expert Craftsmanship & Installation',
    'Sustainable Practices & Materials'
  ];

  const features = data.features || defaultFeatures;

  return (
    <section className="relative bg-emerald-800 w-full text-white">
      <div className="absolute inset-0">
        {data.image ? (
          <Image
            src={data.image}
            alt="Hero background"
            fill
            className="object-cover opacity-20"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-emerald-900 opacity-50" />
        )}
      </div>
      
      <div className="container mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center min-h-screen px-6 pt-24 pb-12 md:pt-32">
        {/* Left Column - Content */}
        <div className="text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
            <EditableText
              value={data.title || 'Your Perfect Outdoor Sanctuary'}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </h1>
          <p className="mt-6 text-xl text-emerald-100 max-w-xl mx-auto md:mx-0">
            <EditableText
              value={data.subtitle || 'We design, build, and maintain breathtaking landscapes that connect you with nature.'}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </p>
          
          <ul className="mt-8 space-y-3 text-lg text-left inline-block">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="h-6 w-6 mr-3 text-emerald-300 flex-shrink-0" />
                <EditableText
                  value={feature}
                  onSave={(value) => {}}
                  isEditable={isEditable}
                />
              </li>
            ))}
          </ul>
          
          <div className="mt-10 text-center md:text-left">
            <Link 
              href={data.ctaLink || '#services'}
              className="inline-block bg-white text-emerald-800 font-bold px-10 py-4 rounded-full hover:bg-emerald-100 transition-colors text-lg shadow-lg transform hover:scale-105"
            >
              {data.ctaText || 'Explore Our Services'}
            </Link>
          </div>
        </div>
        
        {/* Right Column - Form */}
        <div className="bg-white/90 backdrop-blur-sm text-gray-800 p-8 md:p-10 rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold text-emerald-900 mb-1">
            <EditableText
              value={data.formTitle || 'Get a Free Quote'}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </h2>
          <p className="text-gray-600 mb-6">
            <EditableText
              value={data.formSubtitle || 'Tell us about your dream project.'}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" 
              name="name"
              placeholder="Your Name" 
              value={formData.name}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
              required
            />
            <input 
              type="email" 
              name="email"
              placeholder="Your Email" 
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
              required
            />
            <textarea 
              name="message"
              placeholder="Tell us about your project..." 
              rows={4} 
              value={formData.message}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              required
            ></textarea>
            <button 
              type="submit" 
              className="w-full bg-emerald-600 text-white font-semibold p-4 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Request Consultation
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}