import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  name?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
  required,
  name,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn('relative', className)} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
      >
        <span className={cn('truncate', !selectedOption && 'text-gray-500')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-gray-500" />
      </button>

      {/* Hidden input for form validation */}
      {(required || name) && (
        <input
          type="text"
          name={name}
          value={value}
          onChange={() => {}}
          className="absolute bottom-0 left-0 -z-10 h-full w-full opacity-0"
          required={required}
        />
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          <div className="sticky top-0 bg-white px-2 pt-1 pb-2">
            <div className="relative">
              <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 bg-gray-50 py-2 pr-3 pl-8 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No results found.
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className={cn(
                  'flex cursor-pointer items-center justify-between px-4 py-2 text-sm hover:bg-gray-100',
                  value === opt.value && 'bg-red-50 font-medium text-red-700'
                )}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                <span className="truncate">{opt.label}</span>
                {value === opt.value && (
                  <Check className="ml-2 h-4 w-4 shrink-0 text-red-600" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
