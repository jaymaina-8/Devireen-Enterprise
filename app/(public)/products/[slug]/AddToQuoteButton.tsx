'use client';

import { Button } from '@/components/ui/Button';
import { ShoppingCart, Check } from 'lucide-react';
import { useQuoteCart } from '@/lib/store/quote-cart';
import { toast } from '@/lib/store/toast-store';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface AddToCartProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  bulkPrice?: number | null;
  imageUrl?: string | null;
}

export function AddToQuoteButton({
  product,
  disabled,
}: {
  product: AddToCartProduct;
  disabled: boolean;
}) {
  const addItem = useQuoteCart((state) => state.addItem);
  const items = useQuoteCart((state) => state.items);
  const isInCart = items.some((item) => item.id === product.id);
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      bulkPrice: product.bulkPrice ?? null,
      imageUrl: product.imageUrl ?? null,
      quantity,
    });
    toast({
      title: 'Added to Cart',
      description: `${product.name} (${quantity}) added to your cart.`,
      variant: 'success',
    });
  };

  return (
    <div className="flex gap-4">
      <div className="w-24 shrink-0">
        <label className="sr-only" htmlFor="quantity">
          Quantity
        </label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="h-12 text-center"
          disabled={disabled}
        />
      </div>
      <Button
        variant={isInCart ? "outline" : "primary"}
        size="lg"
        className={cn("flex-1 h-12 text-base", isInCart && "border-primary-600 text-primary-600 bg-primary-50 hover:bg-primary-100")}
        onClick={handleAdd}
        disabled={disabled}
      >
        {isInCart ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}
