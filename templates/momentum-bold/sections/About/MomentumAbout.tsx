
import React from 'react';
import { motion } from 'framer-motion';

const MomentumAbout = ({ content }: { content: any }) => {
  const { title, paragraph, stats } = content;
  const defaultStats = [
    { value: '150%', label: 'Growth' },
    { value: '10x', label: 'ROI' },
    { value: '100+', label: 'Partners' },
  ];

  return (
    <section className="bg-white text-neutral-900 py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter mb-6">{title || 'Who We Are'}</h2>
          <p className="text-lg text-neutral-600 leading-relaxed">{paragraph || 'We are a results-driven team dedicated to helping ambitious companies scale. We combine strategy, design, and technology to create brands that not only look good but perform even better.'}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-8 text-center"
        >
          {(stats || defaultStats).map((stat: any, index: number) => (
            <div key={index}>
              <p className="text-5xl font-extrabold text-indigo-600">{stat.value}</p>
              <p className="text-neutral-500 uppercase tracking-widest text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MomentumAbout;
