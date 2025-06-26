'use client';

import React from 'react';
import { EditableText } from '@/components/EditableText';
import { useTheme } from '@/contexts/ThemeContext';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface ContactArtistryCardsProps {
  content: {
    sectionTitle?: string;
    contactInfo?: {
      address?: string;
      phone?: string;
      email?: string;
      hours?: string;
    };
    formTitle?: string;
  };
  onUpdate?: (updates: any) => void;
}

export default function ContactArtistryCards({ content, onUpdate }: ContactArtistryCardsProps) {
  const { colors } = useTheme();
  
  const defaultContent = {
    sectionTitle: content.sectionTitle || 'Get in Touch',
    formTitle: content.formTitle || 'Send us a message',
    contactInfo: {
      address: content.contactInfo?.address || '123 Garden Way, Green Valley, CA 90210',
      phone: content.contactInfo?.phone || '(555) 123-4567',
      email: content.contactInfo?.email || 'hello@artistrylandscapes.com',
      hours: content.contactInfo?.hours || 'Mon-Fri 8AM-6PM, Sat 9AM-4PM'
    }
  };

  const contactCards = [
    { icon: MapPin, label: 'Address', value: defaultContent.contactInfo.address },
    { icon: Phone, label: 'Phone', value: defaultContent.contactInfo.phone },
    { icon: Mail, label: 'Email', value: defaultContent.contactInfo.email },
    { icon: Clock, label: 'Hours', value: defaultContent.contactInfo.hours }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-4">
            <EditableText
              value={defaultContent.sectionTitle}
              onSave={async (value) => {
                if (onUpdate) {
                  await onUpdate({ sectionTitle: value });
                }
              }}
              className="inline-block"
            />
          </h2>
          <div className="w-20 h-0.5 bg-gray-900 mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {contactCards.map((card, index) => (
              <div key={index} className="text-center">
                <card.icon className="w-8 h-8 mx-auto mb-4 text-gray-400" strokeWidth={1} />
                <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">{card.label}</h3>
                <p className="text-gray-900">
                  <EditableText
                    value={card.value}
                    onSave={(value) => {
                      const key = card.label.toLowerCase();
                      onUpdate?.({
                        contactInfo: {
                          ...defaultContent.contactInfo,
                          [key]: value
                        }
                      });
                    }}
                    multiline={card.label === 'Address' || card.label === 'Hours'}
                    className="inline-block"
                  />
                </p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-serif font-light text-gray-900 mb-8">
              <EditableText
                value={defaultContent.formTitle}
                onSave={async (value) => {
                if (onUpdate) {
                  await onUpdate({ formTitle: value });
                }
              }}
                className="inline-block"
              />
            </h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 focus:border-gray-900 focus:outline-none placeholder-gray-400"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 focus:border-gray-900 focus:outline-none placeholder-gray-400"
                />
              </div>
              
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 focus:border-gray-900 focus:outline-none placeholder-gray-400"
              />
              
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 focus:border-gray-900 focus:outline-none placeholder-gray-400"
              />
              
              <textarea
                placeholder="Tell us about your project"
                rows={4}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 focus:border-gray-900 focus:outline-none placeholder-gray-400 resize-none"
              />
              
              <button
                type="submit"
                className="w-full py-4 bg-gray-900 text-white text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}