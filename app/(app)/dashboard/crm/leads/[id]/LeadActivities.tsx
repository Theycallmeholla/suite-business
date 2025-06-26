'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Phone, 
  Calendar, 
  FileText,
  ArrowRightLeft,
  Plus,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Activity {
  id: string;
  type: string;
  subject: string | null;
  description: string | null;
  createdAt: string;
  userId: string | null;
}

interface LeadActivitiesProps {
  leadId: string;
  initialActivities: Activity[];
}

export default function LeadActivities({ leadId, initialActivities }: LeadActivitiesProps) {
  const [activities, setActivities] = useState(initialActivities);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(false);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <MessageSquare className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'status_change':
        return <ArrowRightLeft className="h-4 w-4" />;
      case 'note':
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-700';
      case 'call':
        return 'bg-green-100 text-green-700';
      case 'meeting':
        return 'bg-purple-100 text-purple-700';
      case 'status_change':
        return 'bg-yellow-100 text-yellow-700';
      case 'note':
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/leads/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          type: 'note',
          description: noteContent,
        }),
      });

      if (response.ok) {
        const { activity } = await response.json();
        setActivities([activity, ...activities]);
        setNoteContent('');
        setIsAddingNote(false);
        toast.success('Note added successfully');
      } else {
        toast.error('Failed to add note');
      }
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreActivities = async () => {
    try {
      const response = await fetch(`/api/leads/activities?leadId=${leadId}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      toast.error('Failed to load activities');
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Note Button */}
      {!isAddingNote && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingNote(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      )}

      {/* Add Note Form */}
      {isAddingNote && (
        <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
          <Textarea
            placeholder="Add a note about this lead..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddingNote(false);
                setNoteContent('');
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={loading || !noteContent.trim()}
            >
              Add Note
            </Button>
          </div>
        </div>
      )}

      {/* Activities Timeline */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No activities yet
          </p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    {activity.subject && (
                      <p className="font-medium text-sm">{activity.subject}</p>
                    )}
                    {activity.description && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {activity.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {activities.length >= 10 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchMoreActivities}
          className="w-full"
        >
          Load More Activities
        </Button>
      )}
    </div>
  );
}