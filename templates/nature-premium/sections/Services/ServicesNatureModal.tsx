'use client';

import React, { useState } from 'react';
import { Check, ChevronRight, X, Palette, Trees, Droplets, Flower } from 'lucide-react';
import { EditableText } from '@/components/EditableText';

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  price?: string;
  icon?: string;
  color?: string;
}

interface ServicesNatureModalProps {
  data: {
    title?: string;
    subtitle?: string;
    services?: Service[];
  };
  siteId: string;
  isEditable?: boolean;
}

export default function ServicesNatureModal({ data, siteId, isEditable = false }: ServicesNatureModalProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Default services if none provided
  const defaultServices: Service[] = [
    {
      id: 'design',
      title: 'Landscape Design',
      description: 'Custom garden designs tailored to your lifestyle and preferences',
      features: ['3D Visualization', 'Plant Selection', 'Hardscape Planning', 'Lighting Design'],
      price: 'From $500',
      icon: 'palette',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'installation',
      title: 'Installation',
      description: 'Professional installation of all landscape elements',
      features: ['Planting', 'Irrigation Systems', 'Pathway Construction', 'Water Features'],
      price: 'From $2,000',
      icon: 'trees',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      description: 'Year-round care to keep your garden thriving',
      features: ['Weekly Service', 'Seasonal Cleanup', 'Pruning & Trimming', 'Fertilization'],
      price: 'From $150/month',
      icon: 'droplets',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'specialty',
      title: 'Specialty Gardens',
      description: 'Unique themed gardens for special purposes',
      features: ['Japanese Gardens', 'Native Plant Gardens', 'Edible Landscapes', 'Butterfly Gardens'],
      price: 'Custom Quote',
      icon: 'flower',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const services = data.services || defaultServices;

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'palette': return Palette;
      case 'trees': return Trees;
      case 'droplets': return Droplets;
      case 'flower': return Flower;
      default: return Palette;
    }
  };

  return (
    <section className="py-20 relative bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <EditableText
              value={data.title || 'Our Services'}
              onSave={(value) => {}}
              isEditable={isEditable}
              className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            />
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            <EditableText
              value={data.subtitle || 'Comprehensive landscaping solutions tailored to your needs'}
              onSave={(value) => {}}
              isEditable={isEditable}
            />
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service, index) => {
            const Icon = getIcon(service.icon);
            return (
              <div
                key={service.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => setSelectedService(service)}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color || 'from-primary to-secondary'} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative p-8">
                  <Icon className="h-12 w-12 mb-4 text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors" />
                  <h3 className="text-xl font-semibold mb-3">
                    <EditableText
                      value={service.title}
                      onSave={(value) => {}}
                      isEditable={isEditable}
                    />
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    <EditableText
                      value={service.description}
                      onSave={(value) => {}}
                      isEditable={isEditable}
                    />
                  </p>
                  {service.price && (
                    <p className="text-lg font-bold text-primary">{service.price}</p>
                  )}
                  
                  {/* Features Preview */}
                  <ul className="mt-4 space-y-2">
                    {service.features.slice(0, 2).map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {service.features.length > 2 && (
                      <li className="text-sm text-gray-400 dark:text-gray-500">
                        +{service.features.length - 2} more...
                      </li>
                    )}
                  </ul>
                  
                  {/* Hover Action */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-primary font-semibold flex items-center">
                      Learn More
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Service Modal */}
        {selectedService && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
            onClick={() => setSelectedService(null)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-32 bg-gradient-to-br ${selectedService.color || 'from-primary to-secondary'} relative`}>
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
                <div className="absolute bottom-0 left-0 p-8">
                  {(() => {
                    const Icon = getIcon(selectedService.icon);
                    return <Icon className="h-16 w-16 text-white mb-2" />;
                  })()}
                  <h3 className="text-3xl font-bold text-white">{selectedService.title}</h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{selectedService.description}</p>
                <div className="mb-6">
                  <h4 className="text-xl font-semibold mb-4">What's Included:</h4>
                  <ul className="space-y-3">
                    {selectedService.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between">
                  {selectedService.price && (
                    <p className="text-2xl font-bold text-primary">{selectedService.price}</p>
                  )}
                  <button className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}