'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error Boundary caught error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[65vh] items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <ErrorState
          variant="card"
          title="Administrative Service Error"
          description="We encountered an issue loading this dashboard module. Your existing data remains safe. Please retry or return to the main dashboard."
          error={error}
          digest={error.digest}
          onRetry={() => reset()}
          retryLabel="Retry Section"
          secondaryAction={
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard Overview
              </Button>
            </Link>
          }
          className="border-slate-200 bg-white p-8 shadow-sm sm:p-12"
        />
      </div>
    </div>
  );
}
