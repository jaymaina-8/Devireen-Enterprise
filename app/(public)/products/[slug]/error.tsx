'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { ShoppingBag } from 'lucide-react';

export default function ProductDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Product Details Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <ErrorState
        variant="section"
        title="Product Not Available"
        description="We encountered an issue loading this product's details. It may no longer be available or our catalog is undergoing an update."
        error={error}
        digest={error.digest}
        onRetry={() => reset()}
        retryLabel="Try Again"
        secondaryAction={
          <Link href="/products">
            <Button variant="outline" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Browse Other Products
            </Button>
          </Link>
        }
      />
    </div>
  );
}
