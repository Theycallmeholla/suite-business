import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteBySubdomain } from '@/lib/site-data';
import { generateDefaultSections } from '@/lib/site-builder';
import { SectionRenderer } from '@/components/SectionRenderer';
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

  // Get page content - either from database or generate default
  let sections;
  
  // Check if we have custom page content
  const homePage = site.pages.find(p => p.type === 'home');
  if (homePage && homePage.content && homePage.content.sections) {
    sections = homePage.content.sections;
  } else {
    // Generate default sections based on available data
    sections = generateDefaultSections(site);
  }

  return (
    <>
      {/* Simple header */}
      <header className="absolute top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {site.logo ? (
                <img src={site.logo} alt={site.businessName} className="h-8" />
              ) : (
                <h1 className="text-xl font-bold" style={{ color: site.primaryColor }}>
                  {site.businessName}
                </h1>
              )}
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="hover:text-gray-600">Services</a>
              <a href="#about" className="hover:text-gray-600">About</a>
              <a href="#contact" className="hover:text-gray-600">Contact</a>
              {site.phone && (
                <a 
                  href={`tel:${site.phone}`}
                  className="flex items-center gap-2 font-semibold"
                  style={{ color: site.primaryColor }}
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
        <SectionRenderer sections={sections} siteData={site} />
      </main>

      {/* Simple footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="font-semibold">{site.businessName}</p>
              {site.address && (
                <p className="text-sm text-gray-400">
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
          
          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {site.businessName}. All rights reserved.</p>
            <p className="mt-2">
              Powered by{' '}
              <Link href="https://suitebusiness.com" className="hover:text-white">
                Suite Business
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
