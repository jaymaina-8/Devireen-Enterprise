'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Package,
  FileText,
  Users,
  Tags,
  Star,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actions = [
    {
      label: 'New Product',
      href: '/dashboard/products/new',
      icon: <Package className="h-4 w-4 text-slate-500" />,
    },
    {
      label: 'New Quote',
      href: '/dashboard/quotes/new',
      icon: <FileText className="h-4 w-4 text-slate-500" />,
    },
    {
      label: 'New Category',
      href: '/dashboard/categories/new',
      icon: <Tags className="h-4 w-4 text-purple-500" />,
    },
    {
      label: 'New Customer',
      href: '/dashboard/customers/new',
      icon: <Users className="h-4 w-4 text-emerald-500" />,
    },
    {
      label: 'New Testimonial',
      href: '/dashboard/testimonials?action=new',
      icon: <Star className="h-4 w-4 text-amber-500" />,
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="primary"
        size="sm"
        className="hidden gap-1.5 rounded-lg border-0 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 sm:flex"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="h-4 w-4" /> Quick Create
      </Button>

      {isOpen && (
        <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-52 rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-xl duration-150">
          <div className="mb-1 border-b border-slate-100 px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Quick Actions
          </div>
          {actions.map((action, idx) => (
            <Link
              key={idx}
              href={action.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              {action.icon}
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
