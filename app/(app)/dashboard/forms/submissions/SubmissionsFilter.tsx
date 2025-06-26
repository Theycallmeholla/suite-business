'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

export function SubmissionsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentFilter = searchParams.get('filter') || 'all';
  const currentDays = searchParams.get('days') || '';

  const setFilter = (filter: string, days?: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (filter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }
    
    if (days) {
      params.set('days', days);
    } else {
      params.delete('days');
    }
    
    router.push(`/dashboard/forms/submissions?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={currentFilter === 'all' && !currentDays ? 'default' : 'outline'}
        onClick={() => setFilter('all')}
      >
        <Filter className="h-4 w-4 mr-2" />
        All Submissions
      </Button>
      <Button 
        variant={currentFilter === 'unread' ? 'default' : 'outline'}
        onClick={() => setFilter('unread')}
      >
        Unread Only
      </Button>
      <Button 
        variant={currentDays === '7' ? 'default' : 'outline'}
        onClick={() => setFilter(currentFilter, '7')}
      >
        Last 7 Days
      </Button>
      <Button 
        variant={currentDays === '30' ? 'default' : 'outline'}
        onClick={() => setFilter(currentFilter, '30')}
      >
        Last 30 Days
      </Button>
    </div>
  );
}