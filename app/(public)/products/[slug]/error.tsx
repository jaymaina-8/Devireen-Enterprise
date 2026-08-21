'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

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
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="bg-error-50 mb-6 rounded-full p-6">
        <AlertTriangle className="text-error-500 h-12 w-12" />
      </div>
      <h2 className="text-text-main mb-4 text-3xl font-bold">
        Product Not Available
      </h2>
      <p className="text-text-muted mb-8 max-w-md">
        We encountered an issue loading this product&apos;s details. It may no
        longer exist or our systems are currently updating.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="primary">
          Try Again
        </Button>
        <Link href="/products">
          <Button variant="outline">Browse Other Products</Button>
        </Link>
      </div>
    </div>
  );
}
