import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SearchBarProps = React.InputHTMLAttributes<HTMLInputElement>;

export function SearchBar({ className, ...props }: SearchBarProps) {
  return (
    <div className={cn('relative w-full max-w-lg', className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="text-text-muted h-4 w-4" />
      </div>
      <input
        type="search"
        className="border-border-strong bg-surface placeholder:text-text-muted focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border py-2 pr-3 pl-10 text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
        placeholder="Search by product name, SKU, or brand..."
        {...props}
      />
    </div>
  );
}
