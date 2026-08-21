'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  Menu,
} from 'lucide-react';
import { useSidebarStore } from '@/hooks/use-sidebar';
import { clsx } from 'clsx';

import { mobileBottomNavItems } from '@/config/navigation';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleMobile } = useSidebarStore();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 shadow-lg shadow-slate-900/10 backdrop-blur-md select-none md:hidden">
      {mobileBottomNavItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={clsx(
              'relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-150',
              isActive
                ? 'font-semibold text-red-600'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            {isActive && (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-red-600 shadow-xs shadow-red-500/50" />
            )}
            <div
              className={clsx(
                'flex items-center justify-center rounded-xl px-3 py-1 transition-all',
                isActive && 'bg-red-50/80'
              )}
            >
              <Icon
                className={clsx(
                  'h-5 w-5',
                  isActive ? 'text-red-600' : 'text-slate-500'
                )}
              />
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}

      {/* Menu / Drawer Toggle Button */}
      <button
        onClick={toggleMobile}
        className="flex flex-1 flex-col items-center justify-center py-1.5 text-slate-500 transition-colors hover:text-slate-900"
        aria-label="More options menu"
      >
        <div className="flex items-center justify-center rounded-xl px-3 py-1">
          <Menu className="h-5 w-5 text-slate-500" />
        </div>
        <span className="text-[10px] tracking-tight">More</span>
      </button>
    </nav>
  );
}
