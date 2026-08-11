import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Devireen Enterprise',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="bg-primary-50 mb-6 rounded-full p-6">
        <Search className="text-primary-500 h-12 w-12" />
      </div>
      <h1 className="text-text-main mb-4 text-4xl font-bold">
        404 - Page Not Found
      </h1>
      <p className="text-text-muted mb-8 max-w-md text-lg">
        We couldn&apos;t find the page you&apos;re looking for. It might have
        been moved, deleted, or never existed.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button variant="primary">Return to Homepage</Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">Browse Products</Button>
        </Link>
      </div>
    </div>
  );
}
