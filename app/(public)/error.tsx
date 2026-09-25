'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, MessageCircle } from 'lucide-react';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Storefront Error Boundary caught error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-12">
      <ErrorState
        variant="section"
        title="We encountered an issue loading this page"
        description="We apologize for the inconvenience. Please try again or explore our catalog. For urgent procurement orders, our team is directly available via WhatsApp."
        error={error}
        digest={error.digest}
        onRetry={() => reset()}
        retryLabel="Try Again"
        secondaryAction={
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/products">
              <Button variant="outline" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Browse Catalog
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact Support
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
