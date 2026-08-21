'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useToastStore } from '@/lib/store/toast-store';
import { convertQuoteToOrderAction } from '@/actions/quote.actions';
import { FileCheck } from 'lucide-react';

export function ConvertQuoteToOrderButton({
  quoteId,
  currentStatus,
}: {
  quoteId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const isConverted = currentStatus === 'FULFILLED';

  const handleConvert = async () => {
    if (
      !confirm(
        'Convert this quote into an order? This will mark the quote as FULFILLED and generate a new order.'
      )
    )
      return;
    setIsProcessing(true);

    try {
      const result = await convertQuoteToOrderAction(quoteId);
      if (result.success) {
        addToast({
          title: 'Success',
          description: 'Quote converted to Order',
          variant: 'success',
        });
        // Can optionally redirect to the new order page
        // router.push(`/dashboard/orders/${result.orderId}`);
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isConverted) {
    return (
      <Button variant="secondary" disabled>
        <FileCheck className="mr-2 h-4 w-4" />
        Converted to Order
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConvert}
      disabled={isProcessing}
      className="bg-blue-600 text-white shadow-sm hover:bg-blue-700"
    >
      <FileCheck className="mr-2 h-4 w-4" />
      {isProcessing ? 'Converting...' : 'Convert to Order'}
    </Button>
  );
}
