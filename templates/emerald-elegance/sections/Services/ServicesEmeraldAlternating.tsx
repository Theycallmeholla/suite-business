'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { EditableText } from '@/components/EditableText';
import Image from 'next/image';
import Link from 'next/link';

interface Service {
  id?: string;
  title: string;
  description: string;
  image: string;
  link?: string;
}

interface ServicesEmeraldAlternatingProps {
  data: {
    title?: string;
    subtitle?: string;
    services?: Service[];
  };
  siteId: string;
  isEditable?: boolean;
}

export default function ServicesEmeraldAlternating({ data, siteId, isEditable = false }: ServicesEmeraldAlternatingProps) {
  const defaultServices: Service[] = [
    {
      id: 'design',
      title: 'Garden Design',
      description: 'We craft bespoke garden designs that reflect your personal style, creating a seamless transition from your indoor to outdoor living spaces.',
      image: '/placeholder.svg?text=Garden+Design&width=800&height=600'
    },
    {
      id: 'installation',
      title: 'Installation',
      description: 'Our expert team brings designs to life with meticulous attention to detail, from softscaping with vibrant plants to complex installations.',
      image: '/placeholder.svg?text=Installation&width=800&height=600'
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      description: 'Keep your garden pristine year-round with our comprehensive maintenance programs, ensuring its health and beauty for years to come.',
      image: '/placeholder.svg?text=Maintenance&width=800&height=600'
    },
    {
      id: 'hardscaping',
      title: 'Hardscaping',
      description: 'We build stunning and durable hardscapes, including patios, walkways, retaining walls, and water features that define your outdoor space.',
      image: '/placeholder.svg?text=Hardscaping&width=800&height=600'
    }
  ];

  const services = data.services || defaultServices;

  return (
    <section className="py-20 md:py-32 bg-stone-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 p-8">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900">
            <EditableText
              value={data.title || 'Our Expertise'}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            <EditableText
              value={data.subtitle || 'From concept to completion, we offer a full suite of services to perfect your outdoor living experience.'}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </p>
        </div>
        
        <div className="space-y-20">
          {services.map((service, index) => (
            <div 
              key={service.id || index} 
              className="bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
            >
              <div className="grid md:grid-cols-2 gap-0 items-stretch">
                <div className={`relative h-96 md:h-auto min-h-[400px] ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover rounded-t-2xl md:rounded-none md:rounded-l-2xl"
                  />
                </div>
                <div className={`flex items-center ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                  <div className="text-center md:text-left p-8 md:p-12">
                    <h3 className="text-3xl font-bold text-emerald-800 mb-4">
                      <EditableText
                        value={service.title}
                        onSave={(value) => {}}
                        isEditable={isEditable}
                      />
                    </h3>
                    <p className="text-gray-600 text-lg mb-6">
                      <EditableText
                        value={service.description}
                        onSave={(value) => {}}
                        isEditable={isEditable}
                      />
                    </p>
                    <Link 
                      href={service.link || '#contact'}
                      className="inline-flex items-center font-semibold text-emerald-600 hover:text-emerald-800 transition-colors group"
                    >
                      Learn More 
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}