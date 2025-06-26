
import React from 'react';
import { motion } from 'framer-motion';

const SereneContact = ({ content }: { content: any }) => {
  const { title, subtitle, email, cta } = content;

  return (
    <section className="bg-white text-neutral-800 py-20 md:py-32">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-serif font-light mb-4"
        >
          {title || 'Start a Conversation'}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="text-lg text-neutral-600 mb-8"
        >
          {subtitle || 'We would love to hear about your project.'}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <a
            href={`mailto:${email || 'hello@serene.studio'}`}
            className="inline-block px-8 py-4 border border-neutral-800 text-neutral-800 hover:bg-neutral-800 hover:text-white transition-colors duration-300"
          >
            {cta || 'Email Us'}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default SereneContact;
