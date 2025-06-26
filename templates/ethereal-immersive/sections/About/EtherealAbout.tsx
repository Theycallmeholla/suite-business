
import React from 'react';
import { motion } from 'framer-motion';

const EtherealAbout = ({ content }: { content: any }) => {
  const { title, paragraph } = content;

  return (
    <section className="bg-black text-white py-24 md:py-40">
      <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-5 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="md:col-span-2"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-extralight tracking-wider">{title || 'Our Vision'}</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="md:col-span-3 text-lg md:text-xl text-neutral-300 leading-relaxed"
        >
          <p>{paragraph || 'We believe that digital interaction should be an art form. Our work is a blend of cinematic storytelling, fluid animation, and interactive design to create experiences that are not just seen, but felt. We push the boundaries of the web to transport audiences to new worlds.'}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default EtherealAbout;
