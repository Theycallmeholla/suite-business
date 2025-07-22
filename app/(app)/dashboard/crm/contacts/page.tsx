import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  Users, 
  Calendar,
  Building2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import ContactsTable from './ContactsTable';

export default async function ContactsPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Get all contacts from all user's sites
  const contacts = (await prisma.contact.findMany({
    where: {
      site: {
        userId: session.user.id
      }
    },
    include: {
      site: {
        select: {
          businessName: true,
          id: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })).map(contact => ({
    ...contact,
    createdAt: contact.createdAt.toISOString(), // Convert Date to string
  }));

  const totalContacts = await prisma.contact.count({
    where: {
      site: {
        userId: session.user.id
      }
    }
  });

  const recentContacts = await prisma.contact.count({
    where: {
      site: {
        userId: session.user.id
      },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  });

  // Get unique sites for filtering
  const sites = await prisma.site.findMany({
    where: {
      userId: session.user.id
    },
    select: {
      id: true,
      businessName: true
    },
    orderBy: { businessName: 'asc' }
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-gray-600 mt-2">
            Manage all your customer contacts in one place
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold">{totalContacts}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold">{recentContacts}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sites</p>
                <p className="text-2xl font-bold">
                  {new Set(contacts.map(c => c.siteId)).size}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table with Search, Filters, Import/Export */}
      <ContactsTable 
        initialContacts={contacts} 
        sites={sites}
      />
    </div>
  );
}