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
import { Textarea } from '@/components/ui/textarea';
import { User } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface LeadAssignmentProps {
  leadId: string;
  currentAssignee: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  teamMembers: TeamMember[];
}

export default function LeadAssignment({ 
  leadId, 
  currentAssignee,
  teamMembers 
}: LeadAssignmentProps) {
  const router = useRouter();
  const [assignedTo, setAssignedTo] = useState(currentAssignee?.id || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!assignedTo || assignedTo === currentAssignee?.id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/leads/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          assignedTo,
          notes: notes.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Lead assigned successfully');
        setNotes('');
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign lead');
      }
    } catch (error) {
      toast.error('Failed to assign lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {currentAssignee && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {currentAssignee.name || currentAssignee.email}
            </p>
            <p className="text-xs text-gray-500">Currently assigned</p>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="assignee">Assign To</Label>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger id="assignee" className="mt-1">
            <SelectValue placeholder="Select team member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Unassigned</SelectItem>
            {teamMembers.map((member) => (
              <SelectItem key={member.userId} value={member.userId}>
                {member.user.name || member.user.email} ({member.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Assignment Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes for the assignee..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1"
        />
      </div>

      <Button
        onClick={handleAssign}
        disabled={loading || !assignedTo || assignedTo === currentAssignee?.id}
        className="w-full"
      >
        {currentAssignee ? 'Reassign Lead' : 'Assign Lead'}
      </Button>
    </div>
  );
}