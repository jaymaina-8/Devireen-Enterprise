'use client';

import * as React from 'react';
import {
  CheckCircle,
  Download,
  MessageSquare,
  MapPin,
  Package,
  Smartphone,
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
  whatsappNumber?: string;
  mapsUrl?: string;
  shopAddress?: string;
  pricingModel: 'RETAIL' | 'WHOLESALE';
}

export function OrderConfirmation({
  orderId,
  invoiceNumber,
  customerName,
  fulfillmentType,
  items,
  total,
  whatsappNumber,
  mapsUrl,
  shopAddress,
  pricingModel,
}: OrderConfirmationProps) {
  const [whatsappSent, setWhatsappSent] = React.useState(false);

  const invoiceUrl = `/api/invoice/${orderId}`;

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

      {/* Order summary */}
      <div className="border-border-subtle bg-background mx-2 mt-6 rounded-xl border p-4">
        <h3 className="text-text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
          Order Summary
        </h3>
        <div className="space-y-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-text-muted">
                {item.name} × {item.quantity}
              </span>
              <span className="text-text-main font-medium">
                KSh {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="border-border-subtle text-text-main mt-2 flex items-center justify-between border-t pt-2 text-sm font-bold">
            <span>Total</span>
            <span>KSh {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
