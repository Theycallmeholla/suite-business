'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SubmissionsViewerProps {
  form: any;
  submissions: any[];
}

export default function SubmissionsViewer({ form, submissions: initialSubmissions }: SubmissionsViewerProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);

  const fields = form.fields || [];

  const handleSelectAll = () => {
    if (selectedSubmissions.length === submissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(submissions.map(s => s.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedSubmissions.includes(id)) {
      setSelectedSubmissions(selectedSubmissions.filter(s => s !== id));
    } else {
      setSelectedSubmissions([...selectedSubmissions, id]);
    }
  };

  const handleExportCSV = () => {
    try {
      // Create CSV header
      const headers = ['Submitted At', ...fields.map((f: any) => f.label), 'IP Address', 'User Agent'];
      const csvRows = [headers];

      // Add data rows
      submissions.forEach(submission => {
        const row = [
          format(new Date(submission.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          ...fields.map((f: any) => {
            const value = submission.data[f.name];
            if (Array.isArray(value)) {
              return value.join(', ');
            }
            return value || '';
          }),
          submission.metadata?.ip || '',
          submission.metadata?.userAgent || '',
        ];
        csvRows.push(row);
      });

      // Convert to CSV string
      const csvContent = csvRows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.name.toLowerCase().replace(/\s+/g, '-')}-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Submissions exported successfully');
    } catch (error) {
      toast.error('Failed to export submissions');
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} submission(s)?`)) {
      return;
    }

    try {
      const response = await fetch('/api/forms/submissions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) throw new Error('Failed to delete submissions');

      setSubmissions(submissions.filter(s => !ids.includes(s.id)));
      setSelectedSubmissions([]);
      toast.success(`Deleted ${ids.length} submission(s)`);
    } catch (error) {
      toast.error('Failed to delete submissions');
    }
  };

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">No submissions yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Submissions will appear here when users fill out this form.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedSubmissions.length === submissions.length ? 'Deselect All' : 'Select All'}
          </Button>
          {selectedSubmissions.length > 0 && (
            <span className="text-sm text-gray-500">
              {selectedSubmissions.length} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          {selectedSubmissions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(selectedSubmissions)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          )}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map(submission => (
          <Card key={submission.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.includes(submission.id)}
                    onChange={() => handleSelect(submission.id)}
                    className="h-4 w-4 text-primary"
                  />
                  <CardTitle className="text-base">
                    {submission.data.firstName || submission.data.name || 'Anonymous'} {submission.data.lastName || ''}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {submission.ghlContactId && (
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      GHL Synced
                    </span>
                  )}
                  <time dateTime={submission.createdAt}>
                    {format(new Date(submission.createdAt), 'MMM d, yyyy h:mm a')}
                  </time>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field: any) => {
                  const value = submission.data[field.name];
                  if (!value) return null;
                  
                  return (
                    <div key={field.id}>
                      <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {Array.isArray(value) ? value.join(', ') : value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              
              {/* Metadata */}
              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>IP: {submission.metadata?.ip || 'Unknown'}</span>
                  <span>Source: {submission.metadata?.referrer || 'Direct'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
