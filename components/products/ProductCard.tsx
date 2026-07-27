'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Eye, Check } from 'lucide-react';
import { ProductImage } from '@/components/products/ProductImage';
import { Price } from '@/components/products/Price';
import { StockIndicator, StockStatus } from '@/components/products/StockIndicator';
import { useQuoteCart } from '@/lib/store/quote-cart';
import { toast } from '@/lib/store/toast-store';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  slug?: string;
  name: string;
  sku: string;
  price: number;
  bulkPrice?: number | null;
  originalPrice?: number;
  imageUrl?: string | null;
  stockStatus: StockStatus;
  addQuantity?: number;
  addLabel?: string;
}

export function ProductCard({
  id,
  slug,
  name,
  sku,
  price,
  bulkPrice,
  originalPrice,
  imageUrl,
  stockStatus,
  addQuantity = 1,
  addLabel = "Add to Cart",
  className,
  ...props
}: ProductCardProps) {
  const addItem = useQuoteCart((state) => state.addItem);
  const items = useQuoteCart((state) => state.items);
  const isInCart = items.some((item) => item.id === id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id, name, sku, price, bulkPrice: bulkPrice ?? null, imageUrl, quantity: addQuantity });
    toast({
      title: 'Added to Cart',
      description: `${name} has been added to your cart.`,
      variant: 'success',
    });
  };

  const productUrl = slug ? `/products/${slug}` : '#';
  const hasBulkPrice = bulkPrice != null && bulkPrice !== price;

  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-border-strong',
        className
      )}
      {...props}
    >
      {/* Image Area */}
      <Link href={productUrl} className="block relative aspect-square overflow-hidden bg-background">
        <ProductImage src={imageUrl} alt={name} className="absolute inset-0 h-full w-full mix-blend-multiply p-4 img-zoom" />

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          <StockIndicator status={stockStatus} />
          {hasBulkPrice && (
            <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm w-fit">
              BULK PRICE
            </div>
          )}
          {originalPrice && originalPrice > price && (
            <div className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm w-fit">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </div>
          )}
        </div>

        {/* Quick View Hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm text-text-main text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <Eye className="h-3.5 w-3.5" />
            Quick View
          </div>
        </div>
      </Link>

      {/* Info Area */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 border-t border-border-subtle">
        <div className="text-[10px] sm:text-xs text-text-muted mb-1 font-medium tracking-wide">{sku}</div>
        <Link href={productUrl} className="block group-hover:text-primary-600 transition-colors">
          <h3 className="text-sm font-semibold text-text-main line-clamp-2 leading-snug">{name}</h3>
        </Link>
        <div className="mt-2">
          <Price amount={price} originalAmount={originalPrice} showVat={true} />
          {hasBulkPrice && (
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
              Bulk: KSh {bulkPrice!.toLocaleString()}
            </p>
          )}
        </div>
        <Button
          variant={isInCart ? "outline" : "primary"}
          className={cn("mt-4 w-full px-2 sm:px-4", isInCart && "border-primary-600 text-primary-600 bg-primary-50 hover:bg-primary-100")}
          disabled={stockStatus === 'OUT_OF_STOCK' || stockStatus === 'DISCONTINUED'}
          onClick={handleAddToCart}
        >
          {isInCart ? (
            <>
              <Check className="mr-2 h-4 w-4 shrink-0" />
              <span>{addQuantity > 1 ? `Added ${addQuantity}` : "Added to Cart"}</span>
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4 shrink-0" />
              <span>{addLabel}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
