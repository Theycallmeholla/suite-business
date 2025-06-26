
import { TemplateConfig } from '@/types/template-system';

export const sereneMinimalConfig: TemplateConfig = {
  id: 'serene-minimal',
  name: 'Serene',
  description: 'A clean, minimalist design focusing on typography and white space.',
  author: 'Gemini',
  version: '1.0.0',
  tags: ['minimal', 'clean', 'elegant', 'portfolio', 'agency'],
  compatibility: {
    industries: {
      include: ['design', 'photography', 'consulting', 'architecture', 'fashion'],
    },
  },
  sections: {
    Hero: 'SereneHero',
    About: 'SereneAbout',
    Services: 'SereneServices',
    Contact: 'SereneContact',
  },
  // More configuration can be added here
};
