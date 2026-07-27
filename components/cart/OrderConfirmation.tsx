'use client';

import * as React from 'react';
import { CheckCircle, Download, MessageSquare, MapPin, Package, Smartphone } from 'lucide-react';
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
  pricingModel: 'RETAIL' | 'BULK';
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
      <div className="flex flex-col items-center text-center py-8 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-text-main">Order Confirmed!</h2>
        <p className="text-text-muted mt-2 text-sm leading-relaxed">
          Your order has been placed successfully. Download your invoice below and use it as your
          purchase reference.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-2">
          <Package className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-medium text-text-main">
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
          className="flex items-center gap-4 rounded-xl border-2 border-primary-500 bg-primary-50/30 p-4 hover:bg-primary-50/60 transition-colors group"
        >
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-white shadow-md shadow-primary-200">
            <Download className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-text-main text-sm">Download Invoice PDF</p>
            <p className="text-xs text-text-muted mt-0.5">
              {invoiceNumber} — Keep this for your records
            </p>
          </div>
          <span className="text-xs font-medium text-primary-600 group-hover:underline">
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
              <p className="font-bold text-text-main text-sm">Pay via M-Pesa</p>
              <p className="text-xs text-text-muted mt-0.5 mb-3">
                Complete your order by sending payment and sharing your screenshot.
              </p>

              {/* Steps */}
              <ol className="space-y-3">
                {/* Step 1 */}
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white mt-0.5">1</span>
                  <div>
                    <p className="text-sm font-semibold text-text-main">
                      Send{' '}
                      <span className="text-emerald-700">KSh {total.toLocaleString()}</span>{' '}
                      to M-Pesa
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Number:{' '}
                      <strong className="font-mono text-emerald-800 text-sm tracking-wide">+254 708 037929</strong>
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Use{' '}
                      <span className="font-mono font-semibold">{invoiceNumber}</span>{' '}
                      as your payment reference.
                    </p>
                  </div>
                </li>

                {/* Step 2 */}
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white mt-0.5">2</span>
                  <p className="text-sm text-text-muted leading-snug">
                    Take a <strong className="text-text-main">screenshot</strong> of the M-Pesa confirmation SMS on your phone.
                  </p>
                </li>

                {/* Step 3 */}
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white mt-0.5">3</span>
                  <p className="text-sm text-text-muted leading-snug">
                    Send the screenshot via{' '}
                    <strong className="text-text-main">WhatsApp</strong>{' '}
                    using the button below to confirm your payment.
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
            className="flex w-full items-center gap-4 rounded-xl border border-border-subtle bg-surface p-4 hover:bg-background transition-colors text-left group"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <MapPin className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-text-main text-sm">Get Directions to Our Shop</p>
              {shopAddress && (
                <p className="text-xs text-text-muted mt-0.5 leading-snug">{shopAddress}</p>
              )}
            </div>
            <span className="text-xs font-medium text-amber-600 group-hover:underline">Open →</span>
          </button>
        )}

        {/* WhatsApp — Send Payment Screenshot (always shown) */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex w-full items-center gap-4 rounded-xl border-2 border-green-300 bg-green-50 p-4 hover:bg-green-100 transition-colors text-left group"
        >
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md shadow-green-200">
            <MessageSquare className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-bold text-text-main text-sm">
              {whatsappSent ? '✓ Payment Confirmation Sent' : 'Send Payment Screenshot via WhatsApp'}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {whatsappSent
                ? 'We will process your order once payment is verified.'
                : 'Attach your M-Pesa screenshot in the WhatsApp chat to confirm payment.'}
            </p>
          </div>
          {!whatsappSent && (
            <span className="text-xs font-bold text-green-700 group-hover:underline whitespace-nowrap">Open →</span>
          )}
        </button>
      </div>

      {/* Order summary */}
      <div className="mt-6 mx-2 rounded-xl border border-border-subtle bg-background p-4">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
          Order Summary
        </h3>
        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-text-muted">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium text-text-main">
                KSh {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="border-t border-border-subtle pt-2 mt-2 flex items-center justify-between text-sm font-bold text-text-main">
            <span>Total</span>
            <span>KSh {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
