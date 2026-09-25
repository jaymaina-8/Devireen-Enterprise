'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root App Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <ErrorState
          variant="section"
          title="Something went wrong"
          description="We encountered an unexpected error while processing this page. Our system monitoring has recorded this event."
          error={error}
          digest={error.digest}
          onRetry={() => reset()}
          retryLabel="Try Again"
          secondaryAction={
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Return to Homepage
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
