import React from 'react';
import { motion } from 'framer-motion';

const MomentumContact = ({ content }: { content: any }) => {
  const { title, subtitle, cta } = content;

  return (
    <section className="bg-indigo-600 text-white py-20 md:py-32">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter mb-4"
        >
          {title || 'Ready to Grow?'}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="text-lg text-indigo-200 max-w-2xl mx-auto mb-8"
        >
          {subtitle || 'Let\'s talk about how we can help you achieve your goals. We are currently accepting new partners.'}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <a
            href="#"
            className="inline-block px-12 py-5 bg-white text-indigo-600 font-bold uppercase tracking-wide hover:bg-neutral-200 transition-colors duration-300"
          >
            {cta || 'Contact Us'}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default MomentumContact;