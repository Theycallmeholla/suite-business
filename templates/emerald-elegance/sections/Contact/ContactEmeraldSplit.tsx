'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { EditableText } from '@/components/EditableText';

interface ContactEmeraldSplitProps {
  data: {
    title?: string;
    subtitle?: string;
    phone?: string;
    email?: string;
    address?: string;
    formTitle?: string;
  };
  siteId: string;
  isEditable?: boolean;
}

export default function ContactEmeraldSplit({ data, siteId, isEditable = false }: ContactEmeraldSplitProps) {
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

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900">
            <EditableText
              value={data.title || 'Get In Touch'}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            <EditableText
              value={data.subtitle || "We're excited to hear about your project. Fill out the form or use the contact details below."}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </p>
          
          <div className="mt-8 space-y-4">
            {data.phone && (
              <p className="flex items-center text-lg">
                <Phone className="h-6 w-6 mr-3 text-emerald-600 flex-shrink-0" />
                <a href={`tel:${data.phone}`} className="hover:text-emerald-600 transition-colors">
                  <EditableText
                    value={data.phone}
                    onSave={(value) => {}}
                    isEditable={isEditable}
                  />
                </a>
              </p>
            )}
            
            {data.email && (
              <p className="flex items-center text-lg">
                <Mail className="h-6 w-6 mr-3 text-emerald-600 flex-shrink-0" />
                <a href={`mailto:${data.email}`} className="hover:text-emerald-600 transition-colors">
                  <EditableText
                    value={data.email}
                    onSave={(value) => {}}
                    isEditable={isEditable}
                  />
                </a>
              </p>
            )}
            
            {data.address && (
              <p className="flex items-start text-lg">
                <MapPin className="h-6 w-6 mr-3 text-emerald-600 flex-shrink-0 mt-1" />
                <EditableText
                  value={data.address}
                  onSave={(value) => {}}
                  isEditable={isEditable}
                />
              </p>
            )}
          </div>
        </div>
        
        <form 
          onSubmit={handleSubmit}
          className="space-y-6 bg-stone-50 p-8 rounded-2xl shadow-lg"
        >
          {data.formTitle && (
            <h3 className="text-2xl font-semibold text-emerald-900 mb-4">
              <EditableText
                value={data.formTitle}
                onSave={(value) => {}}
                isEditable={isEditable}
              />
            </h3>
          )}
          
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
            rows={5} 
            value={formData.message}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            required
          ></textarea>
          <button 
            type="submit" 
            className="w-full bg-emerald-600 text-white font-semibold p-4 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}