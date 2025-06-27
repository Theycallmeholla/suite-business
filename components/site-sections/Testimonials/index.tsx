'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';

export interface Testimonial {
  id: string;
  name: string;
  title?: string;
  company?: string;
  rating: number;
  text: string;
  date?: string;
  image?: string;
}

export interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials: Testimonial[];
  variant?: 'grid' | 'carousel' | 'minimal';
}

// Grid Layout Variant
export function TestimonialsGrid({ title, subtitle, testimonials }: TestimonialsProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p 
                className="text-gray-600 text-lg max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Quote className="h-8 w-8 text-gray-300 mb-3" />
                  
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center">
                    {testimonial.image && (
                      <Avatar className="h-12 w-12 mr-4">
                        <img src={testimonial.image} alt={testimonial.name} />
                      </Avatar>
                    )}
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      {(testimonial.title || testimonial.company) && (
                        <p className="text-sm text-gray-600">
                          {testimonial.title}
                          {testimonial.title && testimonial.company && ', '}
                          {testimonial.company}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Carousel Variant
export function TestimonialsCarousel({ title, subtitle, testimonials }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p 
                className="text-gray-600 text-lg max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden">
            <motion.div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <Card className="bg-gray-50 border-0">
                    <CardContent className="p-8 md:p-12 text-center">
                      <Quote className="h-12 w-12 text-gray-300 mx-auto mb-6" />
                      
                      <p className="text-xl md:text-2xl text-gray-700 mb-8 italic leading-relaxed">
                        "{testimonial.text}"
                      </p>
                      
                      <div className="flex justify-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-6 w-6 ${
                              i < testimonial.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <div className="flex flex-col items-center">
                        {testimonial.image && (
                          <Avatar className="h-16 w-16 mb-4">
                            <img src={testimonial.image} alt={testimonial.name} />
                          </Avatar>
                        )}
                        <p className="font-semibold text-lg">{testimonial.name}</p>
                        {(testimonial.title || testimonial.company) && (
                          <p className="text-gray-600">
                            {testimonial.title}
                            {testimonial.title && testimonial.company && ', '}
                            {testimonial.company}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-gray-800' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Minimal Variant
export function TestimonialsMinimal({ title, subtitle, testimonials }: TestimonialsProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p 
                className="text-gray-600 text-lg max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="border-l-4 border-gray-200 pl-6 py-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <p className="text-gray-700 text-lg mb-4 italic">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  {(testimonial.title || testimonial.company) && (
                    <p className="text-sm text-gray-600">
                      {testimonial.title}
                      {testimonial.title && testimonial.company && ', '}
                      {testimonial.company}
                    </p>
                  )}
                </div>
                
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main component that switches between variants
export default function Testimonials(props: TestimonialsProps) {
  const { variant = 'grid' } = props;
  
  switch (variant) {
    case 'carousel':
      return <TestimonialsCarousel {...props} />;
    case 'minimal':
      return <TestimonialsMinimal {...props} />;
    default:
      return <TestimonialsGrid {...props} />;
  }
}

