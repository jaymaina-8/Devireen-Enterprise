'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuoteCart } from '@/lib/store/quote-cart';
import { QuoteCartDrawer } from './QuoteCartDrawer';
import { QuoteItem } from './QuoteItem';
import { QuoteSummary } from './QuoteSummary';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function QuoteCartContainer() {
  const router = useRouter();
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getSummary } = useQuoteCart();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const { subtotal, vatAmount, total, itemCount } = getSummary();

  const handleProceed = () => {
    setIsOpen(false);
    router.push('/cart');
  };

  const summaryNode =
    itemCount > 0 ? (
      <QuoteSummary
        subtotal={subtotal}
        vatAmount={vatAmount}
        total={total}
        itemCount={itemCount}
        onProceed={handleProceed}
        hideAction={true}
      />
    ) : null;

  return (
    <QuoteCartDrawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      itemsCount={itemCount}
      summary={summaryNode}
    >
      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse our catalogue to add items."
          action={
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Continue Shopping
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col">
          {items.map((item) => (
            <QuoteItem
              key={item.id}
              id={item.id}
              name={item.name}
              sku={item.sku}
              price={item.price}
              imageUrl={item.imageUrl}
              quantity={item.quantity}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>
      )}
    </QuoteCartDrawer>
  );
}
