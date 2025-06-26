'use client';

import { useState, useMemo, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Mail,
  Phone,
  Building2,
  MoreVertical,
  Download,
  Upload,
  X,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';

interface Contact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  tags: string[];
  customFields: any;
  createdAt: string;
  site: {
    id: string;
    businessName: string;
  };
}

interface ContactsTableProps {
  initialContacts: Contact[];
  sites: Array<{
    id: string;
    businessName: string;
  }>;
}

export default function ContactsTable({ initialContacts, sites }: ContactsTableProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get unique sources from contacts
  const sources = useMemo(() => {
    const uniqueSources = new Set(contacts.map(c => c.source).filter(Boolean));
    return Array.from(uniqueSources) as string[];
  }, [contacts]);

  // Filter contacts based on search and filters
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Search filter
      const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch = !searchTerm || 
        fullName.includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.includes(searchTerm);

      // Site filter
      const matchesSite = !selectedSite || contact.site.id === selectedSite;

      // Source filter
      const matchesSource = !selectedSource || contact.source === selectedSource;

      return matchesSearch && matchesSite && matchesSource;
    });
  }, [contacts, searchTerm, selectedSite, selectedSource]);

  // Export contacts to CSV
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/crm/contacts/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactIds: filteredContacts.map(c => c.id)
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredContacts.length} contacts`);
    } catch (error) {
      toast.error('Failed to export contacts');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Import contacts from CSV
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/crm/contacts/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Import failed');
      }

      const result = await response.json();
      
      // Refresh contacts
      const refreshResponse = await fetch('/api/crm/contacts');
      if (refreshResponse.ok) {
        const { contacts: newContacts } = await refreshResponse.json();
        setContacts(newContacts);
      }

      toast.success(`Imported ${result.imported} contacts successfully`);
      
      if (result.skipped > 0) {
        toast.info(`Skipped ${result.skipped} duplicate contacts`);
      }
      
      if (result.errors?.length > 0) {
        toast.error(`${result.errors.length} contacts had errors`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import contacts');
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearFilters = () => {
    setSelectedSite('');
    setSelectedSource('');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedSite || selectedSource || searchTerm;

  return (
    <>
      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search contacts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Site</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                >
                  <option value="">All sites</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>
                      {site.businessName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Source</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                >
                  <option value="">All sources</option>
                  {sources.map(source => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImport}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isImporting}>
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                Import from CSV
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/contacts-import-template.csv" download>
                  Download template
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="outline"
            onClick={handleExport}
            disabled={filteredContacts.length === 0 || isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : `Export (${filteredContacts.length})`}
          </Button>
          <Button asChild>
            <Link href="/dashboard/crm/contacts/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Link>
          </Button>
        </div>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {hasActiveFilters ? `Filtered Contacts (${filteredContacts.length})` : 'All Contacts'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {hasActiveFilters ? 'No contacts match your filters' : 'No contacts yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search term'
                  : 'Start building your contact list by adding your first contact'
                }
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/dashboard/crm/contacts/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Contact
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      {[contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Unnamed Contact'}
                    </TableCell>
                    <TableCell>
                      {contact.email ? (
                        <a 
                          href={`mailto:${contact.email}`}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.phone ? (
                        <a 
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/dashboard/sites/${contact.site.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contact.site.businessName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {contact.source ? (
                        <Badge variant="secondary">
                          {contact.source}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/crm/contacts/${contact.id}`}>
                              View details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/crm/contacts/${contact.id}/edit`}>
                              Edit contact
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Delete contact
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}