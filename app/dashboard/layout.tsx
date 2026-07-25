'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';
import { Topbar } from '@/components/dashboard/Topbar';
import { Toaster } from '@/components/ui/Toaster';
import { FloatingQuickCreate } from '@/components/dashboard/FloatingQuickCreate';
import { useSidebarStore } from '@/hooks/use-sidebar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const collapsed = mounted ? isCollapsed : false;

  return (
    <div className="relative min-h-screen max-w-full overflow-x-hidden bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Slide-over Drawer */}
      <MobileSidebar />

      {/* Main Layout Area */}
      <div
        className={twMerge(
          'flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out',
          collapsed ? 'md:pl-16' : 'md:pl-64'
        )}
      >
        <Topbar />
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 overflow-x-hidden p-4 pb-24 sm:p-6 sm:pb-8 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav />

      {/* Floating Speed Dial Quick Create FAB */}
      <FloatingQuickCreate />

      {/* Global Toast Notifications */}
      <Toaster />
    </div>
  );
}
