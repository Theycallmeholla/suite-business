'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function DeleteServiceButton() {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      e.preventDefault();
    }
  };

  return (
    <Button 
      type="submit"
      variant="ghost" 
      size="sm"
      className="text-red-600 hover:text-red-700"
      onClick={handleClick}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}