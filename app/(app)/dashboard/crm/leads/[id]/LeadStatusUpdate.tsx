'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface LeadStatusUpdateProps {
  leadId: string;
  currentStatus: string;
  currentTemperature: string;
}

export default function LeadStatusUpdate({ 
  leadId, 
  currentStatus, 
  currentTemperature 
}: LeadStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [temperature, setTemperature] = useState(currentTemperature);
  const [dealValue, setDealValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updateData: any = {};
      
      if (status !== currentStatus) {
        updateData.status = status;
      }
      
      if (temperature !== currentTemperature) {
        updateData.temperature = temperature;
      }
      
      if (status === 'converted' && dealValue) {
        updateData.dealValue = parseFloat(dealValue);
      }

      const response = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          ...updateData,
        }),
      });

      if (response.ok) {
        toast.success('Lead updated successfully');
        router.refresh();
      } else {
        toast.error('Failed to update lead');
      }
    } catch (error) {
      toast.error('Failed to update lead');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = status !== currentStatus || temperature !== currentTemperature;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="unqualified">Unqualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="temperature">Temperature</Label>
        <Select value={temperature} onValueChange={setTemperature}>
          <SelectTrigger id="temperature" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hot">🔥 Hot</SelectItem>
            <SelectItem value="warm">🌡️ Warm</SelectItem>
            <SelectItem value="cold">❄️ Cold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {status === 'converted' && (
        <div>
          <Label htmlFor="dealValue">Deal Value</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <Input
              id="dealValue"
              type="number"
              placeholder="0.00"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleUpdate}
        disabled={loading || !hasChanges}
        className="w-full"
      >
        Update Lead
      </Button>
    </div>
  );
}