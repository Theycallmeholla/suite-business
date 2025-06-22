'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Building2, MapPin, Search } from 'lucide-react';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings?: Array<{
      offset: number;
      length: number;
    }>;
  };
  types: string[];
  confidence?: string;
}

interface BusinessAutocompleteProps {
  onSelect: (placeId: string, businessName: string, address: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function BusinessAutocomplete({ 
  onSelect, 
  placeholder = "Enter business name (add city for other locations)",
  className,
  autoFocus = false
}: BusinessAutocompleteProps) {
  const [input, setInput] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [sessionToken, setSessionToken] = useState<string>('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Generate session token on mount
  useEffect(() => {
    // Simple session token for billing optimization
    setSessionToken(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch autocomplete predictions
  const fetchPredictions = useCallback(async (searchInput: string) => {
    if (searchInput.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/gbp/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: searchInput,
          sessionToken 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } else {
        const error = await response.json();
        console.error('Autocomplete error:', error);
        setPredictions([]);
      }
    } catch (error) {
      console.error('Autocomplete fetch error:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  // Debounced input handler
  const handleInputChange = (value: string) => {
    setInput(value);
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    if (value.trim()) {
      setIsLoading(true);
      debounceTimer.current = setTimeout(() => {
        fetchPredictions(value);
      }, 300); // 300ms debounce
    } else {
      setPredictions([]);
      setShowDropdown(false);
      setIsLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && predictions[selectedIndex]) {
          handleSelect(predictions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle selection
  const handleSelect = (prediction: Prediction) => {
    setInput(prediction.description);
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    // Generate new session token after selection
    setSessionToken(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    
    onSelect(
      prediction.place_id,
      prediction.structured_formatting.main_text,
      prediction.structured_formatting.secondary_text
    );
  };

  // Highlight matching text
  const highlightMatch = (text: string, matches?: Array<{ offset: number; length: number }>) => {
    if (!matches || matches.length === 0) return text;

    const parts: JSX.Element[] = [];
    let lastOffset = 0;

    matches.forEach((match, index) => {
      // Add non-highlighted text before match
      if (match.offset > lastOffset) {
        parts.push(
          <span key={`text-${index}`}>
            {text.substring(lastOffset, match.offset)}
          </span>
        );
      }
      
      // Add highlighted match
      parts.push(
        <span key={`match-${index}`} className="font-semibold text-blue-600">
          {text.substring(match.offset, match.offset + match.length)}
        </span>
      );
      
      lastOffset = match.offset + match.length;
    });

    // Add remaining text
    if (lastOffset < text.length) {
      parts.push(
        <span key="text-end">
          {text.substring(lastOffset)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (predictions.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className={cn("pl-10 pr-10", className)}
          autoFocus={autoFocus}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <Card 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 p-0 shadow-lg max-h-80 overflow-auto"
        >
          <ul className="divide-y divide-gray-100">
            {predictions.map((prediction, index) => (
              <li
                key={prediction.place_id}
                className={cn(
                  "px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors",
                  selectedIndex === index && "bg-gray-50"
                )}
                onClick={() => handleSelect(prediction)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {highlightMatch(
                        prediction.structured_formatting.main_text,
                        prediction.structured_formatting.main_text_matched_substrings
                      )}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center mt-0.5">
                      <MapPin className="h-3 w-3 mr-1" />
                      {prediction.structured_formatting.secondary_text}
                    </p>
                  </div>
                  {prediction.confidence === 'high' && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex-shrink-0">
                      Best Match
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          
          <div className="px-4 py-2 border-t bg-gray-50">
            <p className="text-xs text-gray-500">
              Tip: Add city or state for businesses in other locations (e.g., "ABC Company, Austin TX")
            </p>
          </div>
        </Card>
      )}

      {/* No results message */}
      {showDropdown && !isLoading && input.length >= 2 && predictions.length === 0 && (
        <Card className="absolute z-50 w-full mt-1 p-4 shadow-lg">
          <p className="text-sm text-gray-500 text-center">
            No businesses found. Try adjusting your search.
          </p>
        </Card>
      )}
    </div>
  );
}