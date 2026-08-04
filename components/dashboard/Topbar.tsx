'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Sparkles,
  PanelLeft,
} from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';
import { QuickActions } from './QuickActions';
import { useSidebarStore } from '@/hooks/use-sidebar';
import { useState, useRef, useEffect } from 'react';
import { logoutAction } from '@/actions/auth.actions';

export function Topbar() {
  const pathname = usePathname();
  const { toggleMobile, isCollapsed, toggleCollapsed } = useSidebarStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate breadcrumb items from current pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0)
      return [{ label: 'Dashboard', href: '/dashboard' }];

    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, href };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md transition-all sm:px-6">
      {/* Left section: Mobile menu + Mobile Brand + Desktop sidebar toggle + Breadcrumbs */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={toggleMobile}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
          title="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Brand / Company Name */}
        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-xs font-black text-white shadow-md shadow-blue-500/20">
            D
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900">
            DEVIREEN
          </span>
        </Link>

        <button
          onClick={toggleCollapsed}
          className="hidden rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:flex"
          title={
            isCollapsed
              ? 'Expand Sidebar (Ctrl+\\)'
              : 'Collapse Sidebar (Ctrl+\\)'
          }
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500 sm:flex">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div
                key={item.href}
                className="flex min-w-0 items-center gap-1.5"
              >
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                )}
                {isLast ? (
                  <span className="truncate font-semibold text-slate-900 capitalize">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="truncate capitalize transition-colors hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Center/Right section: Search, Actions, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <GlobalSearch />
        <QuickActions />
        <NotificationCenter />

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-full p-1 transition-all hover:ring-2 hover:ring-slate-200"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
              AD
            </div>
          </button>

          {profileOpen && (
            <div className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-xl duration-150">
              <div className="border-b border-slate-100 px-4 py-2">
                <p className="truncate text-xs font-bold text-slate-900">
                  Devireen Admin
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  admin@devireen.com
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Account Settings
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    try {
                      await logoutAction();
                    } catch (e) {
                      // ignore NEXT_REDIRECT errors or other thrown errors from the server action
                    }
                    window.location.href = '/login';
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
