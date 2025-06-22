'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Calendar, Mail, MessageSquare, Settings, Eye, Trash2 } from 'lucide-react';
import FormBuilder from './FormBuilder';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Form {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  createdAt: Date;
  submissionsCount: number;
}

interface Site {
  id: string;
  businessName: string;
  subdomain: string;
  forms: Form[];
}

interface FormsManagerProps {
  sites: Site[];
}

const formTypeIcons: Record<string, React.ElementType> = {
  contact: MessageSquare,
  quote: FileText,
  appointment: Calendar,
  newsletter: Mail,
};

const formTypeNames: Record<string, string> = {
  contact: 'Contact Form',
  quote: 'Quote Request',
  appointment: 'Appointment Booking',
  newsletter: 'Newsletter Signup',
};

export default function FormsManager({ sites }: FormsManagerProps) {
  const [selectedSite, setSelectedSite] = useState<string>(sites[0]?.id || '');
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [forms, setForms] = useState<Form[]>(
    sites.find(s => s.id === selectedSite)?.forms || []
  );

  const currentSite = sites.find(s => s.id === selectedSite);

  const handleSiteChange = (siteId: string) => {
    setSelectedSite(siteId);
    const site = sites.find(s => s.id === siteId);
    setForms(site?.forms || []);
  };

  const handleCreateForm = () => {
    setEditingForm(null);
    setShowFormBuilder(true);
  };

  const handleEditForm = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}`);
      if (!response.ok) throw new Error('Failed to fetch form');
      const form = await response.json();
      setEditingForm(form);
      setShowFormBuilder(true);
    } catch (error) {
      toast.error('Failed to load form');
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? All submissions will be lost.')) {
      return;
    }

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete form');

      setForms(forms.filter(f => f.id !== formId));
      toast.success('Form deleted successfully');
    } catch (error) {
      toast.error('Failed to delete form');
    }
  };

  const handleToggleForm = async (formId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/forms/${formId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) throw new Error('Failed to update form');

      setForms(forms.map(f => 
        f.id === formId ? { ...f, enabled } : f
      ));
      toast.success(enabled ? 'Form enabled' : 'Form disabled');
    } catch (error) {
      toast.error('Failed to update form');
    }
  };

  const handleFormSaved = (form: Form) => {
    if (editingForm) {
      setForms(forms.map(f => f.id === form.id ? form : f));
    } else {
      setForms([form, ...forms]);
    }
    setShowFormBuilder(false);
    setEditingForm(null);
  };

  if (sites.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">No sites found. Create a site first to add forms.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Site Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Select Site:</label>
            <Select value={selectedSite} onValueChange={handleSiteChange}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sites.map(site => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.businessName} ({site.subdomain})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Form
          </Button>
        </div>

        {/* Forms Grid */}
        {forms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No forms created yet for this site.</p>
              <Button onClick={handleCreateForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {forms.map(form => {
              const Icon = formTypeIcons[form.type] || MessageSquare;
              return (
                <Card key={form.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{form.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {formTypeNames[form.type]}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={form.enabled ? "outline" : "secondary"}
                        onClick={() => handleToggleForm(form.id, !form.enabled)}
                      >
                        {form.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Submissions</span>
                        <span className="font-medium">{form.submissionsCount}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditForm(form.id)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(`/dashboard/forms/${form.id}/submissions`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteForm(form.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Builder Dialog */}
      <Dialog open={showFormBuilder} onOpenChange={setShowFormBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingForm ? 'Edit Form' : 'Create New Form'}
            </DialogTitle>
          </DialogHeader>
          <FormBuilder
            siteId={selectedSite}
            form={editingForm}
            onSave={handleFormSaved}
            onCancel={() => {
              setShowFormBuilder(false);
              setEditingForm(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
