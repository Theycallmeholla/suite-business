'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  editClassName?: string;
  multiline?: boolean;
  placeholder?: string;
  style?: React.CSSProperties; // Add style prop
}

export function EditableText({
  value,
  onSave,
  as: Component = 'span',
  className,
  editClassName,
  multiline = false,
  placeholder = 'Click to edit...',
  style // Destructure style prop
}: EditableTextProps) {
  const { isEditMode } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue.trim() === value.trim()) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      // Revert on error
      setEditValue(value);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditMode) {
    return <Component className={className} style={style}>{value || placeholder}</Component>;
  }

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    
    return (
      <div className="inline-flex items-center gap-2">
        <InputComponent
          ref={inputRef as any}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => handleSave()}
          className={cn(
            "px-2 py-1 border rounded outline-none focus:ring-2 focus:ring-blue-500",
            editClassName,
            multiline && "min-h-[100px] w-full"
          )}
          disabled={isLoading}
        />
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Save"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative inline-block">
      <Component 
        className={cn(
          className, 
          "cursor-pointer transition-all duration-200",
          "hover:bg-blue-50 hover:ring-2 hover:ring-blue-200 rounded px-2 -mx-2"
        )}
        onClick={() => setIsEditing(true)}
        title="Click to edit"
      >
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
      </Component>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg"
        title="Edit"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
}
