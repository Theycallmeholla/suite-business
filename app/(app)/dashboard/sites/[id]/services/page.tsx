import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Plus, Edit, Trash2, Save, X, 
  GripVertical, Star, Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { DeleteServiceButton } from './DeleteServiceButton';

async function addService(siteId: string, formData: FormData) {
  'use server';
  
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      userId: session.user.id,
    },
  });

  if (!site) {
    throw new Error('Site not found');
  }

  const maxOrder = await prisma.service.findFirst({
    where: { siteId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  await prisma.service.create({
    data: {
      siteId,
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      price: formData.get('price') as string || null,
      featured: formData.get('featured') === 'on',
      order: (maxOrder?.order || 0) + 1,
    },
  });

  revalidatePath(`/dashboard/sites/${siteId}/services`);
}

async function updateService(serviceId: string, formData: FormData) {
  'use server';
  
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId },
    include: { site: true },
  });

  if (!service || service.site.userId !== session.user.id) {
    throw new Error('Service not found');
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      price: formData.get('price') as string || null,
      featured: formData.get('featured') === 'on',
    },
  });

  revalidatePath(`/dashboard/sites/${service.siteId}/services`);
}

async function deleteService(serviceId: string) {
  'use server';
  
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId },
    include: { site: true },
  });

  if (!service || service.site.userId !== session.user.id) {
    throw new Error('Service not found');
  }

  await prisma.service.delete({
    where: { id: serviceId },
  });

  revalidatePath(`/dashboard/sites/${service.siteId}/services`);
}

export default async function SiteServicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  const site = await prisma.site.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      services: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!site) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href={`/dashboard/sites/${site.id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Site Dashboard
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Services</h1>
            <p className="text-gray-600 mt-1">
              Manage the services your business offers
            </p>
          </div>
        </div>
      </div>

      {/* Add New Service Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Service</CardTitle>
          <CardDescription>
            Add a service to showcase on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={addService.bind(null, site.id)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Lawn Mowing"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price (optional)</Label>
                <Input
                  id="price"
                  name="price"
                  placeholder="e.g., Starting at $50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe this service..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                className="rounded border-gray-300"
              />
              <Label htmlFor="featured" className="font-normal">
                Feature this service (shows prominently on your site)
              </Label>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Services List */}
      {site.services.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No services yet</h3>
            <p className="text-gray-600">
              Add your first service above to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Current Services ({site.services.length})</h2>
          
          {site.services.map((service, index) => (
            <Card key={service.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-1 text-gray-400 cursor-move">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        {service.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-gray-600 mb-2">{service.description}</p>
                      )}
                      {service.price && (
                        <p className="text-sm font-medium text-gray-700">
                          {service.price}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <form action={deleteService.bind(null, service.id)}>
                      <DeleteServiceButton />
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">Note</h3>
        <p className="text-yellow-800">
          Advanced editing features like reordering and inline editing are coming soon. 
          For now, you can add and delete services to manage your offerings.
        </p>
      </div>
    </div>
  );
}