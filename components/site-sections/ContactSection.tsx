'use client';

import React from 'react';
import { SmartForm } from '@/components/forms';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { EditableText } from '@/components/EditableText';

interface ContactSectionProps {
  section: {
    data: {
      title?: string;
      subtitle?: string;
      phone?: string;
      email?: string;
      address?: string;
      hours?: Array<{
        day: string;
        open: string;
        close: string;
      }>;
    };
  };
  siteData: {
    id: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    businessHours?: any;
  };
  onUpdate?: (fieldPath: string, value: any) => Promise<void>;
  isEditable?: boolean;
}


export function ContactSection({ section, siteData, onUpdate, isEditable = false }: ContactSectionProps) {
  const phone = section.data.phone || siteData.phone;
  const email = section.data.email || siteData.email;
  const address = section.data.address || 
    [siteData.address, siteData.city, siteData.state, siteData.zip]
      .filter(Boolean)
      .join(', ');

  // Parse business hours if available
  const businessHours = siteData.businessHours?.periods || [];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {isEditable ? (
            <EditableText
              value={section.data.title || 'Get In Touch'}
              onSave={async (value: string) => {
                if (onUpdate) {
                  await onUpdate('title', value);
                }
              }}
              as="h2"
              className="text-3xl font-bold text-gray-900 mb-4"
              editClassName="text-3xl font-bold text-gray-900"
              placeholder="Contact title"
            />
          ) : (
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {section.data.title || 'Get In Touch'}
            </h2>
          )}
          {(section.data.subtitle || isEditable) && (
            isEditable ? (
              <EditableText
                value={section.data.subtitle || ''}
                onSave={async (value: string) => {
                  if (onUpdate) {
                    await onUpdate('subtitle', value);
                  }
                }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
                editClassName="text-lg text-gray-900 max-w-2xl mx-auto"
                placeholder="Contact subtitle"
              />
            ) : (
              section.data.subtitle && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {section.data.subtitle}
                </p>
              )
            )
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
              
              <div className="space-y-4">
                {phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href={`tel:${phone}`} className="text-primary hover:underline">
                        {phone}
                      </a>
                    </div>
                  </div>
                )}

                {email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href={`mailto:${email}`} className="text-primary hover:underline">
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                {address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-gray-600">{address}</p>
                    </div>
                  </div>
                )}

                {businessHours.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-2">Business Hours</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        {businessHours.map((period: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span>{getDayName(period.openDay)}</span>
                            <span>
                              {formatTime(period.openTime)} - {formatTime(period.closeTime)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Send Us a Message</h3>
            <SmartForm 
              siteId={siteData.id} 
              formType="contact"
              className="bg-white p-6 rounded-lg shadow-sm"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper functions
function getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || '';
}

function formatTime(time: any): string {
  if (!time) return '';
  
  // Handle different time formats from GBP API
  if (typeof time === 'object' && time.hours !== undefined) {
    // Object format: {hours: 8, minutes: 0}
    const hour = time.hours;
    const minute = time.minutes || 0;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  } else if (typeof time === 'string') {
    if (time.includes(':')) {
      // String format with colon: "09:00"
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } else if (time.length === 4) {
      // String format without colon: "0900"
      const hour = parseInt(time.substring(0, 2));
      const minute = time.substring(2, 4);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minute} ${ampm}`;
    }
  }
  
  // Fallback - return the time as-is
  return String(time);
}