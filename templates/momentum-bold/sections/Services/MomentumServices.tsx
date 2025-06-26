
import React from 'react';
import { motion } from 'framer-motion';

const MomentumServices = ({ content }: { content: any }) => {
  const { title, services } = content;
  const defaultServices = [
    { name: 'Brand Strategy', description: 'Positioning your brand for market leadership.' },
    { name: 'Web & App Development', description: 'High-performance digital products that convert.' },
    { name: 'Growth Marketing', description: 'Data-driven campaigns that fuel growth.' },
    { name: 'UI/UX Design', description: 'Intuitive interfaces that users love.' },
  ];

  return (
    <section className="bg-neutral-100 text-neutral-900 py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter text-center mb-12"
        >
          {title || 'What We Do'}
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8">
          {(services || defaultServices).map((service: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="bg-white p-8"
            >
              <h3 className="text-2xl font-bold mb-3">{service.name}</h3>
              <p className="text-neutral-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MomentumServices;
