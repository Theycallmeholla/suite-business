'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MoreVertical, 
  Phone, 
  Mail, 
  Search,
  Filter,
  User,
  Trash,
  Edit,
  Clock,
  Target,
  Plus,
  Flame,
  ThermometerSun,
  Snowflake,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface LeadsTableProps {
  sites: { id: string; businessName: string; subdomain: string }[];
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  source: string;
  status: string;
  temperature: string;
  score: number;
  dealValue: number | null;
  assignedTo: string | null;
  createdAt: string;
  site: {
    id: string;
    businessName: string;
  };
  contact: {
    id: string;
  } | null;
}

export default function LeadsTable({ sites }: LeadsTableProps) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeads();
  }, [selectedSite, selectedStatus, page]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (selectedSite !== 'all') {
        params.append('siteId', selectedSite);
      } else {
        // Add all site IDs
        sites.forEach(site => params.append('siteId', site.id));
      }
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const response = await fetch(`/api/leads?${params}`);
      const data = await response.json();

      if (response.ok) {
        setLeads(data.leads);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

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
        return <Flame className="h-4 w-4 text-red-500" />;
      case 'warm':
        return <ThermometerSun className="h-4 w-4 text-orange-500" />;
      case 'cold':
      default:
        return <Snowflake className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await fetch(`/api/leads?leadId=${leadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Lead deleted successfully');
        fetchLeads();
      } else {
        toast.error('Failed to delete lead');
      }
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.firstName.toLowerCase().includes(query) ||
      (lead.lastName?.toLowerCase() || '').includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      (lead.company?.toLowerCase() || '').includes(query)
    );
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0 && selectedSite === 'all' && selectedStatus === 'all') {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
        <p className="text-gray-600 mb-4">
          Start capturing leads from your website forms
        </p>
        <Button asChild>
          <Link href="/dashboard/forms">
            <Plus className="h-4 w-4 mr-2" />
            Set Up Forms
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search leads..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedSite} onValueChange={setSelectedSite}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Sites" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sites</SelectItem>
            {sites.map(site => (
              <SelectItem key={site.id} value={site.id}>
                {site.businessName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="unqualified">Unqualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filteredLeads.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No leads match your filters
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow 
                  key={lead.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/dashboard/crm/leads/${lead.id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getTemperatureIcon(lead.temperature)}
                      <div>
                        {lead.firstName} {lead.lastName || ''}
                        {lead.company && (
                          <div className="text-sm text-gray-500">{lead.company}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <a 
                        href={`mailto:${lead.email}`}
                        className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </a>
                      {lead.phone && (
                        <a 
                          href={`tel:${lead.phone}`}
                          className="flex items-center gap-1 text-sm text-gray-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className="text-sm font-medium">{lead.score}</div>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell>
                    {lead.dealValue ? (
                      <span className="font-medium">
                        ${lead.dealValue.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/dashboard/sites/${lead.site.id}`}
                      className="text-blue-600 hover:underline text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {lead.site.businessName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/crm/leads/${lead.id}`);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/crm/leads/${lead.id}/assign`);
                        }}>
                          <User className="h-4 w-4 mr-2" />
                          Assign
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLead(lead.id);
                          }}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}