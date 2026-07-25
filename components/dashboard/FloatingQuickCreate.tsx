'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Package,
  FileText,
  Users,
  Tags,
  Star,
  X,
  Sparkles,
} from 'lucide-react';

export function FloatingQuickCreate() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const actions = [
    {
      label: 'New Product',
      href: '/dashboard/products/new',
      icon: Package,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      label: 'New Quote Request',
      href: '/dashboard/quotes/new',
      icon: FileText,
      color: 'text-indigo-500 bg-indigo-50',
    },
    {
      label: 'New Customer',
      href: '/dashboard/customers/new',
      icon: Users,
      color: 'text-purple-500 bg-purple-50',
    },
    {
      label: 'New Category',
      href: '/dashboard/categories/new',
      icon: Tags,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      label: 'New Testimonial',
      href: '/dashboard/testimonials?action=new',
      icon: Star,
      color: 'text-amber-500 bg-amber-50',
    },
  ];

  return (
    <div
      className="fixed right-5 bottom-20 z-40 md:right-6 md:bottom-6"
      ref={containerRef}
    >
      {/* Speed Dial Menu Items */}
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-bottom-4 mb-3 flex flex-col items-end gap-2 duration-200">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-xl transition-all hover:scale-105 hover:bg-slate-800"
              >
                <span>{action.label}</span>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${action.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-13 w-13 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl ring-4 shadow-blue-600/30 ring-slate-100 transition-all duration-200 hover:scale-105 active:scale-95 ${
          isOpen ? 'rotate-45 bg-slate-900 from-slate-900 to-slate-900' : ''
        }`}
        title="Quick Create (FAB)"
        aria-label="Quick Create Action"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </button>
    </div>
  );
}
