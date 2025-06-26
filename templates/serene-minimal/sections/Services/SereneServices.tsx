
import React from 'react';
import { motion } from 'framer-motion';

const SereneServices = ({ content }: { content: any }) => {
  const { title, services } = content;
  const defaultServices = [
    { name: 'Brand Identity', description: 'Crafting unique visual systems that tell your story.' },
    { name: 'Web Design & Development', description: 'Building responsive, high-performance websites.' },
    { name: 'Digital Strategy', description: 'Creating data-driven strategies for growth.' },
  ];

  return (
    <section className="bg-neutral-50 text-neutral-800 py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-serif font-light mb-12 text-center"
        >
          {title || 'Our Services'}
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-10">
          {(services || defaultServices).map((service: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-neutral-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SereneServices;
