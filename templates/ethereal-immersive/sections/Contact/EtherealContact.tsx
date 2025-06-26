
import React from 'react';
import { motion } from 'framer-motion';

const EtherealContact = ({ content }: { content: any }) => {
  const { title, cta } = content;

  return (
    <section className="bg-black text-white py-32 md:py-48">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="text-5xl md:text-8xl font-serif font-extralight tracking-wider mb-10"
        >
          {title || 'Let's Create Magic'}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          <a
            href="#"
            className="inline-block px-10 py-4 border-2 border-white text-white uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors duration-300"
          >
            {cta || 'Get in Touch'}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default EtherealContact;
