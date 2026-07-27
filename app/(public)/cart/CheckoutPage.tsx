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
}

interface ConfirmedOrder {
  orderId: string;
  invoiceNumber: string;
  customerName: string;
  fulfillmentType: FulfillmentType;
  total: number;
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
              <li className="flex flex-col items-center shrink-0">
                <span
                  className={cn(
                    'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs font-bold transition-all',
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-200 ring-4 ring-primary-100'
                      : 'bg-border-subtle text-text-muted'
                  )}
                >
                  {isDone ? '✓' : idx + 1}
                </span>
                {/* Step labels: visible on sm+, hidden on mobile */}
                <span
                  className={cn(
                    'mt-1.5 text-xs font-medium text-center max-w-[3.75rem] leading-tight hidden sm:block',
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
                    'h-0.5 flex-1 mx-1.5 sm:mx-2 sm:mb-6 transition-all',
                    idx < currentIndex ? 'bg-emerald-400' : 'bg-border-subtle'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
      {/* Active step indicator on mobile (replaces clipped labels) */}
      <p className="mt-3 text-center text-xs font-semibold text-primary-600 sm:hidden">
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
  bulkMode,
  onToggleBulk,
  showBulkToggle,
  primaryAction,
}: {
  subtotal: number;
  vatAmount: number;
  total: number;
  itemCount: number;
  bulkMode: boolean;
  onToggleBulk: () => void;
  showBulkToggle: boolean;
  primaryAction?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-md sticky top-6 space-y-5">
      <h2 className="text-xl font-bold text-text-main">Order Summary</h2>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-text-muted">
          <span>Items ({itemCount})</span>
          <span className="tabular-nums">KSh {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-text-muted">
          <span>VAT (16%)</span>
          <span className="tabular-nums">KSh {vatAmount.toLocaleString()}</span>
        </div>
        {/* Total — visually prominent */}
        <div className="border-t-2 border-border-subtle pt-4 mt-1">
          <div className="flex justify-between items-baseline">
            <span className="text-base font-bold text-text-main">Total</span>
            <span className="text-2xl font-extrabold text-primary-600 tabular-nums">
              KSh {total.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-muted">Inclusive of 16% VAT</p>
        </div>
      </div>

      {/* Bulk mode toggle */}
      {showBulkToggle && (
        <div className="border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={onToggleBulk}
            className={cn(
              'w-full flex items-center justify-between rounded-xl border p-4 text-sm transition-all duration-300',
              bulkMode
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm shadow-emerald-100'
                : 'border-border-subtle bg-background text-text-muted hover:border-primary-300 hover:shadow-sm'
            )}
          >
            <span className="font-medium">
              {bulkMode ? '★ Bulk Pricing Active' : 'Switch to Bulk Pricing'}
            </span>
            <span
              className={cn(
                'relative h-5 w-9 rounded-full transition-colors',
                bulkMode ? 'bg-emerald-500' : 'bg-border-main'
              )}
            >
              <span
                className={cn(
                  'absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-all duration-300',
                  bulkMode ? 'left-[20px]' : 'left-[3px]'
                )}
              />
            </span>
          </button>
          <p className="mt-2 text-xs text-text-muted leading-relaxed">
            {bulkMode
              ? 'Wholesale rates have been applied to eligible items.'
              : 'Enable this to see wholesale pricing if you are buying in bulk.'}
          </p>
        </div>
      )}

      {primaryAction && (
        <div className="pt-4 border-t border-border-subtle">
          {primaryAction}
        </div>
      )}
    </div>
  );
}

// ─── Main CheckoutPage ─────────────────────────────────────────────────────

export function CheckoutPage({ whatsappNumber, shopAddress, mapsUrl }: CheckoutPageProps) {
  const { items, updateQuantity, removeItem, getSummary, toggleBulkMode, bulkMode, clearCart } =
    useQuoteCart();

  const [mounted, setMounted] = React.useState(false);
  const [step, setStep] = React.useState<CheckoutStep>('cart');
  const [fulfillmentType, setFulfillmentType] = React.useState<FulfillmentType | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [confirmedOrder, setConfirmedOrder] = React.useState<ConfirmedOrder | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const { subtotal, vatAmount, total, itemCount, pricingModel } = getSummary();
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

    const payload = {
      customerName: customerData.fullName,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      fulfillmentType,
      pricingModel,
      totalAmount: total,
      invoiceNumber,
      ...(fulfillmentType === 'DELIVERY' && {
        deliveryAddress: customerData.deliveryAddress,
        county: customerData.county,
        courierService: customerData.courierService,
        deliveryNotes: customerData.deliveryNotes,
      }),
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: bulkMode && item.bulkPrice != null ? item.bulkPrice : item.price,
      })),
    };

    try {
      const result = await createPublicOrderAction(payload as any);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Order creation failed');
      }

      setConfirmedOrder({
        orderId: result.data.orderId,
        invoiceNumber,
        customerName: customerData.fullName,
        fulfillmentType,
        total,
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
          pricingModel={pricingModel}
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
    <div className="py-6 sm:py-10 pb-32 sm:pb-10">
      {/* Page header: back button + title unified */}
      <div className="mb-6 flex items-start gap-3">
        {step !== 'cart' && (
          <button
            type="button"
            onClick={() =>
              setStep(
                step === 'details' ? 'fulfillment' : step === 'fulfillment' ? 'cart' : 'cart'
              )
            }
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-main hover:bg-surface transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 text-text-muted" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-main sm:text-4xl">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-text-muted sm:text-base">
            Review your items and complete your order.
          </p>
        </div>
      </div>

      {/* Step bar */}
      <StepBar current={step} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left: main content */}
        <div className="lg:col-span-2">
          {/* ── STEP: Cart ─────────────────────────────── */}
          {step === 'cart' && (
            <div className="rounded-xl border border-border-subtle bg-surface overflow-hidden shadow-sm">
              <div className="flex items-center justify-between border-b border-border-subtle p-5 bg-background/50 rounded-t-2xl">
                <h3 className="font-bold text-lg text-text-main">Cart Items</h3>
                <Link
                  href="/products"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-full"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>
              <div className="px-4 sm:px-6 py-3">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    bulkMode={bulkMode}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
              <div className="px-4 sm:px-6 py-4 bg-background/50 rounded-b-2xl border-t border-border-subtle text-right">
                 <p className="text-xs text-text-muted">Prices are inclusive of VAT where applicable.</p>
              </div>
            </div>
          )}

          {/* ── STEP: Fulfillment ──────────────────────── */}
          {step === 'fulfillment' && (
            <div className="rounded-xl border border-border-subtle bg-surface p-6 space-y-6">
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
            <div className="rounded-xl border border-border-subtle bg-surface p-6">
              <DeliveryForm onSubmit={handleDeliverySubmit} isSubmitting={isSubmitting} />
            </div>
          )}

          {step === 'details' && fulfillmentType === 'PICKUP' && (
            <div className="rounded-xl border border-border-subtle bg-surface p-6">
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
            bulkMode={bulkMode}
            onToggleBulk={toggleBulkMode}
            showBulkToggle={step === 'cart' || step === 'fulfillment'}
            primaryAction={
              step === 'cart' ? (
                <Button
                  variant="primary"
                  onClick={() => setStep('fulfillment')}
                  className="w-full text-base py-6 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Proceed to Checkout
                </Button>
              ) : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
