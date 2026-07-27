'use client';

import * as React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/lib/store/quote-cart';
import { cn } from '@/lib/utils';

interface CartItemRowProps {
  item: CartItem;
  bulkMode: boolean;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItemRow({ item, bulkMode, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const effectivePrice =
    bulkMode && item.bulkPrice != null ? item.bulkPrice : item.price;
  const subtotal = effectivePrice * item.quantity;
  const hasBulkPrice = item.bulkPrice != null && item.bulkPrice !== item.price;
  const showBulkTag = bulkMode && hasBulkPrice;

  return (
    <div className="py-5 border-b border-border-subtle last:border-b-0">

      {/* ── Row 1: Thumbnail + Product info + Remove ────────────────── */}
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="relative h-[72px] w-[72px] sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-background">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted text-xs">
              No image
            </div>
          )}
        </div>

        {/* Product details + remove button in one row */}
        <div className="flex flex-1 min-w-0 items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-main leading-snug line-clamp-2">
              {item.name}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">SKU: {item.sku}</p>

            {/* Unit price + bulk badges */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-sm font-bold text-text-main">
                KSh {effectivePrice.toLocaleString()}
              </span>
              <span className="text-xs text-text-muted">each</span>
              {showBulkTag && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                  Bulk price
                </span>
              )}
              {hasBulkPrice && !bulkMode && (
                <span className="text-xs text-text-muted line-through">
                  Bulk: KSh {item.bulkPrice!.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Remove button — top-right, always visible */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="flex-shrink-0 p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Row 2: Quantity stepper + Subtotal ──────────────────────── */}
      {/* Indent to align under the product text (past the thumbnail) */}
      <div className="mt-3 flex items-center justify-between pl-[88px] sm:pl-24">

        {/* Quantity stepper */}
        <div className="flex items-center rounded-xl border border-border-main overflow-hidden shadow-sm bg-background">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className={cn(
              // 44px on mobile (touch-compliant), 36px on desktop
              'flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center bg-background transition-colors',
              'hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500'
            )}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5 text-text-muted" />
          </button>

          <span className="flex h-10 sm:h-9 min-w-[2.5rem] items-center justify-center bg-background text-sm font-semibold text-text-main px-1 select-none border-x border-border-main">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className={cn(
              'flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center bg-background transition-colors',
              'hover:bg-surface',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500'
            )}
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5 text-text-muted" />
          </button>
        </div>

        {/* Line subtotal */}
        <span className="text-sm font-bold text-text-main tabular-nums">
          KSh {subtotal.toLocaleString()}
        </span>
      </div>

    </div>
  );
}
