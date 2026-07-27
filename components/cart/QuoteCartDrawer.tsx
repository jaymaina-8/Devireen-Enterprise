'use client';

import * as React from 'react';
import { X, ShoppingCart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface QuoteCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  itemsCount?: number;
  children?: React.ReactNode;
  summary?: React.ReactNode;
}

export function QuoteCartDrawer({
  isOpen,
  onClose,
  itemsCount = 0,
  children,
  summary,
}: QuoteCartDrawerProps) {
  const router = useRouter();

  // Trap focus and close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface shadow-xl sm:w-96"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle p-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-text-main">Cart</h2>
            {itemsCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">
                {itemsCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted hover:bg-background hover:text-text-main transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {/* Footer */}
        {summary && (
          <div className="border-t border-border-subtle p-4 bg-surface">{summary}</div>
        )}

        {/* Checkout CTA */}
        {itemsCount > 0 && (
          <div className="p-4 pt-0">
            <Link href="/cart" onClick={onClose} passHref className="block w-full">
              <Button variant="primary" className="w-full">
                Go to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
