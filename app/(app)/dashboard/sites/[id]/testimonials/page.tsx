import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Star, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function TestimonialsPage({ params }: PageProps) {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  const site = await prisma.site.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!site) {
    redirect('/dashboard');
  }

  // Mock testimonials - in production, these would come from the database
  const testimonials = [
    {
      id: '1',
      name: 'John Smith',
      title: 'Homeowner',
      company: 'Springfield',
      rating: 5,
      text: 'Excellent service! They transformed our backyard into a beautiful oasis. Professional, timely, and great attention to detail.',
      date: '2024-06-15',
      status: 'published',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      title: 'Property Manager',
      company: 'ABC Properties',
      rating: 5,
      text: 'We use them for all our commercial properties. Reliable, consistent, and always exceed expectations.',
      date: '2024-06-10',
      status: 'published',
    },
    {
      id: '3',
      name: 'Mike Williams',
      title: 'Business Owner',
      rating: 4,
      text: 'Great work on our office landscaping. The team was professional and delivered on time.',
      date: '2024-06-05',
      status: 'draft',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-gray-600 mt-2">
            Manage customer reviews and testimonials
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/sites/${params.id}/testimonials/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{testimonials.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">4.7</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < 4.7 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {testimonials.filter(t => t.status === 'published').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {testimonials.filter(t => t.status === 'draft').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials List */}
      <Card>
        <CardHeader>
          <CardTitle>All Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          testimonial.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {testimonial.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {testimonial.title}
                      {testimonial.company && `, ${testimonial.company}`}
                    </p>
                    
                    <p className="text-gray-700 italic">"{testimonial.text}"</p>
                    
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(testimonial.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                    >
                      <Link href={`/dashboard/sites/${params.id}/testimonials/${testimonial.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}