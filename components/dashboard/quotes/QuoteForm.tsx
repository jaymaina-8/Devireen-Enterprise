'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useToastStore } from '@/lib/store/toast-store';
import { Plus, Trash2, StickyNote } from 'lucide-react';
import {
  createQuoteAction,
  updateQuoteAction,
  deleteQuoteAction,
} from '@/actions/quote.actions';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function QuoteForm({
  initialData,
  customers = [],
  products = [],
  defaultCustomerId = '',
}: {
  initialData?: any;
  customers?: any[];
  products?: any[];
  defaultCustomerId?: string;
}) {
  const [customerId, setCustomerId] = useState<string>(
    initialData?.customer_id || defaultCustomerId || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [items, setItems] = useState<any[]>(
    initialData?.items || [{ product_id: '', quantity: 1, unit_price: 0 }]
  );
  const router = useRouter();
  const { addToast } = useToastStore();

  const isEditing = !!initialData;

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    const newItems = [...items];
    newItems[index].product_id = productId;
    newItems[index].unit_price = product ? product.price : 0;
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    setItems(newItems);
  };

  const handlePriceChange = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index].unit_price = price;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce(
      (total, item) => total + item.quantity * item.unit_price,
      0
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      customer_id: formData.get('customer_id') as string,
      status: formData.get('status') as string,
      notes: formData.get('notes') as string,
      items: items.filter((i) => i.product_id !== ''),
    };

    if (payload.items.length === 0) {
      addToast({
        title: 'Error',
        description: 'Please add at least one product.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditing) {
        await updateQuoteAction(initialData.id, payload);
        addToast({
          title: 'Success',
          description: 'Quote updated',
          variant: 'success',
        });
      } else {
        await createQuoteAction(payload);
        addToast({
          title: 'Success',
          description: 'Quote created',
          variant: 'success',
        });
      }
      router.push('/dashboard/quotes');
      router.refresh();
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Operation failed',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }

  const handleDeleteQuote = async () => {
    if (!initialData?.id) return;
    setIsDeleting(true);
    try {
      const res = await deleteQuoteAction(initialData.id);
      if (res.success) {
        addToast({
          title: 'Quote Deleted',
          description: 'The quote was deleted successfully.',
          variant: 'success',
        });
        router.push('/dashboard/quotes');
        router.refresh();
      } else {
        throw new Error(res.error || 'Failed to delete quote');
      }
    } catch (err: any) {
      addToast({
        title: 'Delete Failed',
        description: err.message,
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3"
      >
        {/* Left Column: Line Items */}
        <div className="space-y-6 xl:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Products & Services
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Line
              </Button>
            </div>

            <div className="space-y-3 p-6">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-end gap-3 rounded-lg border border-gray-100 bg-gray-50/30 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <Label className="mb-1 text-xs text-gray-500">
                      Product
                    </Label>
                    <SearchableSelect
                      value={item.product_id}
                      onChange={(val) => handleProductChange(index, val)}
                      options={products.map((p) => ({
                        value: p.id,
                        label: `${p.name} (SKU: ${p.sku})`,
                      }))}
                      placeholder="Select Product..."
                      required
                    />
                  </div>
                  <div className="w-28">
                    <Label className="mb-1 text-xs text-gray-500">
                      Unit Price
                    </Label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      value={item.unit_price}
                      onChange={(e) =>
                        handlePriceChange(
                          index,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      required
                    />
                  </div>
                  <div className="w-20">
                    <Label className="mb-1 text-xs text-gray-500">Qty</Label>
                    <input
                      type="number"
                      min="1"
                      className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          index,
                          parseInt(e.target.value) || 1
                        )
                      }
                      required
                    />
                  </div>
                  <div className="w-28 pb-2 text-right font-medium text-gray-900">
                    {(item.quantity * item.unit_price).toLocaleString()}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mb-1 text-gray-400 hover:text-red-600"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Total Box */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
              <span className="text-sm font-medium text-gray-500">
                Estimated Total
              </span>
              <span className="text-2xl font-bold text-gray-900">
                KSh {calculateTotal().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Details */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <Label htmlFor="customer_id" className="text-gray-600">
                Customer
              </Label>
              <SearchableSelect
                name="customer_id"
                value={customerId}
                onChange={setCustomerId}
                options={customers.map((c) => ({
                  value: c.id,
                  label: `${c.company_name || 'Individual'} (${c.contact_email})`,
                }))}
                placeholder="Select Customer..."
                className="mt-1"
                required
              />
              <div className="mt-2 text-right">
                <Link
                  href="/dashboard/customers/new"
                  className="cursor-pointer text-xs font-medium text-red-600 hover:underline"
                >
                  + Add New Customer
                </Link>
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="text-gray-600">
                Status
              </Label>
              <Select
                id="status"
                name="status"
                defaultValue={initialData?.status || 'PENDING'}
                className="mt-1"
              >
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending (New)</option>
                <option value="REVIEWING">Reviewing</option>
                <option value="APPROVED">Approved (Quoted)</option>
                <option value="REJECTED">Rejected</option>
                <option value="FULFILLED">
                  Fulfilled (Converted to Order)
                </option>
              </Select>
            </div>

            <div className="relative mt-2">
              <Label
                htmlFor="notes"
                className="mb-2 flex items-center gap-2 font-semibold text-gray-700"
              >
                <StickyNote className="h-4 w-4 text-amber-500" />
                Internal Notes
              </Label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Add special instructions, payment terms, or staff-only reminders here..."
                className="min-h-[120px] w-full resize-y rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-900 shadow-inner transition-all duration-200 placeholder:text-amber-700/50 focus:border-amber-400 focus:bg-amber-50 focus:ring-4 focus:ring-amber-400/20 focus:outline-none"
                defaultValue={initialData?.notes || ''}
              />
              <div className="pointer-events-none absolute right-3 bottom-3">
                <span className="rounded-md bg-amber-200/40 px-2 py-1 text-[10px] font-bold tracking-wider text-amber-600/60 uppercase backdrop-blur-sm">
                  Staff Only
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <Button
              type="submit"
              size="lg"
              className="w-full shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Quote'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full bg-white"
              onClick={() => router.push('/dashboard/quotes')}
            >
              Discard Changes
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={isSubmitting || isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Quote
              </Button>
            )}
          </div>
        </div>
      </form>

      {isEditing && (
        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete Quotation"
          description={`Are you sure you want to delete quote #${initialData?.id?.slice(0, 8)}? This action cannot be undone.`}
          confirmText="Delete Quote"
          variant="danger"
          onConfirm={handleDeleteQuote}
          isProcessing={isDeleting}
        />
      )}
    </>
  );
}
