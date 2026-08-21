'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Package,
  Users,
  FileText,
  ShoppingCart,
  Tags,
  Star,
  Settings,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) {
        window.location.href = selected.url;
        setIsOpen(false);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="h-4 w-4 text-slate-600" />;
      case 'category':
        return <Tags className="h-4 w-4 text-purple-500" />;
      case 'customer':
        return <Users className="h-4 w-4 text-emerald-500" />;
      case 'quote':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case 'testimonial':
        return <Star className="h-4 w-4 text-amber-500" />;
      case 'settings':
        return <Settings className="h-4 w-4 text-slate-500" />;
      default:
        return <Search className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/60 bg-slate-100 p-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-200/80 sm:w-40 sm:justify-start sm:px-3 md:w-56"
        title="Search system (Ctrl+K)"
        aria-label="Search system"
      >
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="hidden truncate sm:inline">Search system...</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 items-center gap-1 rounded border border-slate-300 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500 select-none sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
          <div
            className="animate-in fade-in fixed inset-0 bg-slate-950/60 backdrop-blur-xs duration-150"
            onClick={() => setIsOpen(false)}
          />
          <div className="animate-in fade-in zoom-in-95 relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl duration-150">
            <div className="flex items-center border-b border-slate-100 bg-slate-50/50 px-4">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                className="h-14 w-full border-0 bg-transparent px-3 text-base text-slate-900 placeholder-slate-400 focus:ring-0 focus:outline-none"
                placeholder="Search products, categories, quotes, orders, customers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {loading && (
                <Loader2 className="h-5 w-5 animate-spin text-red-600" />
              )}
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {query.length < 2 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  Type at least 2 characters to search across products,
                  categories, quotes, orders, and settings.
                </div>
              )}
              {query.length >= 2 && !loading && results.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No matching records found for &quot;{query}&quot;.
                </div>
              )}
              {results.length > 0 && (
                <ul className="space-y-1">
                  {results.map((result, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <li key={idx}>
                        <Link
                          href={result.url}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                            isSelected
                              ? 'bg-red-50 font-medium text-red-900'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white shadow-2xs">
                            {getIcon(result.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-900">
                              {result.title}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">
                              {result.subtitle}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-600 uppercase">
                            {result.type}
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 opacity-0 group-hover:opacity-100" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex justify-between border-t border-slate-100 bg-slate-50/80 p-3 font-mono text-[11px] text-slate-500">
              <span>↑↓ Navigate • ↵ Select</span>
              <span>ESC Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
