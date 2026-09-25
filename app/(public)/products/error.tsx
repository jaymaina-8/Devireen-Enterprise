'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { PackageX } from 'lucide-react';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Products Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorState
        variant="card"
        icon={PackageX}
        title="Unable to load catalog"
        description="We couldn't retrieve the product catalog at this time. Please check your connection or try again."
        error={error}
        digest={error.digest}
        onRetry={() => reset()}
        retryLabel="Refresh Catalog"
        className="border-border-subtle bg-surface my-8 py-16"
      />
    </div>
  );
}
