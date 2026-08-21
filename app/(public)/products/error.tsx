'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
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
    <div className="border-border-subtle bg-surface m-8 flex flex-col items-center justify-center rounded-xl border px-4 py-24 text-center">
      <div className="bg-error-50 mb-6 rounded-full p-4">
        <PackageX className="text-error-500 h-10 w-10" />
      </div>
      <h2 className="text-text-main mb-3 text-2xl font-bold">
        Unable to load catalog
      </h2>
      <p className="text-text-muted mb-6 max-w-md">
        We couldn&apos;t retrieve the product catalog at this time. Please check
        your connection or try again.
      </p>
      <Button onClick={() => reset()} variant="primary">
        Refresh Catalog
      </Button>
    </div>
  );
}
