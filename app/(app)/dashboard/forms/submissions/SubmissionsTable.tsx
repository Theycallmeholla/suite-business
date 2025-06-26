'use client';

import { useState } from 'react';
import { 
  FileText, 
  Eye,
  Trash2,
  Mail,
  Phone,
  Clock,
  CheckSquare,
  Square,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

interface Submission {
  id: string;
  data: any;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  formId: string;
  form: {
    id: string;
    name: string;
    site: {
      id: string;
      businessName: string;
    };
  };
}

interface SubmissionsTableProps {
  initialSubmissions: Submission[];
}

export function SubmissionsTable({ initialSubmissions }: SubmissionsTableProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);

  // Parse submission data to extract common fields
  const parseSubmissionData = (data: any) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return {
        name: parsed.name || parsed.fullName || parsed.firstName || 'N/A',
        email: parsed.email || parsed.emailAddress || 'N/A',
        phone: parsed.phone || parsed.phoneNumber || 'N/A',
        message: parsed.message || parsed.comments || parsed.inquiry || '',
      };
    } catch {
      return {
        name: 'N/A',
        email: 'N/A',
        phone: 'N/A',
        message: '',
      };
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === submissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(submissions.map(s => s.id)));
    }
  };

  const markAsRead = async (submissionIds: string[], isRead: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/forms/submissions/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionIds, isRead })
      });

      if (!response.ok) {
        throw new Error('Failed to update submissions');
      }

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          submissionIds.includes(sub.id) 
            ? { ...sub, isRead, readAt: isRead ? new Date().toISOString() : null }
            : sub
        )
      );

      // Clear selection
      setSelectedIds(new Set());

      toast.success(`Marked ${submissionIds.length} submission(s) as ${isRead ? 'read' : 'unread'}`);
    } catch (error) {
      toast.error('Failed to update submissions');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteSubmissions = async (submissionIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${submissionIds.length} submission(s)?`)) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/forms/submissions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionIds })
      });

      if (!response.ok) {
        throw new Error('Failed to delete submissions');
      }

      // Update local state
      setSubmissions(prev => prev.filter(sub => !submissionIds.includes(sub.id)));
      
      // Clear selection
      setSelectedIds(new Set());

      toast.success(`Deleted ${submissionIds.length} submission(s)`);
    } catch (error) {
      toast.error('Failed to delete submissions');
    } finally {
      setIsUpdating(false);
    }
  };

  const hasSelection = selectedIds.size > 0;
  const unreadCount = submissions.filter(s => !s.isRead).length;

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {hasSelection && (
        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => markAsRead(Array.from(selectedIds), true)}
            disabled={isUpdating}
          >
            <Eye className="h-4 w-4 mr-2" />
            Mark as Read
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => markAsRead(Array.from(selectedIds), false)}
            disabled={isUpdating}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Mark as Unread
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteSubmissions(Array.from(selectedIds))}
            disabled={isUpdating}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
          <p className="text-gray-600 mb-4">
            Form submissions will appear here once visitors start submitting your forms
          </p>
          <Button asChild>
            <Link href="/dashboard/forms">
              View Forms
            </Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedIds.size === submissions.length && submissions.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-8"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => {
              const data = parseSubmissionData(submission.data);
              const isSelected = selectedIds.has(submission.id);
              
              return (
                <TableRow 
                  key={submission.id} 
                  className={`${submission.isRead ? '' : 'bg-blue-50/50'} ${isSelected ? 'bg-gray-50' : ''}`}
                >
                  <TableCell>
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(submission.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {!submission.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" title="Unread" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {data.name}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {data.email !== 'N/A' && (
                        <a 
                          href={`mailto:${data.email}`}
                          className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          <Mail className="h-3 w-3" />
                          {data.email}
                        </a>
                      )}
                      {data.phone !== 'N/A' && (
                        <a 
                          href={`tel:${data.phone}`}
                          className="flex items-center gap-1 text-sm text-gray-600"
                        >
                          <Phone className="h-3 w-3" />
                          {data.phone}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/dashboard/forms/${submission.form.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {submission.form.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/dashboard/sites/${submission.form.site.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {submission.form.site.businessName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => markAsRead([submission.id], !submission.isRead)}
                        title={submission.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        {submission.isRead ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/forms/submissions/${submission.id}`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteSubmissions([submission.id])}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}