'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// ==================== CONTACT FORM ====================

interface ContactFormProps {
  siteId: string;
  formType?: string;
  className?: string;
  onSuccess?: () => void;
}

export function ContactForm({ 
  siteId, 
  formType = 'contact', 
  className = '',
  onSuccess 
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email && !formData.phone) {
      toast.error('Please provide either an email or phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ghl/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId,
          formType,
          source: 'website',
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      toast.success(data.message || 'Thank you! We\'ll be in touch soon.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            First Name *
          </label>
          <Input
            id="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="John"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            Last Name
          </label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Doe"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john@example.com"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone
        </label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="(555) 123-4567"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Message
        </label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="How can we help you?"
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </Button>
    </form>
  );
}

// ==================== DYNAMIC FORM ====================

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time';
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: string;
    max?: string;
  };
}

interface DynamicFormProps {
  formId: string;
  siteId: string;
  fields: FormField[];
  settings: {
    submitButtonText: string;
    successMessage: string;
    redirectUrl?: string;
    ghlSync: boolean;
  };
  className?: string;
  onSuccess?: () => void;
}

export function DynamicForm({ 
  formId,
  siteId, 
  fields, 
  settings,
  className = '',
  onSuccess 
}: DynamicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    for (const field of fields) {
      if (field.required && !formData[field.name]) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Submit to form submissions endpoint
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          siteId,
          data: formData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      toast.success(settings.successMessage);
      
      // Reset form
      setFormData({});

      // Handle redirect if configured
      if (settings.redirectUrl) {
        window.location.href = settings.redirectUrl;
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      required: field.required,
      disabled: isSubmitting,
      placeholder: field.placeholder,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => updateFormData(field.name, e.target.value)}
            pattern={field.validation?.pattern}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            value={formData[field.name] || ''}
            onChange={(e) => updateFormData(field.name, e.target.value)}
            rows={4}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'select':
        return (
          <Select
            value={formData[field.name] || ''}
            onValueChange={(value) => updateFormData(field.name, value)}
            disabled={isSubmitting}
          >
            <SelectTrigger id={field.name}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            value={formData[field.name] || ''}
            onValueChange={(value) => updateFormData(field.name, value)}
            disabled={isSubmitting}
          >
            {field.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.name}-${option}`} />
                <Label htmlFor={`${field.name}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.name}-${option}`}
                  checked={formData[field.name]?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = formData[field.name] || [];
                    if (checked) {
                      updateFormData(field.name, [...currentValues, option]);
                    } else {
                      updateFormData(field.name, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                  disabled={isSubmitting}
                />
                <Label htmlFor={`${field.name}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'date':
        return (
          <Input
            {...commonProps}
            type="date"
            value={formData[field.name] || ''}
            onChange={(e) => updateFormData(field.name, e.target.value)}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case 'time':
        return (
          <Input
            {...commonProps}
            type="time"
            value={formData[field.name] || ''}
            onChange={(e) => updateFormData(field.name, e.target.value)}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {fields.map(field => (
        <div key={field.id}>
          <Label htmlFor={field.name} className="block text-sm font-medium mb-1">
            {field.label} {field.required && '*'}
          </Label>
          {renderField(field)}
        </div>
      ))}

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          settings.submitButtonText
        )}
      </Button>
    </form>
  );
}

// ==================== SMART FORM ====================

interface SmartFormProps {
  siteId: string;
  formType?: string;
  className?: string;
  onSuccess?: () => void;
}

export function SmartForm({ 
  siteId, 
  formType = 'contact',
  className = '',
  onSuccess 
}: SmartFormProps) {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch a custom form for this site and type
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms?siteId=${siteId}&type=${formType}&enabled=true`);
        if (response.ok) {
          const forms = await response.json();
          if (forms.length > 0) {
            // Use the first enabled form of this type
            setForm(forms[0]);
          }
        }
      } catch (error) {
        // Silently fall back to default form
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [siteId, formType]);

  if (loading) {
    return <div className={`animate-pulse bg-gray-200 h-96 rounded-lg ${className}`} />;
  }

  // If a custom form exists, use DynamicForm
  if (form) {
    return (
      <DynamicForm
        formId={form.id}
        siteId={siteId}
        fields={form.fields}
        settings={form.settings}
        className={className}
        onSuccess={onSuccess}
      />
    );
  }

  // Otherwise, fall back to the default ContactForm
  return (
    <ContactForm
      siteId={siteId}
      formType={formType}
      className={className}
      onSuccess={onSuccess}
    />
  );
}

// Export all form types and interfaces for use elsewhere
export type { ContactFormProps, DynamicFormProps, SmartFormProps, FormField };
