import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Target,
  Award,
  Calendar,
  MoreVertical,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default async function OpportunitiesPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Mock opportunities data
  const opportunities = [
    {
      id: '1',
      title: 'Website Redesign Project',
      company: 'Tech Corp',
      value: 25000,
      stage: 'proposal',
      probability: 60,
      closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      owner: 'John Doe',
      site: { businessName: 'Main Business', id: 'site1' }
    },
    {
      id: '2',
      title: 'Annual Maintenance Contract',
      company: 'Retail Plus',
      value: 48000,
      stage: 'negotiation',
      probability: 80,
      closeDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      owner: 'Jane Smith',
      site: { businessName: 'Secondary Business', id: 'site2' }
    },
    {
      id: '3',
      title: 'E-commerce Development',
      company: 'Fashion Forward',
      value: 35000,
      stage: 'qualification',
      probability: 30,
      closeDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      owner: 'Mike Johnson',
      site: { businessName: 'Main Business', id: 'site1' }
    },
  ];

  const stats = {
    totalPipeline: 285000,
    averageDealSize: 35625,
    winRate: 32,
    dealsInProgress: 12,
  };

  const getStageInfo = (stage: string) => {
    const stages = {
      qualification: { label: 'Qualification', color: 'bg-blue-500' },
      proposal: { label: 'Proposal', color: 'bg-yellow-500' },
      negotiation: { label: 'Negotiation', color: 'bg-orange-500' },
      closed_won: { label: 'Closed Won', color: 'bg-green-500' },
      closed_lost: { label: 'Closed Lost', color: 'bg-red-500' },
    };
    return stages[stage as keyof typeof stages] || stages.qualification;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-gray-600 mt-2">
            Manage your sales opportunities and deals
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/crm/opportunities/new">
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pipeline</p>
                <p className="text-2xl font-bold">
                  ${stats.totalPipeline.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Deal Size</p>
                <p className="text-2xl font-bold">
                  ${stats.averageDealSize.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold">{stats.winRate}%</p>
              </div>
              <Award className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{stats.dealsInProgress}</p>
              </div>
              <Target className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline View */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['qualification', 'proposal', 'negotiation', 'closed_won'].map((stage) => {
              const stageInfo = getStageInfo(stage);
              const stageOpps = opportunities.filter(opp => opp.stage === stage);
              const stageValue = stageOpps.reduce((sum, opp) => sum + opp.value, 0);
              
              return (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{stageInfo.label}</h3>
                    <span className="text-sm text-gray-600">
                      {stageOpps.length} deals
                    </span>
                  </div>
                  <p className="text-lg font-semibold">
                    ${stageValue.toLocaleString()}
                  </p>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stageInfo.color}`}
                      style={{ width: `${(stageValue / stats.totalPipeline) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search opportunities..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opportunity) => {
          const stageInfo = getStageInfo(opportunity.stage);
          
          return (
            <Card key={opportunity.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                      <Badge variant="outline">{stageInfo.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {opportunity.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Close: {opportunity.closeDate.toLocaleDateString()}
                      </span>
                      <span>Owner: {opportunity.owner}</span>
                      <Link 
                        href={`/dashboard/sites/${opportunity.site.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {opportunity.site.businessName}
                      </Link>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-2xl font-bold">
                      ${opportunity.value.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress value={opportunity.probability} className="w-24" />
                      <span className="text-sm text-gray-600">
                        {opportunity.probability}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}