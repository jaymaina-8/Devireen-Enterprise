'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/hooks/use-sidebar';
import {
  LayoutDashboard,
  Package,
  Tags,
  FileText,
  Users,
  ShoppingCart,
  Star,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { dashboardNavGroups } from '@/config/navigation';

export function MobileSidebar() {
  const pathname = usePathname();
  const { isMobileOpen, setMobileOpen } = useSidebarStore();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    if (isMobileOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, setMobileOpen]);

  if (!isMobileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="animate-in fade-in fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => setMobileOpen(false)}
      />

      {/* Drawer */}
      <div className="animate-in slide-in-from-left fixed inset-y-0 left-0 flex w-72 flex-col bg-slate-950 text-white shadow-2xl duration-200">
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white">
              D
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              DEVIREEN{' '}
              <span className="text-xs font-light text-red-400">
                ENTERPRISE
              </span>
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {dashboardNavGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' &&
                      pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={twMerge(
                        clsx(
                          'flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                        )
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-3 border-t border-slate-800 p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-red-400" />
              View Live Website
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
