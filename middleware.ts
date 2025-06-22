import { type NextRequest, NextResponse } from 'next/server';
import { rootDomain } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

// Cache for custom domain lookups (in production, use Redis)
const customDomainCache = new Map<string, string | null>();

async function getSubdomainFromCustomDomain(hostname: string): Promise<string | null> {
  // Check cache first
  if (customDomainCache.has(hostname)) {
    return customDomainCache.get(hostname) || null;
  }

  try {
    // Look up the site by custom domain
    const site = await prisma.site.findUnique({
      where: { customDomain: hostname },
      select: { subdomain: true }
    });

    const subdomain = site?.subdomain || null;
    
    // Cache the result for 5 minutes
    customDomainCache.set(hostname, subdomain);
    setTimeout(() => customDomainCache.delete(hostname), 5 * 60 * 1000);
    
    return subdomain;
  } catch (error) {
    console.error('Error looking up custom domain:', error);
    return null;
  }
}

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];
  
  // First check if it's a subdomain
  let subdomain = extractSubdomain(request);
  
  // If not a subdomain, check if it's a custom domain
  if (!subdomain && !hostname.includes('localhost') && hostname !== rootDomain.split(':')[0]) {
    subdomain = await getSubdomainFromCustomDomain(hostname);
  }

  if (subdomain) {
    // Block access to admin page from subdomains/custom domains
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // For the root path on a subdomain/custom domain, rewrite to the subdomain page
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/s/${subdomain}`, request.url));
    }
  }

  // On the root domain, allow normal access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|[\\w-]+\\.\\w+).*)'
  ]
};
