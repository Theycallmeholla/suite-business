'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, GripVertical, Settings, Eye, Palette } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time';
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: string; // For date/time
    max?: string; // For date/time
  };
}

interface FormSettings {
  submitButtonText: string;
  successMessage: string;
  redirectUrl?: string;
  emailNotifications: boolean;
  notificationEmail?: string;
  ghlSync: boolean;
}

interface FormBuilderProps {
  siteId: string;
  form?: any;
  onSave: (form: any) => void;
  onCancel: () => void;
}

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
];

const formTypes = [
  { value: 'contact', label: 'Contact Form' },
  { value: 'quote', label: 'Quote Request' },
  { value: 'appointment', label: 'Appointment Booking' },
  { value: 'newsletter', label: 'Newsletter Signup' },
];

// Sortable Field Item Component
function SortableFieldItem({ field, index, updateField, removeField, fields }: {
  field: FormField;
  index: number;
  updateField: (id: string, updates: Partial<FormField>) => void;
  removeField: (id: string) => void;
  fields: FormField[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="mt-2 cursor-move" {...attributes} {...listeners}>
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <Label>Field Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(value) => updateField(field.id, { type: value as FormField['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Field Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  placeholder="Field Label"
                />
              </div>
              
              <div>
                <Label>Field Name</Label>
                <Input
                  value={field.name}
                  onChange={(e) => updateField(field.id, { name: e.target.value })}
                  placeholder="field_name"
                />
              </div>
              
              <div>
                <Label>Placeholder</Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeField(field.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pl-9">
            <div className="flex items-center gap-2">
              <Switch
                id={`required-${field.id}`}
                checked={field.required}
                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
              />
              <Label htmlFor={`required-${field.id}`}>Required</Label>
            </div>
            
            {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
              <div className="flex-1">
                <Label>Options (comma separated)</Label>
                <Input
                  value={field.options?.join(', ') || ''}
                  onChange={(e) => updateField(field.id, { 
                    options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) 
                  })}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Form Preview Component
function FormPreview({ fields, settings }: { fields: FormField[]; settings: FormSettings }) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            {field.type === 'text' && (
              <Input
                id={field.id}
                type="text"
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
            
            {field.type === 'email' && (
              <Input
                id={field.id}
                type="email"
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
            
            {field.type === 'phone' && (
              <Input
                id={field.id}
                type="tel"
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
            
            {field.type === 'textarea' && (
              <Textarea
                id={field.id}
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
              />
            )}
            
            {field.type === 'select' && (
              <Select required={field.required}>
                <SelectTrigger id={field.id}>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {field.type === 'radio' && (
              <RadioGroup required={field.required}>
                {field.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                    <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {field.type === 'checkbox' && (
              <div className="space-y-2">
                {field.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox id={`${field.id}-${option}`} />
                    <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                  </div>
                ))}
              </div>
            )}
            
            {field.type === 'date' && (
              <Input
                id={field.id}
                type="date"
                required={field.required}
                min={field.validation?.min}
                max={field.validation?.max}
              />
            )}
            
            {field.type === 'time' && (
              <Input
                id={field.id}
                type="time"
                required={field.required}
              />
            )}
          </div>
        ))}
        
        <Button type="submit" className="w-full">
          {settings.submitButtonText}
        </Button>
      </form>
    </div>
  );
}

export default function FormBuilder({ siteId, form, onSave, onCancel }: FormBuilderProps) {
  const [formName, setFormName] = useState(form?.name || '');
  const [formType, setFormType] = useState(form?.type || 'contact');
  const [fields, setFields] = useState<FormField[]>(form?.fields || []);
  const [settings, setSettings] = useState<FormSettings>(form?.settings || {
    submitButtonText: 'Submit',
    successMessage: 'Thank you! We\'ll be in touch soon.',
    emailNotifications: false,
    ghlSync: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load default fields based on form type
  useEffect(() => {
    if (!form && fields.length === 0) {
      setFields(getDefaultFields(formType));
    }
  }, [formType, form, fields.length]);

  const getDefaultFields = (type: string): FormField[] => {
    const baseFields = [
      {
        id: generateId(),
        type: 'text' as const,
        label: 'First Name',
        name: 'firstName',
        placeholder: 'John',
        required: true,
      },
      {
        id: generateId(),
        type: 'text' as const,
        label: 'Last Name',
        name: 'lastName',
        placeholder: 'Doe',
        required: false,
      },
      {
        id: generateId(),
        type: 'email' as const,
        label: 'Email',
        name: 'email',
        placeholder: 'john@example.com',
        required: true,
      },
      {
        id: generateId(),
        type: 'phone' as const,
        label: 'Phone',
        name: 'phone',
        placeholder: '(555) 123-4567',
        required: false,
      },
    ];

    switch (type) {
      case 'quote':
        return [
          ...baseFields,
          {
            id: generateId(),
            type: 'select' as const,
            label: 'Service Needed',
            name: 'service',
            required: true,
            options: ['Lawn Care', 'Landscaping', 'Tree Service', 'Other'],
          },
          {
            id: generateId(),
            type: 'textarea' as const,
            label: 'Project Details',
            name: 'details',
            placeholder: 'Please describe your project...',
            required: true,
          },
        ];
      case 'appointment':
        return [
          ...baseFields,
          {
            id: generateId(),
            type: 'date' as const,
            label: 'Preferred Date',
            name: 'preferredDate',
            required: true,
            validation: {
              min: new Date().toISOString().split('T')[0], // Today
            },
          },
          {
            id: generateId(),
            type: 'select' as const,
            label: 'Preferred Time',
            name: 'preferredTime',
            required: true,
            options: ['Morning (8am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-8pm)'],
          },
        ];
      case 'newsletter':
        return [
          {
            id: generateId(),
            type: 'email' as const,
            label: 'Email',
            name: 'email',
            placeholder: 'your@email.com',
            required: true,
          },
          {
            id: generateId(),
            type: 'text' as const,
            label: 'Name',
            name: 'name',
            placeholder: 'Your name',
            required: false,
          },
        ];
      default: // contact
        return [
          ...baseFields,
          {
            id: generateId(),
            type: 'textarea' as const,
            label: 'Message',
            name: 'message',
            placeholder: 'How can we help you?',
            required: false,
          },
        ];
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addField = () => {
    const newField: FormField = {
      id: generateId(),
      type: 'text',
      label: 'New Field',
      name: `field_${generateId()}`,
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < fields.length) {
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      setFields(newFields);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Please enter a form name');
      return;
    }

    if (fields.length === 0) {
      toast.error('Please add at least one field');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        siteId,
        name: formName,
        type: formType,
        fields,
        settings,
      };

      const url = form ? `/api/forms/${form.id}` : '/api/forms';
      const method = form ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save form');

      const savedForm = await response.json();
      toast.success(form ? 'Form updated successfully' : 'Form created successfully');
      onSave(savedForm);
    } catch (error) {
      toast.error('Failed to save form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs defaultValue="builder" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="builder">
          <Settings className="h-4 w-4 mr-2" />
          Builder
        </TabsTrigger>
        <TabsTrigger value="preview">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </TabsTrigger>
        <TabsTrigger value="style">
          <Palette className="h-4 w-4 mr-2" />
          Style
        </TabsTrigger>
      </TabsList>

      <TabsContent value="builder" className="space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="formName">Form Name</Label>
              <Input
                id="formName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contact Form"
              />
            </div>
            
            <div>
              <Label htmlFor="formType">Form Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger id="formType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Form Fields with Drag and Drop */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Form Fields</CardTitle>
            <Button size="sm" onClick={addField}>
              <Plus className="h-4 w-4 mr-1" />
              Add Field
            </Button>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <SortableFieldItem
                      key={field.id}
                      field={field}
                      index={index}
                      updateField={updateField}
                      removeField={removeField}
                      fields={fields}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        {/* Form Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Form Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Submit Button Text</Label>
                <Input
                  value={settings.submitButtonText}
                  onChange={(e) => setSettings({ ...settings, submitButtonText: e.target.value })}
                  placeholder="Submit"
                />
              </div>
              
              <div>
                <Label>Success Message</Label>
                <Input
                  value={settings.successMessage}
                  onChange={(e) => setSettings({ ...settings, successMessage: e.target.value })}
                  placeholder="Thank you!"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
                <Label htmlFor="emailNotifications">Send email notifications for submissions</Label>
              </div>
              
              {settings.emailNotifications && (
                <div>
                  <Label>Notification Email</Label>
                  <Input
                    type="email"
                    value={settings.notificationEmail || ''}
                    onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                    placeholder="notifications@example.com"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Switch
                  id="ghlSync"
                  checked={settings.ghlSync}
                  onCheckedChange={(checked) => setSettings({ ...settings, ghlSync: checked })}
                />
                <Label htmlFor="ghlSync">Sync submissions to GoHighLevel</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (form ? 'Update Form' : 'Create Form')}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="preview">
        <Card>
          <CardHeader>
            <CardTitle>Form Preview</CardTitle>
            <p className="text-sm text-muted-foreground">
              This is how your form will appear to visitors
            </p>
          </CardHeader>
          <CardContent>
            <FormPreview fields={fields} settings={settings} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="style">
        <Card>
          <CardHeader>
            <CardTitle>Form Styling</CardTitle>
            <p className="text-sm text-muted-foreground">
              Customize the appearance of your form
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Theme</Label>
              <Select defaultValue="light">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto (match site)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Button Style</Label>
              <Select defaultValue="rounded">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="pill">Pill</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Form Width</Label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">Narrow (400px)</SelectItem>
                  <SelectItem value="medium">Medium (600px)</SelectItem>
                  <SelectItem value="wide">Wide (800px)</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Custom CSS</Label>
              <Textarea
                placeholder="/* Add custom CSS here */"
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
