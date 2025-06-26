
import React from 'react';
import { motion } from 'framer-motion';

const EtherealServices = ({ content }: { content: any }) => {
  const { title, services } = content;
  const defaultServices = [
    { name: 'Immersive Web Experiences', description: 'Multi-sensory websites that engage and inspire.' },
    { name: 'Interactive Storytelling', description: 'Narratives that unfold with user interaction.' },
    { name: 'Motion & Animation', description: 'Bringing brands to life with fluid movement.' },
  ];

  return (
    <section className="bg-black text-white py-24 md:py-40">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-serif font-extralight tracking-wider text-center mb-16"
        >
          {title || 'Our Canvas'}
        </motion.h2>
        <div className="space-y-12">
          {(services || defaultServices).map((service: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="border-t border-neutral-700 pt-8 flex justify-between items-start"
            >
              <h3 className="text-2xl md:text-3xl font-serif font-light">{service.name}</h3>
              <p className="text-neutral-400 max-w-xs text-right">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EtherealServices;
