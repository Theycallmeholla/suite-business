import { redirect, notFound } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  DollarSign,
  User,
  MapPin,
  Globe,
  Tag,
  Flame,
  ThermometerSun,
  Snowflake,
  Edit,
  Trash,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LeadActivities from './LeadActivities';
import LeadStatusUpdate from './LeadStatusUpdate';
import LeadAssignment from './LeadAssignment';

interface PageProps {
  params: { id: string };
}

export default async function LeadDetailPage({ params }: PageProps) {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Get the lead with all related data
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      site: {
        include: {
          team: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
      contact: true,
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!lead) {
    notFound();
  }

  // Verify user has access
  const hasAccess = 
    lead.site.userId === session.user.id ||
    lead.site.team?.members.some(m => m.userId === session.user.id);

  if (!hasAccess) {
    redirect('/dashboard/crm/leads');
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'New', className: 'bg-blue-100 text-blue-800' },
      contacted: { label: 'Contacted', className: 'bg-yellow-100 text-yellow-800' },
      qualified: { label: 'Qualified', className: 'bg-green-100 text-green-800' },
      unqualified: { label: 'Unqualified', className: 'bg-gray-100 text-gray-800' },
      converted: { label: 'Converted', className: 'bg-purple-100 text-purple-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTemperatureIcon = (temperature: string) => {
    switch (temperature) {
      case 'hot':
        return <Flame className="h-5 w-5 text-red-500" />;
      case 'warm':
        return <ThermometerSun className="h-5 w-5 text-orange-500" />;
      case 'cold':
      default:
        return <Snowflake className="h-5 w-5 text-blue-500" />;
    }
  };

  const assignedUser = lead.assignedTo 
    ? lead.site.team?.members.find(m => m.userId === lead.assignedTo)?.user
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crm/leads">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {lead.firstName} {lead.lastName || ''}
          </h1>
          {getStatusBadge(lead.status)}
          <div className="flex items-center gap-1">
            {getTemperatureIcon(lead.temperature)}
            <span className="text-sm capitalize">{lead.temperature}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-red-600">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                      {lead.email}
                    </a>
                  </div>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                        {lead.phone}
                      </a>
                    </div>
                  </div>
                )}
                {lead.company && (
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p>{lead.company}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Source</p>
                    <p>{lead.source}</p>
                  </div>
                </div>
              </div>

              {/* UTM Parameters */}
              {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Campaign Tracking</p>
                  <div className="flex flex-wrap gap-2">
                    {lead.utmSource && (
                      <Badge variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        Source: {lead.utmSource}
                      </Badge>
                    )}
                    {lead.utmMedium && (
                      <Badge variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        Medium: {lead.utmMedium}
                      </Badge>
                    )}
                    {lead.utmCampaign && (
                      <Badge variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        Campaign: {lead.utmCampaign}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Source URL */}
              {lead.sourceUrl && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Captured From</p>
                  <a 
                    href={lead.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3" />
                    {lead.sourceUrl}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {lead.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Form Data */}
          {lead.formData && Object.keys(lead.formData).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Form Submission Data</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  {Object.entries(lead.formData as Record<string, any>).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b last:border-0">
                      <dt className="text-sm font-medium text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadActivities leadId={lead.id} initialActivities={lead.activities} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Details */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-semibold">{lead.score}/100</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${lead.score}%` }}
                    />
                  </div>
                </div>
              </div>

              {lead.dealValue && (
                <div>
                  <p className="text-sm text-gray-600">Deal Value</p>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {lead.dealValue.toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                </p>
              </div>

              {lead.lastContactedAt && (
                <div>
                  <p className="text-sm text-gray-600">Last Contacted</p>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(lead.lastContactedAt), { addSuffix: true })}
                  </p>
                </div>
              )}

              {lead.nextFollowUp && (
                <div>
                  <p className="text-sm text-gray-600">Next Follow-up</p>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(lead.nextFollowUp).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Business</p>
                <Link 
                  href={`/dashboard/sites/${lead.site.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {lead.site.businessName}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadAssignment 
                leadId={lead.id} 
                currentAssignee={assignedUser}
                teamMembers={lead.site.team?.members || []}
              />
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadStatusUpdate 
                leadId={lead.id} 
                currentStatus={lead.status}
                currentTemperature={lead.temperature}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}