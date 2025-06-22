import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export default async function TestSiteSetup() {
  try {
    // Check if we have any test sites
    const testSite = await prisma.site.findFirst({
      where: { subdomain: 'demo' }
    });

    if (!testSite) {
      // Create a demo site
      await prisma.site.create({
        data: {
          subdomain: 'demo',
          businessName: 'Demo Landscaping Co.',
          userId: 'test-user-id', // This would normally come from auth
          template: 'modern',
          primaryColor: '#22C55E',
          published: true,
          
          // Business info
          phone: '(555) 123-4567',
          email: 'info@demolandscaping.com',
          address: '123 Main Street',
          city: 'Houston',
          state: 'TX',
          zip: '77001',
          
          // SEO
          metaTitle: 'Demo Landscaping - Professional Lawn Care Services',
          metaDescription: 'Transform your outdoor space with our professional landscaping services. We offer lawn care, garden design, tree trimming, and more. Serving Houston and surrounding areas.',
          
          // Create some services
          services: {
            create: [
              {
                name: 'Lawn Maintenance',
                description: 'Regular mowing, edging, and trimming to keep your lawn looking pristine',
                price: 'Starting at $50/visit',
                order: 1,
                featured: true
              },
              {
                name: 'Landscape Design',
                description: 'Custom landscape designs tailored to your property and preferences',
                price: 'Free consultation',
                order: 2,
                featured: true
              },
              {
                name: 'Tree Services',
                description: 'Professional tree trimming, pruning, and removal services',
                price: 'Quote on request',
                order: 3
              },
              {
                name: 'Irrigation Systems',
                description: 'Installation and maintenance of efficient watering systems',
                price: 'Starting at $2,500',
                order: 4
              }
            ]
          }
        }
      });
      
      logger.info('Created demo site');
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Site Setup</h1>
        <p className="mb-4">Demo site is ready!</p>
        <p className="mb-2">To test the subdomain routing:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Make sure your server is running on port 3000</li>
          <li>
            Visit{' '}
            <a href="http://demo.localhost:3000" className="text-blue-600 underline">
              http://demo.localhost:3000
            </a>
          </li>
          <li>You should see the demo landscaping site</li>
        </ol>
        
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <p className="font-semibold mb-2">Note for production:</p>
          <p>In production, you'll need to configure your DNS to point subdomains to your server.</p>
          <p>For local development, most browsers support *.localhost subdomains automatically.</p>
        </div>
      </div>
    );
  } catch (error) {
    logger.error('Error setting up test site', {}, error as Error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p>Failed to set up test site. Check the logs for details.</p>
      </div>
    );
  }
}
