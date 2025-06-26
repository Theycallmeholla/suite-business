
import React from 'react';
import { motion } from 'framer-motion';

const SereneAbout = ({ content }: { content: any }) => {
  const { title, paragraph1, paragraph2 } = content;

  return (
    <section className="bg-white text-neutral-800 py-20 md:py-32">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-serif font-light mb-8 text-center"
        >
          {title || 'About Our Studio'}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="space-y-6 text-neutral-600 text-lg leading-relaxed max-w-2xl mx-auto"
        >
          <p>{paragraph1 || 'We are a collective of designers, strategists, and storytellers passionate about creating brands that endure. Our approach is collaborative, transparent, and tailored to the unique needs of each client.'}</p>
          <p>{paragraph2 || 'With a focus on minimalist aesthetics and user-centric design, we strive to create digital experiences that are not only beautiful but also intuitive and effective.'}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default SereneAbout;
