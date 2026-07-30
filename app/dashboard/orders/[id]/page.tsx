import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  Download,
  MessageSquare,
  Truck,
  Store,
  MapPin,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { OrderTimeline } from '@/components/dashboard/orders/OrderTimeline';
import { SettingsRepository } from '@/lib/supabase/repositories/settings.repository';

export const metadata = {
  title: 'Order Details | Devireen Enterprise',
};

async function getOrderById(id: string) {
  const supabase = await createClient();
  const { data: order } = await supabase
    .from('orders')
    .select('*, customers(*)')
    .eq('id', id)
    .single();

  if (!order) return null;

  const { data: items } = await supabase
    .from('order_items')
    .select('*, products(name, sku, price, wholesale_price)')
    .eq('order_id', id);

  return { ...order, items: items || [] };
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    getOrderById(id),
    SettingsRepository.getSettings(),
  ]);

  if (!order) {
    notFound();
  }

  const isDelivery = order.fulfillment_type === 'DELIVERY';
  const isPickup = order.fulfillment_type === 'PICKUP';
  const isWholesale = order.pricing_model === 'WHOLESALE';

  const customerName =
    order.customer_name ||
    (order.customers
      ? `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim() ||
        order.customers.company_name
      : 'Guest');

  const customerEmail =
    order.customer_email || order.customers?.contact_email || '';
  const customerPhone =
    order.customer_phone || order.customers?.contact_phone || '';

  const getStatusVariant = (status: string) => {
    if (status === 'PENDING') return 'warning';
    if (status === 'CANCELLED' || status === 'REFUNDED') return 'error';
    return 'success';
  };

  const whatsappPhone = (settings?.whatsapp_number || '254708037929').replace(
    /\D/g,
    ''
  );
  const mapsUrl = settings?.google_maps_url || '';
  const shopAddress = settings?.physical_address || '';

  const whatsappText =
    `*Order ${order.invoice_number || order.id.substring(0, 8).toUpperCase()}*\n` +
    `Customer: ${customerName}\n` +
    `Fulfillment: ${order.fulfillment_type || 'N/A'}\n` +
    `Total: KSh ${order.total_amount?.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {order.invoice_number ||
                  `Order #${order.id.substring(0, 8).toUpperCase()}`}
              </h1>
              <Badge variant={getStatusVariant(order.status) as any}>
                {order.status}
              </Badge>
              <Badge
                variant={
                  order.payment_status === 'PAID' ? 'success' : 'warning'
                }
              >
                {order.payment_status}
              </Badge>
              {isWholesale && (
                <Badge variant="success" className="px-2.5 py-0.5">
                  WHOLESALE PRICING
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {format(new Date(order.created_at), 'MMMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {order.invoice_number && (
            <a
              href={`/api/invoice/${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            </a>
          )}
          <a
            href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-50"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              WhatsApp {order.whatsapp_sent && '(Sent ✓)'}
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 xl:col-span-2">
          {/* Items table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Order Items
              </h2>
              {isWholesale && (
                <div className="flex w-fit items-center rounded-md border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                  ★ Wholesale pricing applied
                </div>
              )}
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 text-right font-medium">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-right font-medium">Qty</th>
                    <th className="px-6 py-3 text-right font-medium">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.length > 0 ? (
                    order.items.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {item.products?.name || 'Unknown Product'}
                          </div>
                          <div className="text-xs text-gray-500">
                            SKU: {item.products?.sku || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          KSh {item.unit_price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          KSh{' '}
                          {(
                            item.quantity * (item.unit_price || 0)
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No items found for this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 border-t border-gray-100 bg-gray-50/50 px-6 py-5">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal (excl. VAT)</span>
                <span>KSh {(order.total_amount / 1.16).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>VAT (16%)</span>
                <span>
                  KSh{' '}
                  {(order.total_amount - order.total_amount / 1.16).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900">
                <span>Grand Total</span>
                <span>KSh {order.total_amount?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment details */}
          {(isDelivery || isPickup) && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 px-6 py-5">
                {isDelivery ? (
                  <Truck className="h-5 w-5 text-blue-500" />
                ) : (
                  <Store className="h-5 w-5 text-amber-500" />
                )}
                <h2 className="text-lg font-semibold text-gray-900">
                  {isDelivery ? 'Delivery Details' : 'Pickup Details'}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
                {isDelivery && (
                  <>
                    {order.delivery_address && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                          Delivery Address
                        </p>
                        <p className="text-sm text-gray-900">
                          {order.delivery_address}
                        </p>
                      </div>
                    )}
                    {order.county && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                          County / Area
                        </p>
                        <p className="text-sm text-gray-900">{order.county}</p>
                      </div>
                    )}
                    {order.courier_service && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                          Courier Service
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.courier_service}
                        </p>
                      </div>
                    )}
                    {order.delivery_notes && (
                      <div className="sm:col-span-2">
                        <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                          Delivery Notes
                        </p>
                        <p className="text-sm text-gray-700 italic">
                          {order.delivery_notes}
                        </p>
                      </div>
                    )}
                  </>
                )}
                {isPickup && (shopAddress || mapsUrl) && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <div>
                      <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                        Pickup Location
                      </p>
                      <p className="text-sm text-gray-900">
                        {shopAddress || 'Our premises'}
                      </p>
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                        >
                          Open in Maps →
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer info */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="border-b pb-3 text-base font-semibold text-gray-900">
              Customer
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {customerName}
                </span>
              </div>
              {customerEmail && (
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <a
                    href={`mailto:${customerEmail}`}
                    className="break-all text-blue-600 hover:underline"
                  >
                    {customerEmail}
                  </a>
                </div>
              )}
              {customerPhone && (
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <a href={`tel:${customerPhone}`} className="text-gray-900">
                    {customerPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Order meta */}
          <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="border-b pb-3 text-base font-semibold text-gray-900">
              Order Info
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice #</span>
                <span className="font-mono font-medium text-gray-900">
                  {order.invoice_number || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pricing</span>
                <span className="font-medium text-gray-900">
                  {order.pricing_model || 'RETAIL'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">WhatsApp</span>
                <span
                  className={
                    order.whatsapp_sent
                      ? 'font-medium text-green-600'
                      : 'text-gray-400'
                  }
                >
                  {order.whatsapp_sent ? 'Sent ✓' : 'Not sent'}
                </span>
              </div>
              {order.quote_id && (
                <div className="border-t border-gray-100 pt-2">
                  <Link
                    href={`/dashboard/quotes/${order.quote_id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View Original Quote →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <OrderTimeline
            status={order.status}
            paymentStatus={order.payment_status}
            createdAt={order.created_at}
          />
        </div>
      </div>
    </div>
  );
}
