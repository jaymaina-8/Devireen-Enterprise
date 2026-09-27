'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuoteCart } from '@/lib/store/quote-cart';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { FulfillmentSelector } from '@/components/cart/FulfillmentSelector';
import { DeliveryForm } from '@/components/cart/DeliveryForm';
import { PickupForm } from '@/components/cart/PickupForm';
import { OrderConfirmation } from '@/components/cart/OrderConfirmation';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { createPublicOrderAction } from '@/actions/order.actions';
import { toast } from '@/lib/store/toast-store';
import { cn } from '@/lib/utils';
import type { DeliveryFormData } from '@/lib/validation/checkout.schema';
import type { PickupFormData } from '@/lib/validation/checkout.schema';

type FulfillmentType = 'DELIVERY' | 'PICKUP';
type CheckoutStep = 'cart' | 'fulfillment' | 'details' | 'confirmation';

interface CheckoutPageProps {
  whatsappNumber: string;
  shopAddress: string;
  mapsUrl: string;
  enableVat: boolean;
}

interface ConfirmedOrder {
  orderId: string;
  invoiceNumber: string;
  customerName: string;
  fulfillmentType: FulfillmentType;
  total: number;
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  accessToken?: string;
  pricingModel: 'RETAIL' | 'WHOLESALE';
  purchasedItems: any[];
}

// ─── Page Header with Page 1-4 indicator ─────────────────────────────────

const PAGE_METADATA: Record<
  CheckoutStep,
  {
    pageNumber: number;
    title: string;
    description: string;
  }
> = {
  cart: {
    pageNumber: 1,
    title: 'Page 1: Review Your Cart',
    description: 'Review your items and adjust quantities before proceeding.',
  },
  fulfillment: {
    pageNumber: 2,
    title: 'Page 2: Choose Fulfillment',
    description:
      'Select whether you would like delivery to your door or personal pickup.',
  },
  details: {
    pageNumber: 3,
    title: 'Page 3: Contact & Delivery Details',
    description: 'Provide your contact information and destination details.',
  },
  confirmation: {
    pageNumber: 4,
    title: 'Page 4: Order Confirmation',
    description:
      'Your order has been placed successfully and your invoice is ready.',
  },
};

function PageHeader({
  current,
  onBack,
}: {
  current: CheckoutStep;
  onBack?: () => void;
}) {
  const meta = PAGE_METADATA[current];
  const pageList: CheckoutStep[] = [
    'cart',
    'fulfillment',
    'details',
    'confirmation',
  ];
  const currentIndex = meta.pageNumber - 1;

  return (
    <div className="mb-6 sm:mb-8">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="border-border-main hover:bg-surface flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors"
              aria-label="Go to previous page"
            >
              <ArrowLeft className="text-text-muted h-4 w-4" />
            </button>
          )}
          <span className="bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border-primary-200 dark:border-primary-800 inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide">
            Page {meta.pageNumber} of 4
          </span>
        </div>

        {/* Minimal visual progress pills */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {pageList.map((stepKey, idx) => (
            <div
              key={stepKey}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                idx === currentIndex
                  ? 'bg-primary-600 w-8 shadow-sm'
                  : idx < currentIndex
                    ? 'w-3 bg-emerald-500'
                    : 'bg-border-subtle w-3'
              )}
            />
          ))}
        </div>
      </div>

      <h1 className="text-text-main text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
        {meta.title}
      </h1>
      <p className="text-text-muted mt-1.5 text-sm sm:text-base">
        {meta.description}
      </p>
    </div>
  );
}

// ─── Totals sidebar ───────────────────────────────────────────────────────

function TotalsSidebar({
  subtotal,
  vatAmount,
  total,
  itemCount,
  enableVat,
  isVatApplied,
  primaryAction,
}: {
  subtotal: number;
  vatAmount: number;
  total: number;
  itemCount: number;
  enableVat: boolean;
  isVatApplied: boolean;
  primaryAction?: React.ReactNode;
}) {
  return (
    <div className="border-border-subtle bg-surface sticky top-6 space-y-5 rounded-2xl border p-5 shadow-md sm:p-6">
      <h2 className="text-text-main text-xl font-bold">Order Summary</h2>

      <div className="space-y-2.5 text-sm">
        <div className="text-text-muted flex justify-between">
          <span>Items ({itemCount})</span>
          <span className="text-text-main font-semibold tabular-nums">
            KSh {subtotal.toLocaleString()}
          </span>
        </div>
        {enableVat && isVatApplied && (
          <div className="text-text-muted flex justify-between">
            <span>VAT (16%)</span>
            <span className="text-text-main font-semibold tabular-nums">
              KSh {vatAmount.toLocaleString()}
            </span>
          </div>
        )}
        {/* Total — visually prominent */}
        <div className="border-border-subtle mt-1 border-t-2 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-text-main text-base font-bold">Total</span>
            <span className="text-primary-600 text-2xl font-extrabold tabular-nums">
              KSh {total.toLocaleString()}
            </span>
          </div>
          {isVatApplied ? (
            <p className="mt-1 text-xs font-medium text-emerald-600">
              ✓ Inclusive of 16% VAT (Tax Invoice)
            </p>
          ) : (
            <p className="text-text-muted mt-1 text-xs">
              Standard order total (VAT optional)
            </p>
          )}
        </div>
      </div>

      {primaryAction && (
        <div className="border-border-subtle border-t pt-4">
          {primaryAction}
        </div>
      )}
    </div>
  );
}

// ─── Main CheckoutPage ─────────────────────────────────────────────────────

export function CheckoutPage({
  whatsappNumber,
  shopAddress,
  mapsUrl,
  enableVat,
}: CheckoutPageProps) {
  const { items, updateQuantity, removeItem, clearCart, wholesaleMode } =
    useQuoteCart();

  const [mounted, setMounted] = React.useState(false);
  const [step, setStep] = React.useState<CheckoutStep>('cart');
  const [fulfillmentType, setFulfillmentType] =
    React.useState<FulfillmentType | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [confirmedOrder, setConfirmedOrder] =
    React.useState<ConfirmedOrder | null>(null);

  const [requiresVat, setRequiresVat] = React.useState(false);
  const [kraPin, setKraPin] = React.useState('');

  React.useEffect(() => {
    setMounted(true);
    try {
      const saved = sessionStorage.getItem('devireen_last_confirmed_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed?.order &&
          Date.now() - (parsed.savedAt || 0) < 2 * 60 * 60 * 1000
        ) {
          if (items.length === 0) {
            setConfirmedOrder(parsed.order);
            setStep('confirmation');
          }
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  React.useEffect(() => {
    if (mounted) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step, mounted]);

  if (!mounted) return null;

  const rawSubtotal = items.reduce((acc, item) => {
    const isWholesale = (item.pricingMode ?? 'RETAIL') === 'WHOLESALE';
    const effectivePrice =
      isWholesale && item.wholesalePrice != null
        ? item.wholesalePrice
        : item.price;
    return acc + effectivePrice * item.quantity;
  }, 0);

  const subtotal = rawSubtotal;
  const isVatApplied = enableVat && requiresVat;
  const vatAmount = isVatApplied
    ? Number(((rawSubtotal * 16) / 100).toFixed(2))
    : 0;
  const total = Number((rawSubtotal + vatAmount).toFixed(2));
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const hasItems = items.length > 0;

  // ── Empty cart ──
  if (!hasItems && step !== 'confirmation') {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse our catalogue and add products to your cart to get started."
          action={
            <Link href="/">
              <Button variant="primary">Browse Products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  function generateInvoiceNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 8999);
    return `INV-${dateStr}-${rand}`;
  }

  async function submitOrder(customerData: {
    fullName: string;
    phone: string;
    email?: string;
    deliveryAddress?: string;
    county?: string;
    courierService?: string;
    deliveryNotes?: string;
  }) {
    if (!fulfillmentType) return;

    setIsSubmitting(true);
    const invoiceNumber = generateInvoiceNumber();
    const hasKraPin = requiresVat && kraPin.trim().length > 0;

    const notesAppendedWithPin = hasKraPin
      ? `${customerData.deliveryNotes || ''}\n[Requested VAT Invoice. KRA PIN: ${kraPin.trim()}]`.trim()
      : customerData.deliveryNotes;

    const allWholesale =
      items.length > 0 &&
      items.every((item) => (item.pricingMode ?? 'RETAIL') === 'WHOLESALE');
    const orderPricingModel: 'RETAIL' | 'WHOLESALE' = allWholesale
      ? 'WHOLESALE'
      : 'RETAIL';

    const payload = {
      customerName: customerData.fullName,
      customerEmail: customerData.email?.trim() || undefined,
      customerPhone: customerData.phone,
      fulfillmentType,
      pricingModel: orderPricingModel,
      totalAmount: total,
      invoiceNumber,
      requiresVat: isVatApplied,
      deliveryNotes: hasKraPin
        ? notesAppendedWithPin ||
          `[Requested VAT Invoice. KRA PIN: ${kraPin.trim()}]`
        : customerData.deliveryNotes,
      ...(fulfillmentType === 'DELIVERY' && {
        deliveryAddress: customerData.deliveryAddress,
        county: customerData.county,
        courierService: customerData.courierService,
      }),
      items: items.map((item) => {
        const isWholesale = (item.pricingMode ?? 'RETAIL') === 'WHOLESALE';
        const effectivePrice =
          isWholesale && item.wholesalePrice != null
            ? item.wholesalePrice
            : item.price;
        return {
          productId: item.id,
          quantity: item.quantity,
          pricingMode: item.pricingMode ?? 'RETAIL',
          unitPrice: effectivePrice,
        };
      }),
    };

    try {
      const result = await createPublicOrderAction(payload as any);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Order creation failed');
      }

      const purchasedItemsSnapshot =
        (result.data as any).items && (result.data as any).items.length > 0
          ? (result.data as any).items
          : items.map((i) => ({ ...i }));

      const orderData: ConfirmedOrder = {
        orderId: result.data.orderId,
        invoiceNumber: result.data.invoiceNumber || invoiceNumber,
        customerName: customerData.fullName,
        fulfillmentType,
        total: result.data.totalAmount ?? total,
        // Use server-returned subtotal so it always matches total (e.g. sale_price applied)
        subtotal: result.data.subtotalAmount ?? rawSubtotal,
        // Use server-returned VAT amount for consistency
        vatAmount: result.data.vatAmount ?? vatAmount,
        vatRate: isVatApplied ? 16 : 0,
        accessToken: result.data.invoiceAccessToken,
        pricingModel: orderPricingModel,
        purchasedItems: purchasedItemsSnapshot,
      };

      setConfirmedOrder(orderData);

      try {
        sessionStorage.setItem(
          'devireen_last_confirmed_order',
          JSON.stringify({
            order: orderData,
            savedAt: Date.now(),
          })
        );
      } catch {
        // Ignore storage errors
      }

      clearCart();
      setStep('confirmation');
    } catch (error: any) {
      toast({
        title: 'Order Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRestoreCart(purchasedItems: any[]) {
    const addItem = useQuoteCart.getState().addItem;
    for (const it of purchasedItems) {
      addItem({
        id: it.id,
        name: it.name,
        sku: it.sku,
        price: it.price,
        wholesalePrice: it.wholesalePrice,
        wholesaleUnit: it.wholesaleUnit,
        pricingMode: it.pricingMode,
        imageUrl: it.imageUrl,
        quantity: it.quantity,
      });
    }
    toast({
      title: 'Items Restored to Cart',
      description: 'Your previous items are now back in your cart.',
      variant: 'success',
    });
    try {
      sessionStorage.removeItem('devireen_last_confirmed_order');
    } catch {}
    setConfirmedOrder(null);
    setStep('cart');
  }

  async function handleDeliverySubmit(data: DeliveryFormData) {
    await submitOrder({
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      deliveryAddress: data.deliveryAddress,
      county: data.county,
      courierService: data.courierService,
      deliveryNotes: data.deliveryNotes,
    });
  }

  async function handlePickupSubmit(data: PickupFormData) {
    await submitOrder({
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
    });
  }

  // ─── STEP: Confirmation ──────────────────────────────────────────────────

  if (step === 'confirmation' && confirmedOrder) {
    return (
      <div className="container mx-auto px-4 py-6 pb-32 sm:px-6 sm:py-10 sm:pb-10 lg:px-8">
        <PageHeader current="confirmation" />
        <OrderConfirmation
          orderId={confirmedOrder.orderId}
          invoiceNumber={confirmedOrder.invoiceNumber}
          customerName={confirmedOrder.customerName}
          fulfillmentType={confirmedOrder.fulfillmentType}
          items={confirmedOrder.purchasedItems || []}
          total={confirmedOrder.total}
          subtotal={confirmedOrder.subtotal}
          vatAmount={confirmedOrder.vatAmount}
          vatRate={confirmedOrder.vatRate}
          whatsappNumber={whatsappNumber}
          mapsUrl={mapsUrl}
          shopAddress={shopAddress}
          pricingModel={confirmedOrder.pricingModel}
          accessToken={confirmedOrder.accessToken}
          onRestoreCart={() =>
            handleRestoreCart(confirmedOrder.purchasedItems || [])
          }
        />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-center">
          <Button
            variant="outline"
            onClick={() => {
              try {
                sessionStorage.removeItem('devireen_last_confirmed_order');
              } catch {}
              setConfirmedOrder(null);
              setStep('cart');
            }}
          >
            Start a New Order
          </Button>
          <Link
            href={
              confirmedOrder.pricingModel === 'WHOLESALE'
                ? '/wholesale'
                : '/products'
            }
          >
            <Button variant="primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── Shared layout ────────────────────────────────────────────────────────

  return (
    // pb-32 ensures content is never hidden under the WhatsApp widget on mobile
    <div className="container mx-auto px-4 py-6 pb-32 sm:px-6 sm:py-10 sm:pb-10 lg:px-8">
      {/* Page Header with dynamic Page 1-4 indicator */}
      <PageHeader
        current={step}
        onBack={
          step === 'details'
            ? () => setStep('fulfillment')
            : step === 'fulfillment'
              ? () => setStep('cart')
              : undefined
        }
      />

      {/* Main grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: main content */}
        <div className="lg:col-span-2">
          {/* ── PAGE 1: Cart ─────────────────────────────── */}
          {step === 'cart' && (
            <div className="border-border-subtle bg-surface overflow-hidden rounded-xl border shadow-sm">
              <div className="border-border-subtle bg-background/50 flex items-center justify-between rounded-t-2xl border-b p-5">
                <h3 className="text-text-main text-lg font-bold">
                  Cart Items ({itemCount})
                </h3>
                <Link
                  href={
                    items.some(
                      (i) => (i.pricingMode ?? 'RETAIL') === 'WHOLESALE'
                    )
                      ? '/wholesale'
                      : '/products'
                  }
                  className="text-primary-600 hover:text-primary-700 bg-primary-50 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>
              <div className="px-4 py-3 sm:px-6">
                {items.map((item) => (
                  <CartItemRow
                    key={`${item.id}:${item.pricingMode ?? 'RETAIL'}`}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              {/* Page 1 Bottom Navigation */}
              <div className="bg-background/50 border-border-subtle flex flex-col items-center justify-between gap-4 rounded-b-2xl border-t p-4 sm:flex-row sm:p-6">
                <Link
                  href={
                    items.some(
                      (i) => (i.pricingMode ?? 'RETAIL') === 'WHOLESALE'
                    )
                      ? '/wholesale'
                      : '/products'
                  }
                  className="text-text-muted hover:text-text-main order-2 flex items-center gap-1.5 text-sm font-medium transition-colors sm:order-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setStep('fulfillment')}
                  className="order-1 w-full px-8 py-3.5 text-base font-semibold shadow-md transition-all hover:shadow-lg sm:order-2 sm:w-auto"
                >
                  Next: Fulfillment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* ── PAGE 2: Fulfillment ──────────────────────── */}
          {step === 'fulfillment' && (
            <div className="border-border-subtle bg-surface space-y-6 rounded-xl border p-6 shadow-sm">
              <div>
                <h3 className="text-text-main text-lg font-bold">
                  Select Delivery or Personal Pickup
                </h3>
                <p className="text-text-muted mt-1 text-sm">
                  Choose how you would like to receive your items.
                </p>
              </div>

              <FulfillmentSelector
                value={fulfillmentType}
                onChange={(type) => setFulfillmentType(type)}
              />

              {!fulfillmentType && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  * Please select one of the fulfillment options above to
                  continue.
                </p>
              )}

              {/* Page 2 Bottom Navigation */}
              <div className="border-border-subtle flex flex-col-reverse items-center justify-between gap-4 border-t pt-6 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('cart')}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Cart
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  disabled={!fulfillmentType}
                  onClick={() => setStep('details')}
                  className="w-full px-8 py-3.5 text-base font-semibold shadow-md transition-all hover:shadow-lg sm:w-auto"
                >
                  Next: Enter Details
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* ── PAGE 3: Details ──────────────────────────── */}
          {step === 'details' && fulfillmentType === 'DELIVERY' && (
            <div className="border-border-subtle bg-surface rounded-xl border p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-text-main text-lg font-bold">
                  Delivery &amp; Contact Details
                </h3>
                <p className="text-text-muted mt-1 text-sm">
                  Provide your delivery address and recipient contact details.
                </p>
              </div>
              <DeliveryForm
                onSubmit={handleDeliverySubmit}
                isSubmitting={isSubmitting}
                onBack={() => setStep('fulfillment')}
              />
            </div>
          )}

          {step === 'details' && fulfillmentType === 'PICKUP' && (
            <div className="border-border-subtle bg-surface rounded-xl border p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-text-main text-lg font-bold">
                  Pickup &amp; Contact Details
                </h3>
                <p className="text-text-muted mt-1 text-sm">
                  Confirm your contact details for store pickup at our premises.
                </p>
              </div>
              <PickupForm
                onSubmit={handlePickupSubmit}
                isSubmitting={isSubmitting}
                shopAddress={shopAddress}
                mapsUrl={mapsUrl}
                onBack={() => setStep('fulfillment')}
              />
            </div>
          )}
        </div>

        {/* Right: Totals sidebar */}
        <div>
          <TotalsSidebar
            subtotal={subtotal}
            vatAmount={vatAmount}
            total={total}
            itemCount={itemCount}
            enableVat={enableVat}
            isVatApplied={isVatApplied}
            primaryAction={
              <div className="space-y-4">
                {enableVat && (
                  <div className="border-border-subtle bg-background/70 hover:bg-background rounded-xl border p-3.5 text-sm transition-all">
                    <label className="flex cursor-pointer items-start space-x-2.5">
                      <input
                        type="checkbox"
                        checked={requiresVat}
                        onChange={(e) => setRequiresVat(e.target.checked)}
                        className="text-primary-600 focus:ring-primary-500 mt-0.5 h-4 w-4 rounded border-slate-300"
                      />
                      <div>
                        <span className="text-text-main block text-xs font-semibold sm:text-sm">
                          Add 16% VAT &amp; KRA PIN (Optional)
                        </span>
                        <span className="text-text-muted mt-0.5 block text-[11px]">
                          Check this if you require an official ETR / Tax
                          invoice for company expense claims.
                        </span>
                      </div>
                    </label>
                    {requiresVat && (
                      <div className="border-border-subtle animate-in fade-in mt-3 border-t pt-3 duration-200">
                        <label
                          htmlFor="kra_pin"
                          className="text-text-muted mb-1 block text-xs font-medium"
                        >
                          Company / Personal KRA PIN (Optional)
                        </label>
                        <input
                          id="kra_pin"
                          type="text"
                          value={kraPin}
                          onChange={(e) => setKraPin(e.target.value)}
                          placeholder="e.g. P051234567Z"
                          className="border-border-main bg-surface focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}
                {step === 'cart' && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setStep('fulfillment');
                    }}
                    className="w-full rounded-xl py-4 text-base font-semibold shadow-md transition-all hover:shadow-lg"
                  >
                    Next: Fulfillment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
