'use client';

import * as React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/lib/store/quote-cart';
import { cn } from '@/lib/utils';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const effectivePrice =
    item.wholesalePrice != null ? item.wholesalePrice : item.price;
  const subtotal = effectivePrice * item.quantity;
  const hasWholesalePrice =
    item.wholesalePrice != null && item.wholesalePrice !== item.price;
  const showWholesaleTag = hasWholesalePrice;

  return (
    <div className="border-border-subtle border-b py-5 last:border-b-0">
      {/* ── Row 1: Thumbnail + Product info + Remove ────────────────── */}
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="border-border-subtle bg-background relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl border sm:h-20 sm:w-20">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="text-text-muted flex h-full w-full items-center justify-center text-xs">
              No image
            </div>
          )}
        </div>

        {/* Product details + remove button in one row */}
        <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-text-main line-clamp-2 text-sm leading-snug font-semibold">
              {item.name}
            </h3>
            <p className="text-text-muted mt-0.5 text-xs">SKU: {item.sku}</p>

            {/* Unit price + bulk badges */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="text-text-main text-sm font-bold">
                KSh {effectivePrice.toLocaleString()}
              </span>
              <span className="text-text-muted text-xs">each</span>
              {showWholesaleTag && (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Wholesale price
                </span>
              )}
            </div>
          </div>

          {/* Remove button — top-right, always visible */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-text-muted flex-shrink-0 rounded-lg p-2 transition-all hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
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
        <div className="border-border-main bg-background flex items-center overflow-hidden rounded-xl border shadow-sm">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className={cn(
              // 44px on mobile (touch-compliant), 36px on desktop
              'bg-background flex h-10 w-10 items-center justify-center transition-colors sm:h-9 sm:w-9',
              'hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40',
              'focus-visible:ring-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset'
            )}
            aria-label="Decrease quantity"
          >
            <Minus className="text-text-muted h-3.5 w-3.5" />
          </button>

          <span className="bg-background text-text-main border-border-main flex h-10 min-w-[2.5rem] items-center justify-center border-x px-1 text-sm font-semibold select-none sm:h-9">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className={cn(
              'bg-background flex h-10 w-10 items-center justify-center transition-colors sm:h-9 sm:w-9',
              'hover:bg-surface',
              'focus-visible:ring-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset'
            )}
            aria-label="Increase quantity"
          >
            <Plus className="text-text-muted h-3.5 w-3.5" />
          </button>
        </div>

        {/* Line subtotal */}
        <span className="text-text-main text-sm font-bold tabular-nums">
          KSh {subtotal.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
