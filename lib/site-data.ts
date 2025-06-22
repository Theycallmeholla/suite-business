import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { logger } from '@/lib/logger';

export interface SiteWithPages {
  id: string;
  userId: string;
  businessName: string;
  subdomain: string;
  customDomain: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  ghlLocationId: string | null;
  ghlApiKey: string | null;
  ghlEnabled: boolean;
  template: string;
  primaryColor: string;
  logo: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  pages: Array<{
    id: string;
    slug: string;
    title: string;
    content: any;
    type: string;
  }>;
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    price: string | null;
    image: string | null;
    featured: boolean;
    order: number;
  }>;
}

// Cache the function to prevent multiple DB calls for the same request
export const getSiteBySubdomain = cache(async (subdomain: string): Promise<SiteWithPages | null> => {
  try {
    const site = await prisma.site.findUnique({
      where: { 
        subdomain: subdomain.toLowerCase(),
        // In development, show all sites; in production, only published
        ...(process.env.NODE_ENV === 'production' && { published: true })
      },
      include: {
        pages: {
          where: {
            type: 'home' // For now, just get the home page
          }
        },
        services: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!site) {
      logger.info('Site not found', { subdomain });
      return null;
    }

    return site;
  } catch (error) {
    logger.error('Error fetching site data', { subdomain }, error as Error);
    return null;
  }
});

// Get site by custom domain
export const getSiteByDomain = cache(async (domain: string): Promise<SiteWithPages | null> => {
  try {
    const site = await prisma.site.findUnique({
      where: { 
        customDomain: domain.toLowerCase(),
        published: true
      },
      include: {
        pages: {
          where: {
            type: 'home'
          }
        },
        services: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return site;
  } catch (error) {
    logger.error('Error fetching site by domain', { domain }, error as Error);
    return null;
  }
});
