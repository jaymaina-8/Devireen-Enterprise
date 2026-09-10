'use client';

import * as React from 'react';
import {
  CheckCircle,
  Download,
  MessageSquare,
  MapPin,
  Package,
  Smartphone,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { markOrderWhatsAppSentAction } from '@/actions/order.actions';
import { CartItem } from '@/lib/store/quote-cart';

interface OrderConfirmationProps {
  orderId: string;
  invoiceNumber: string;
  customerName: string;
  fulfillmentType: 'DELIVERY' | 'PICKUP';
  items: CartItem[];
  total: number;
  subtotal?: number;
  vatAmount?: number;
  vatRate?: number;
  whatsappNumber?: string;
  mapsUrl?: string;
  shopAddress?: string;
  pricingModel: 'RETAIL' | 'WHOLESALE';
  accessToken?: string;
  onRestoreCart?: () => void;
}

export function OrderConfirmation({
  orderId,
  invoiceNumber,
  customerName,
  fulfillmentType,
  items = [],
  total,
  subtotal,
  vatAmount,
  vatRate,
  whatsappNumber,
  mapsUrl,
  shopAddress,
  pricingModel,
  accessToken,
  onRestoreCart,
}: OrderConfirmationProps) {
  const [whatsappSent, setWhatsappSent] = React.useState(false);

  const invoiceUrl = accessToken
    ? `/api/invoice/${orderId}?token=${encodeURIComponent(accessToken)}`
    : `/api/invoice/${orderId}`;

  function handleOpenMaps() {
    try {
      if (mapsUrl) {
        window.open(mapsUrl, '_blank', 'noopener,noreferrer');
      } else if (shopAddress) {
        const query = encodeURIComponent(shopAddress);
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${query}`,
          '_blank',
          'noopener,noreferrer'
        );
      }
    } catch {
      // Silently fail
    }
  }

  async function handleWhatsApp() {
    const phone = (whatsappNumber || '254708037929').replace(/\D/g, '');

    const header =
      fulfillmentType === 'DELIVERY'
        ? '📦 *Delivery Order — Payment Confirmation*'
        : '🏪 *Pickup Order — Payment Confirmation*';

    const text =
      `${header}\n\n` +
      `*Invoice:* ${invoiceNumber}\n` +
      `*Name:* ${customerName}\n\n` +
      `*Items:*\n` +
      items.map((i) => `• ${i.quantity}x ${i.name}`).join('\n') +
      `\n\n*Total: KSh ${total.toLocaleString()}*` +
      `\n*Pricing: ${pricingModel}*` +
      `\n\n---\n` +
      `*PAYMENT CONFIRMATION*\n` +
      `I have sent KSh ${total.toLocaleString()} to M-Pesa number *0708 037929*.\n` +
      `Please find my M-Pesa screenshot attached.\n` +
      `Reference: ${invoiceNumber}`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );

    // Mark as sent in DB (fire and forget)
    markOrderWhatsAppSentAction(orderId);
    setWhatsappSent(true);
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* Success header */}
      <div className="flex flex-col items-center px-6 py-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle className="h-8 w-8 text-emerald-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-text-main text-2xl font-bold">Order Confirmed!</h2>
        <p className="text-text-muted mt-2 text-sm leading-relaxed">
          Your order has been placed successfully. Download your invoice below
          and use it as your purchase reference.
        </p>
        <div className="border-border-subtle bg-surface mt-4 flex items-center gap-2 rounded-full border px-4 py-2">
          <Package className="text-primary-500 h-4 w-4" />
          <span className="text-text-main text-sm font-medium">
            Order #{invoiceNumber}
          </span>
        </div>
      </div>

      {/* ── Purchased Products Section (Prominently displayed) ── */}
      <div className="mx-2 mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary-600 h-5 w-5" />
            <h3 className="text-sm font-bold text-gray-900">
              Purchased Products
            </h3>
          </div>
          {items.length > 0 && (
            <span className="bg-primary-50 text-primary-700 rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {items.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {items.map((item, idx) => {
              const isWholesale =
                (item.pricingMode ?? 'RETAIL') === 'WHOLESALE';
              const effectiveUnitPrice =
                isWholesale && item.wholesalePrice != null
                  ? item.wholesalePrice
                  : item.price;
              const lineSubtotal = effectiveUnitPrice * item.quantity;

              return (
                <div
                  key={`${item.id}:${item.pricingMode ?? 'RETAIL'}-${idx}`}
                  className="flex items-start gap-3.5 p-4 transition-colors hover:bg-gray-50/60"
                >
                  {/* Thumbnail / Icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <Package className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="line-clamp-2 text-sm font-semibold text-gray-900">
                        {item.name}
                      </h4>
                      {isWholesale && (
                        <span className="inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          ★ Wholesale
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>SKU: {item.sku || 'N/A'}</span>
                      {isWholesale && item.wholesaleUnit && (
                        <span className="font-medium text-emerald-700">
                          • Unit: {item.wholesaleUnit}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        <strong className="font-mono text-gray-900">
                          KSh {effectiveUnitPrice.toLocaleString()}
                        </strong>
                        {isWholesale && item.wholesaleUnit
                          ? ` / ${item.wholesaleUnit}`
                          : ''}{' '}
                        × {item.quantity}
                      </span>
                      <span className="font-mono text-sm font-bold text-gray-900">
                        KSh {lineSubtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 text-center text-sm text-gray-600">
            <p className="font-semibold text-gray-800">
              Order #{invoiceNumber}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Your itemized purchase list is ready. Download your invoice PDF
              below for full details.
            </p>
          </div>
        )}

        {/* Financial Summary */}
        <div className="space-y-1.5 border-t border-gray-100 bg-gray-50/50 p-4 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal (excl. VAT)</span>
            <span className="font-mono font-medium text-gray-900">
              KSh {(subtotal ?? total).toLocaleString()}
            </span>
          </div>

          {vatAmount && vatAmount > 0 ? (
            <div className="flex justify-between text-gray-600">
              <span>VAT ({vatRate ?? 16}%)</span>
              <span className="font-mono font-medium text-gray-900">
                KSh {vatAmount.toLocaleString()}
              </span>
            </div>
          ) : null}

          <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold text-gray-900">
            <span>Total Amount</span>
            <span className="font-mono text-emerald-700">
              KSh {total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action cards */}
      <div className="space-y-3 px-2">
        {/* Primary: Invoice Download */}
        <a
          href={invoiceUrl}
          download={`Invoice-${invoiceNumber}.pdf`}
          className="border-primary-500 bg-primary-50/30 hover:bg-primary-50/60 group flex items-center gap-4 rounded-xl border-2 p-4 transition-colors"
        >
          <span className="bg-primary-500 shadow-primary-200 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white shadow-md">
            <Download className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-text-main text-sm font-semibold">
              Download Invoice PDF
            </p>
            <p className="text-text-muted mt-0.5 text-xs">
              {invoiceNumber} — Keep this for your records
            </p>
          </div>
          <span className="text-primary-600 text-xs font-medium group-hover:underline">
            Download →
          </span>
        </a>

        {/* ── Payment Instructions ── */}
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Smartphone className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-text-main text-sm font-bold">Pay via M-Pesa</p>
              <p className="text-text-muted mt-0.5 mb-3 text-xs">
                Complete your order by sending payment and sharing your
                screenshot.
              </p>

              {/* Steps */}
              <ol className="space-y-3">
                {/* Step 1 */}
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    1
                  </span>
                  <div>
                    <p className="text-text-main text-sm font-semibold">
                      Send{' '}
                      <span className="text-emerald-700">
                        KSh {total.toLocaleString()}
                      </span>{' '}
                      to M-Pesa
                    </p>
                    <p className="text-text-muted mt-0.5 text-xs">
                      Number:{' '}
                      <strong className="font-mono text-sm tracking-wide text-emerald-800">
                        +254 708 037929
                      </strong>
                    </p>
                    <p className="text-text-muted mt-0.5 text-xs">
                      Use{' '}
                      <span className="font-mono font-semibold">
                        {invoiceNumber}
                      </span>{' '}
                      as your payment reference.
                    </p>
                  </div>
                </li>

                {/* Step 2 */}
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    2
                  </span>
                  <p className="text-text-muted text-sm leading-snug">
                    Take a{' '}
                    <strong className="text-text-main">screenshot</strong> of
                    the M-Pesa confirmation SMS on your phone.
                  </p>
                </li>

                {/* Step 3 */}
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    3
                  </span>
                  <p className="text-text-muted text-sm leading-snug">
                    Send the screenshot via{' '}
                    <strong className="text-text-main">WhatsApp</strong> using
                    the button below to confirm your payment.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Pickup: Maps button */}
        {fulfillmentType === 'PICKUP' && (shopAddress || mapsUrl) && (
          <button
            type="button"
            onClick={handleOpenMaps}
            className="border-border-subtle bg-surface hover:bg-background group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <MapPin className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-text-main text-sm font-semibold">
                Get Directions to Our Shop
              </p>
              {shopAddress && (
                <p className="text-text-muted mt-0.5 text-xs leading-snug">
                  {shopAddress}
                </p>
              )}
            </div>
            <span className="text-xs font-medium text-amber-600 group-hover:underline">
              Open →
            </span>
          </button>
        )}

        {/* WhatsApp — Send Payment Screenshot (always shown) */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="group flex w-full items-center gap-4 rounded-xl border-2 border-green-300 bg-green-50 p-4 text-left transition-colors hover:bg-green-100"
        >
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md shadow-green-200">
            <MessageSquare className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-text-main text-sm font-bold">
              {whatsappSent
                ? '✓ Payment Confirmation Sent'
                : 'Send Payment Screenshot via WhatsApp'}
            </p>
            <p className="text-text-muted mt-0.5 text-xs">
              {whatsappSent
                ? 'We will process your order once payment is verified.'
                : 'Attach your M-Pesa screenshot in the WhatsApp chat to confirm payment.'}
            </p>
          </div>
          {!whatsappSent && (
            <span className="text-xs font-bold whitespace-nowrap text-green-700 group-hover:underline">
              Open →
            </span>
          )}
        </button>
      </div>

      {/* ── Re-add / Add More Items banner ── */}
      {onRestoreCart && items.length > 0 && (
        <div className="border-primary-200 bg-primary-50/60 mx-2 mt-4 rounded-xl border p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Want to add more products to this cart?
              </p>
              <p className="mt-0.5 text-xs text-gray-600">
                Keep all your ordered items in your cart so you can continue
                shopping without starting over.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRestoreCart}
              className="border-primary-300 text-primary-700 hover:bg-primary-50 shrink-0 bg-white font-semibold shadow-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-add Items & Shop
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
