'use client';

import * as React from 'react';
import { useQuoteCart } from '@/lib/store/quote-cart';
import { QuoteSummary } from '@/components/cart/QuoteSummary';
import { QuoteItem } from '@/components/cart/QuoteItem';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ShoppingCart,
  Send,
  PackagePlus,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/store/toast-store';
import { createQuote } from '@/actions/quote.actions';
import { z } from 'zod';

const quoteFormSchema = z.object({
  companyName: z.string().optional(),
  contactName: z.string().min(2, 'Contact name is required (min 2 chars)'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  notes: z.string().optional(),
});

export function QuoteForm() {
  const { items, updateQuantity, removeItem, getSummary, clearCart } =
    useQuoteCart();
  const [mounted, setMounted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = React.useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    notes: '',
  });

  if (!mounted) return null;

  const { subtotal, vatAmount, total, itemCount } = getSummary();
  const hasItems = items.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const result = quoteFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      const flattened = result.error.flatten().fieldErrors;
      Object.keys(flattened).forEach((key) => {
        fieldErrors[key] = flattened[key as keyof typeof flattened]?.[0] || '';
      });
      setErrors(fieldErrors);
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors in the form before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!hasItems && (!formData.notes || formData.notes.trim().length < 5)) {
      setErrors((prev) => ({
        ...prev,
        notes: 'Please specify the items and quantities you would like quoted.',
      }));
      toast({
        title: 'Items Required',
        description:
          'Please list your required items and quantities in the notes field.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const apiResult = await createQuote({
        ...formData,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      });

      if (!apiResult.success) {
        throw new Error(apiResult.error);
      }

      const quoteData = apiResult.data;
      const quoteNumber =
        quoteData?.quote_number ||
        (quoteData?.id ? quoteData.id.slice(0, 8).toUpperCase() : '');

      const itemsList = hasItems
        ? items.map((i) => `• ${i.quantity}x ${i.name}`).join('\n')
        : formData.notes;

      const text =
        `📄 *New Formal Quote Request ${quoteNumber ? `#${quoteNumber}` : ''}*\n\n` +
        `*Customer:* ${formData.contactName}\n` +
        `*Organization:* ${formData.companyName || 'N/A'}\n` +
        `*Phone:* ${formData.phone}\n` +
        `*Email:* ${formData.email}\n\n` +
        `*Required Items:*\n` +
        `${itemsList}\n\n` +
        (hasItems ? `*Estimated Total:* KSh ${total.toLocaleString()}\n` : '') +
        (hasItems && formData.notes
          ? `*Additional Notes:* ${formData.notes}\n`
          : '') +
        `\n_Submitted via Devireen Enterprise Online Portal_`;

      const waUrl = `https://wa.me/254708037929?text=${encodeURIComponent(text)}`;

      toast({
        title: 'Quotation Submitted!',
        description:
          'Your request has been logged. Redirecting to WhatsApp sales desk.',
        variant: 'success',
      });

      clearCart();
      window.open(waUrl, '_blank');
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description:
          error?.message ||
          'There was an error submitting your quote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left 2 Columns: Items or Custom Inquiry Banner */}
      <div className="space-y-6 lg:col-span-2">
        {hasItems ? (
          <div className="bg-surface border-border-subtle rounded-2xl border p-5 shadow-2xs md:p-6">
            <div className="border-border-subtle mb-4 flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-text-main text-lg font-bold">
                  Selected Quote Items ({itemCount})
                </h2>
                <p className="text-text-muted text-xs">
                  Review and adjust quantities for your formal quotation.
                </p>
              </div>
              <Link href="/products">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl text-xs"
                >
                  <PackagePlus className="h-3.5 w-3.5" /> Add More Products
                </Button>
              </Link>
            </div>
            <div className="divide-border-subtle divide-y">
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
          </div>
        ) : (
          <div className="bg-surface border-border-subtle space-y-5 rounded-2xl border p-6 shadow-2xs md:p-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 text-primary-600 flex h-12 w-12 items-center justify-center rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-text-main text-xl font-bold">
                  Custom Quotation &amp; Tender Inquiries
                </h2>
                <p className="text-text-muted text-xs">
                  Specify your required stationery, office supplies, or school
                  equipment below.
                </p>
              </div>
            </div>

            <div className="bg-background border-border-subtle text-text-muted space-y-2 rounded-xl border p-4 text-xs">
              <p className="text-text-main font-semibold">
                💡 How would you like to request your quotation?
              </p>
              <ul className="list-disc space-y-1 pl-4">
                <li>
                  <strong className="text-text-main">
                    Specific Catalog Items:
                  </strong>{' '}
                  <Link
                    href="/products"
                    className="text-primary-600 hover:text-primary-700 font-semibold underline"
                  >
                    Browse our online catalog
                  </Link>{' '}
                  and add products to your cart.
                </li>
                <li>
                  <strong className="text-text-main">
                    Custom RFQ / Bill of Quantities:
                  </strong>{' '}
                  Fill out your contact details and type your items list into
                  the form on the right.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Customer Details Form */}
      <div className="space-y-6">
        <form
          onSubmit={handleSubmit}
          className="bg-surface border-border-subtle space-y-4 rounded-2xl border p-5 shadow-2xs md:p-6"
        >
          <div className="border-border-subtle border-b pb-3">
            <h2 className="text-text-main text-lg font-bold">
              Organization &amp; Contact Details
            </h2>
            <p className="text-text-muted text-xs">
              Where we should send your official stamped quotation.
            </p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label
                htmlFor="companyName"
                className="text-text-main mb-1 block text-xs font-semibold"
              >
                Company / School / Organization Name
              </label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="e.g. Apex Corporation Ltd"
                className={`rounded-xl text-xs ${
                  errors.companyName ? 'border-error-500' : ''
                }`}
              />
              {errors.companyName && (
                <p className="text-error-600 mt-1 text-xs">
                  {errors.companyName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="contactName"
                className="text-text-main mb-1 block text-xs font-semibold"
              >
                Contact Person Name *
              </label>
              <Input
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                placeholder="Full Name"
                className={`rounded-xl text-xs ${
                  errors.contactName ? 'border-error-500' : ''
                }`}
              />
              {errors.contactName && (
                <p className="text-error-600 mt-1 text-xs">
                  {errors.contactName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-text-main mb-1 block text-xs font-semibold"
              >
                Work / Official Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="procurement@company.com"
                className={`rounded-xl text-xs ${
                  errors.email ? 'border-error-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-error-600 mt-1 text-xs">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-text-main mb-1 block text-xs font-semibold"
              >
                Phone Number *
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+254 700 000 000"
                className={`rounded-xl text-xs ${
                  errors.phone ? 'border-error-500' : ''
                }`}
              />
              {errors.phone && (
                <p className="text-error-600 mt-1 text-xs">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="notes"
                className="text-text-main mb-1 block text-xs font-semibold"
              >
                {hasItems
                  ? 'Additional Notes / Delivery Location'
                  : 'List Required Items & Quantities *'}
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={hasItems ? 2 : 4}
                value={formData.notes}
                onChange={handleInputChange}
                className={`bg-background text-text-main placeholder:text-text-muted w-full rounded-xl border px-3 py-2 text-xs ${
                  errors.notes
                    ? 'border-error-500 focus:border-error-500 focus:ring-error-500 focus:ring-1'
                    : 'border-border-main focus:border-primary-500 focus:ring-primary-500 focus:ring-1'
                }`}
                placeholder={
                  hasItems
                    ? 'Delivery timeline, specific branch location, or special invoicing instructions...'
                    : 'e.g. 50 Reams A4 Paper, 20 Boxes Pelikan Ball Pens, 10 Cartridges HP 85A...'
                }
              />
              {errors.notes && (
                <p className="text-error-600 mt-1 text-xs">{errors.notes}</p>
              )}
            </div>
          </div>

          {hasItems && (
            <div className="border-border-subtle border-t pt-4">
              <QuoteSummary
                subtotal={subtotal}
                vatAmount={vatAmount}
                total={total}
                itemCount={itemCount}
                hideAction
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="mt-4 w-full rounded-xl py-2.5 text-xs font-bold shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Submitting Quotation Request...'
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Submit &amp; Request Quote via
                WhatsApp
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
