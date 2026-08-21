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
import { ShoppingCart, ArrowLeft, Zap, PackageCheck } from 'lucide-react';
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
  accessToken?: string;
}

// ─── Step indicator ───────────────────────────────────────────────────────

const STEPS: Array<{ id: CheckoutStep; label: string }> = [
  { id: 'cart', label: 'Cart' },
  { id: 'fulfillment', label: 'Fulfillment' },
  { id: 'details', label: 'Details' },
  { id: 'confirmation', label: 'Confirmation' },
];

function StepBar({ current }: { current: CheckoutStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  const activeStep = STEPS[currentIndex];

  return (
    <nav aria-label="Checkout progress" className="mb-6 sm:mb-8">
      <ol className="flex items-center">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;
          return (
            <React.Fragment key={step.id}>
              <li className="flex shrink-0 flex-col items-center">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all sm:h-9 sm:w-9',
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isActive
                        ? 'bg-primary-600 shadow-primary-200 ring-primary-100 text-white shadow-md ring-4'
                        : 'bg-border-subtle text-text-muted'
                  )}
                >
                  {isDone ? '✓' : idx + 1}
                </span>
                {/* Step labels: visible on sm+, hidden on mobile */}
                <span
                  className={cn(
                    'mt-1.5 hidden max-w-[3.75rem] text-center text-xs leading-tight font-medium sm:block',
                    isActive
                      ? 'text-primary-600 font-semibold'
                      : isDone
                        ? 'text-emerald-600'
                        : 'text-text-muted'
                  )}
                >
                  {step.label}
                </span>
              </li>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-1.5 h-0.5 flex-1 transition-all sm:mx-2 sm:mb-6',
                    idx < currentIndex ? 'bg-emerald-400' : 'bg-border-subtle'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
      {/* Active step indicator on mobile (replaces clipped labels) */}
      <p className="text-primary-600 mt-3 text-center text-xs font-semibold sm:hidden">
        Step {currentIndex + 1} of {STEPS.length} — {activeStep.label}
      </p>
    </nav>
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
  }, []);

  if (!mounted) return null;

  const rawSubtotal = items.reduce(
    (acc, item) =>
      acc +
      (item.wholesalePrice != null ? item.wholesalePrice : item.price) *
        item.quantity,
    0
  );

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
      <div className="py-16">
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
    email: string;
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

    const payload = {
      customerName: customerData.fullName,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      fulfillmentType,
      pricingModel: wholesaleMode ? 'WHOLESALE' : 'RETAIL',
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
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice:
          wholesaleMode && item.wholesalePrice != null
            ? item.wholesalePrice
            : item.price,
      })),
    };

    try {
      const result = await createPublicOrderAction(payload as any);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Order creation failed');
      }

      setConfirmedOrder({
        orderId: result.data.orderId,
        invoiceNumber: result.data.invoiceNumber || invoiceNumber,
        customerName: customerData.fullName,
        fulfillmentType,
        total: result.data.totalAmount ?? total,
        accessToken: result.data.invoiceAccessToken,
      });

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
      <div className="py-4">
        <OrderConfirmation
          orderId={confirmedOrder.orderId}
          invoiceNumber={confirmedOrder.invoiceNumber}
          customerName={confirmedOrder.customerName}
          fulfillmentType={confirmedOrder.fulfillmentType}
          items={items.length > 0 ? items : []}
          total={confirmedOrder.total}
          whatsappNumber={whatsappNumber}
          mapsUrl={mapsUrl}
          shopAddress={shopAddress}
          pricingModel={wholesaleMode ? 'WHOLESALE' : 'RETAIL'}
          accessToken={confirmedOrder.accessToken}
        />
        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline">
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
    <div className="py-6 pb-32 sm:py-10 sm:pb-10">
      {/* Page header: back button + title unified */}
      <div className="mb-6 flex items-start gap-3">
        {step !== 'cart' && (
          <button
            type="button"
            onClick={() =>
              setStep(
                step === 'details'
                  ? 'fulfillment'
                  : step === 'fulfillment'
                    ? 'cart'
                    : 'cart'
              )
            }
            className="border-border-main hover:bg-surface mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="text-text-muted h-4 w-4" />
          </button>
        )}
        <div>
          <h1 className="text-text-main text-2xl font-extrabold tracking-tight sm:text-4xl">
            Checkout
          </h1>
          <p className="text-text-muted mt-1 text-sm sm:text-base">
            Review your items and complete your order.
          </p>
        </div>
      </div>

      {/* Step bar */}
      <StepBar current={step} />

      {/* Main grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: main content */}
        <div className="lg:col-span-2">
          {/* ── STEP: Cart ─────────────────────────────── */}
          {step === 'cart' && (
            <div className="border-border-subtle bg-surface overflow-hidden rounded-xl border shadow-sm">
              <div className="border-border-subtle bg-background/50 flex items-center justify-between rounded-t-2xl border-b p-5">
                <h3 className="text-text-main text-lg font-bold">Cart Items</h3>
                <Link
                  href="/products"
                  className="text-primary-600 hover:text-primary-700 bg-primary-50 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>
              <div className="px-4 py-3 sm:px-6">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
              <div className="bg-background/50 border-border-subtle rounded-b-2xl border-t px-4 py-4 text-right sm:px-6">
                <p className="text-text-muted text-xs">
                  Prices are inclusive of VAT where applicable.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP: Fulfillment ──────────────────────── */}
          {step === 'fulfillment' && (
            <div className="border-border-subtle bg-surface space-y-6 rounded-xl border p-6">
              <FulfillmentSelector
                value={fulfillmentType}
                onChange={(type) => setFulfillmentType(type)}
              />
              <Button
                variant="primary"
                className="w-full"
                disabled={!fulfillmentType}
                onClick={() => setStep('details')}
              >
                <PackageCheck className="mr-2 h-4 w-4" />
                Continue with{' '}
                {fulfillmentType === 'DELIVERY'
                  ? 'Delivery'
                  : fulfillmentType === 'PICKUP'
                    ? 'Pickup'
                    : '...'}
              </Button>
            </div>
          )}

          {/* ── STEP: Details ──────────────────────────── */}
          {step === 'details' && fulfillmentType === 'DELIVERY' && (
            <div className="border-border-subtle bg-surface rounded-xl border p-6">
              <DeliveryForm
                onSubmit={handleDeliverySubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {step === 'details' && fulfillmentType === 'PICKUP' && (
            <div className="border-border-subtle bg-surface rounded-xl border p-6">
              <PickupForm
                onSubmit={handlePickupSubmit}
                isSubmitting={isSubmitting}
                shopAddress={shopAddress}
                mapsUrl={mapsUrl}
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
                    className="w-full rounded-xl py-6 text-base shadow-md transition-all hover:shadow-lg"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Proceed to Checkout
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
