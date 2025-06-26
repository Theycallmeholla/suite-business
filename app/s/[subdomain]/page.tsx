import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteBySubdomain } from '@/lib/site-data';
import { generateDefaultSections } from '@/lib/site-builder';
import { SectionRenderer } from '@/components/SectionRenderer';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import TemplateRenderer from '@/components/TemplateRenderer';
import { getDefaultTemplateForIndustry } from '@/lib/template-registry';
import { Phone } from 'lucide-react';

export async function generateMetadata({
  params
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const site = await getSiteBySubdomain(subdomain);

  if (!site) {
    return {
      title: 'Site Not Found'
    };
  }

  return {
    title: site.metaTitle || site.businessName,
    description: site.metaDescription || `Welcome to ${site.businessName}`,
    openGraph: {
      title: site.metaTitle || site.businessName,
      description: site.metaDescription || `Welcome to ${site.businessName}`,
      type: 'website',
    },
  };
}

export default async function SubdomainPage({
  params
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const site = await getSiteBySubdomain(subdomain);

  if (!site) {
    notFound();
  }

  // Get template for the site
  const template = site.template ? 
    getDefaultTemplateForIndustry(site.template) : 
    getDefaultTemplateForIndustry(site.industry);
  
  // Determine if we should use template renderer
  const useTemplateRenderer = template && (
    site.template === 'dream-garden' || 
    site.template === 'nature-premium' || 
    site.template === 'emerald-elegance' ||
    site.template === 'artistry-minimal'
  );
  
  // Get page content - either from database or generate default
  let sections;
  
  if (!useTemplateRenderer) {
    // Use legacy section renderer
    const homePage = site.pages.find(p => p.type === 'home');
    if (homePage && homePage.content && typeof homePage.content === 'object' && 'sections' in homePage.content) {
      sections = (homePage.content as any).sections;
    } else {
      // Generate default sections based on available data
      sections = generateDefaultSections(site);
    }
  }

  return (
    <ThemeProvider 
      primaryColor={site.primaryColor}
      secondaryColor={site.secondaryColor || undefined}
      accentColor={site.accentColor || undefined}
      template={site.template}
      industry={site.industry}
    >
      {/* Simple header */}
      <header className="absolute top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {site.logo ? (
                <img src={site.logo} alt={site.businessName} className="h-8" />
              ) : (
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {site.businessName}
                </h1>
              )}
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="hover:opacity-80 transition-opacity">Services</a>
              <a href="#about" className="hover:opacity-80 transition-opacity">About</a>
              <a href="#contact" className="hover:opacity-80 transition-opacity">Contact</a>
              {site.phone && (
                <a 
                  href={`tel:${site.phone}`}
                  className="flex items-center gap-2 font-semibold"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <Phone className="w-4 h-4" />
                  {site.phone}
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16">
        {useTemplateRenderer ? (
          <TemplateRenderer template={template} site={site} isEditable={false} />
        ) : (
          <SectionRenderer sections={sections} siteData={site} />
        )}
      </main>

      {/* Simple footer */}
      <footer className="py-8 mt-16" style={{ backgroundColor: 'var(--color-neutral-dark)', color: 'var(--color-background)' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="font-semibold">{site.businessName}</p>
              {site.address && (
                <p className="text-sm opacity-75">
                  {site.address}, {site.city}, {site.state} {site.zip}
                </p>
              )}
            </div>
            
            <div className="text-center md:text-right">
              {site.phone && (
                <p className="text-sm">
                  Call: <a href={`tel:${site.phone}`} className="hover:underline">{site.phone}</a>
                </p>
              )}
              {site.email && (
                <p className="text-sm">
                  Email: <a href={`mailto:${site.email}`} className="hover:underline">{site.email}</a>
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t text-center text-sm opacity-60" style={{ borderColor: 'var(--color-neutral)' }}>
            <p>&copy; {new Date().getFullYear()} {site.businessName}. All rights reserved.</p>
            <p className="mt-2">
              Powered by{' '}
              <Link href="https://suitebusiness.com" className="hover:opacity-100">
                SiteBango
              </Link>
            </p>
          </div>
        </div>
      </footer>

      {/* Analytics tracking */}
      <script 
        src="/analytics.js" 
        data-site-id={site.id}
        defer
      />
    </ThemeProvider>
  );
}
