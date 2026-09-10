import * as React from 'react';
import { ProductImage } from '@/components/products/ProductImage';
import { Price } from '@/components/products/Price';
import { Button } from '@/components/ui/Button';
import { Trash2, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PricingMode } from '@/types/database.types';

interface QuoteItemProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  name: string;
  sku: string;
  price: number;
  wholesalePrice?: number | null;
  wholesaleUnit?: string | null;
  pricingMode?: PricingMode;
  imageUrl?: string | null;
  quantity: number;
  onUpdateQuantity?: (
    id: string,
    newQuantity: number,
    pricingMode?: PricingMode
  ) => void;
  onRemove?: (id: string, pricingMode?: PricingMode) => void;
}

export function QuoteItem({
  id,
  name,
  sku,
  price,
  wholesalePrice,
  wholesaleUnit,
  pricingMode,
  imageUrl,
  quantity,
  onUpdateQuantity,
  onRemove,
  className,
  ...props
}: QuoteItemProps) {
  const isWholesale = (pricingMode ?? 'RETAIL') === 'WHOLESALE';
  const effectivePrice =
    isWholesale && wholesalePrice != null ? wholesalePrice : price;

  return (
    <div
      className={cn('border-border-subtle flex gap-4 border-b py-4', className)}
      {...props}
    >
      <div className="border-border-subtle h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
        <ProductImage src={imageUrl} alt={name} className="h-full w-full" />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-text-main line-clamp-2 text-sm font-medium">
              {name}
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-text-muted text-xs">{sku}</p>
              {isWholesale && (
                <span className="py-0.2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-1.5 text-[10px] font-medium text-emerald-700">
                  Wholesale {wholesaleUnit ? `(${wholesaleUnit})` : ''}
                </span>
              )}
            </div>
          </div>
          <Price
            amount={effectivePrice * quantity}
            className="items-end text-sm"
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="border-border-strong flex items-center rounded-md border">
            <button
              type="button"
              className="hover:bg-background text-text-muted p-1 transition-colors disabled:opacity-50"
              onClick={() =>
                onUpdateQuantity?.(id, Math.max(1, quantity - 1), pricingMode)
              }
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Decrease quantity</span>
            </button>
            <span className="text-text-main w-8 text-center text-sm font-medium">
              {quantity}
            </span>
            <button
              type="button"
              className="hover:bg-background text-text-muted p-1 transition-colors"
              onClick={() => onUpdateQuantity?.(id, quantity + 1, pricingMode)}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Increase quantity</span>
            </button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-error hover:bg-error/10 hover:text-error h-8 w-8"
            onClick={() => onRemove?.(id, pricingMode)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove item</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
