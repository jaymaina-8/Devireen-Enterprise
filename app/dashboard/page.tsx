import { createClient } from '@/lib/supabase/server';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import {
  Package,
  Users,
  FileText,
  Settings,
  Tags,
  DollarSign,
  Activity,
  AlertTriangle,
  Plus,
  ShoppingCart,
  Star,
  Database,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  FileQuestion,
  ImageOff,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { format, startOfDay } from 'date-fns';

export const metadata = {
  title: 'Operations Center | Devireen Enterprise OS',
};

async function getDashboardData() {
  const supabase = await createClient();
  const today = startOfDay(new Date()).toISOString();

  const safeQuery = async (queryFn: () => PromiseLike<any>, fallback: any) => {
    try {
      const res = await queryFn();
      if (!res || res.error) return fallback;
      return res;
    } catch {
      return fallback;
    }
  };

  // Parallel data queries with safe fallbacks
  const [
    productsRes,
    categoriesRes,
    customersRes,
    testimonialsRes,
    todayQuotesRes,
    pendingQuotesRes,
    ordersRes,
    recentOrdersRes,
    recentQuotesRes,
    recentCustomersRes,
    recentActivityRes,
    productsMissingImagesRes,
    productsMissingPricesRes,
    productsMissingDescriptionsRes,
  ] = await Promise.all([
    safeQuery(
      () =>
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null),
      { count: 0 }
    ),
    safeQuery(
      () =>
        supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null),
      { count: 0 }
    ),
    safeQuery(
      () =>
        supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null),
      { count: 0 }
    ),
    safeQuery(
      () =>
        supabase
          .from('testimonials')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null),
      { count: 0 }
    ),
    safeQuery(
      () =>
        supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today)
          .is('deleted_at', null),
      { count: 0 }
    ),
    safeQuery(
      () =>
        supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'PENDING')
          .is('deleted_at', null),
      { count: 0 }
    ),
    safeQuery(
      () =>
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null),
      { count: 0 }
    ),
    safeQuery(
      () =>
        supabase
          .from('orders')
          .select('*, customers(company_name, contact_email)')
          .order('created_at', { ascending: false })
          .limit(5),
      { data: [] }
    ),
    safeQuery(
      () =>
        supabase
          .from('quotes')
          .select('*, customers(company_name)')
          .order('created_at', { ascending: false })
          .limit(5),
      { data: [] }
    ),
    safeQuery(
      () =>
        supabase
          .from('customers')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5),
      { data: [] }
    ),
    safeQuery(
      () =>
        supabase
          .from('activity_logs')
          .select('*, profiles:user_id(full_name, email)')
          .order('created_at', { ascending: false })
          .limit(8),
      { data: [] }
    ),
    safeQuery(
      () =>
        supabase
          .from('products')
          .select('id, name, sku')
          .is('deleted_at', null)
          .is('product_images', null)
          .limit(5),
      { data: [] }
    ),
    safeQuery(
      () =>
        supabase
          .from('products')
          .select('id, name, sku')
          .is('deleted_at', null)
          .or('price.eq.0,price.is.null')
          .limit(5),
      { data: [] }
    ),
    safeQuery(
      () =>
        supabase
          .from('products')
          .select('id, name, sku')
          .is('deleted_at', null)
          .is('description', null)
          .limit(5),
      { data: [] }
    ),
  ]);

  // Total estimated volume calculated from quotes
  let totalVolume = 0;
  try {
    const { data: totalVolumeData } = await supabase
      .from('quotes')
      .select('total_amount')
      .is('deleted_at', null);

    totalVolume = (totalVolumeData || []).reduce(
      (sum, item) => sum + Number(item.total_amount || 0),
      0
    );
  } catch {}

  return {
    stats: {
      products: productsRes.count || 0,
      categories: categoriesRes.count || 0,
      customers: customersRes.count || 0,
      testimonials: testimonialsRes.count || 0,
      todayQuotes: todayQuotesRes.count || 0,
      pendingQuotes: pendingQuotesRes.count || 0,
      orders: ordersRes.count || 0,
      totalVolume,
    },
    recentOrders: recentOrdersRes.data || [],
    recentQuotes: recentQuotesRes.data || [],
    recentCustomers: recentCustomersRes.data || [],
    recentActivity: recentActivityRes.data || [],
    productsMissingImages: productsMissingImagesRes.data || [],
    productsMissingPrices: productsMissingPricesRes.data || [],
    productsMissingDescriptions: productsMissingDescriptionsRes.data || [],
  };
}

export default async function DashboardOverview() {
  const data = await getDashboardData();

  const getActivityIcon = (type: string, action: string) => {
    if (action === 'deleted' || action === 'blocked')
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (type === 'product')
      return <Package className="h-4 w-4 text-blue-500" />;
    if (type === 'quote')
      return <FileText className="h-4 w-4 text-indigo-500" />;
    if (type === 'order')
      return <ShoppingCart className="h-4 w-4 text-emerald-500" />;
    if (type === 'customer')
      return <Users className="h-4 w-4 text-purple-500" />;
    return <Activity className="h-4 w-4 text-slate-400" />;
  };

  const totalActionAlerts =
    data.productsMissingImages.length +
    data.productsMissingPrices.length +
    data.productsMissingDescriptions.length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl md:flex-row md:items-center md:p-8">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400 uppercase">
            <Sparkles className="h-4 w-4 text-blue-400" /> Executive Overview
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Enterprise Operations Center
          </h1>
          <p className="max-w-xl text-xs text-slate-400 sm:text-sm">
            Real-time control dashboard for quotes, product catalog, customer
            intelligence, and order fulfillment.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Button asChild className="rounded-xl border-0 bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500">
            <Link href="/dashboard/quotes/new">
              <Plus className="mr-1.5 h-4 w-4" /> Create Quote
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20"
          >
            <Link href="/dashboard/products/new">
              <Package className="mr-1.5 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-96 bg-blue-500/10 blur-3xl" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Today&apos;s Quotes
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900">
              {data.stats.todayQuotes}
            </span>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> Active RFQ Flow
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Pending RFQs
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900">
              {data.stats.pendingQuotes}
            </span>
            <div className="mt-1 text-xs text-slate-500">Requires review</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Active Orders
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900">
              {data.stats.orders}
            </span>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Pipeline Active
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Est. Pipeline Value
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="block truncate text-2xl font-bold text-slate-900">
              KSh {data.stats.totalVolume.toLocaleString()}
            </span>
            <div className="mt-1 text-xs text-slate-500">Across all quotes</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns */}
        <div className="space-y-8 lg:col-span-2">
          {/* Recent Quotes Workspace */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText className="h-4 w-4 text-blue-600" /> Recent Quotation
                Requests
              </h2>
              <Link
                href="/dashboard/quotes"
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View All Quotes <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {data.recentQuotes.length > 0 ? (
                data.recentQuotes.map((quote: any) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-4 px-6 transition-colors hover:bg-slate-50/80"
                  >
                    <div>
                      <span className="block font-bold text-slate-900">
                        Quote #{quote.quote_number || quote.id.slice(0, 8)}
                      </span>
                      <span className="text-slate-500">
                        {quote.customers?.company_name || 'Direct Customer'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block font-semibold text-slate-900">
                        KSh {quote.total_amount?.toLocaleString() || 0}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          quote.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {quote.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No quote requests submitted yet.
                </div>
              )}
            </div>
          </div>

          {/* Activity Stream Timeline */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Activity className="h-4 w-4 text-indigo-600" /> Live System
                Audit Trail
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Real-time
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {data.recentActivity.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-4 px-6 transition-colors hover:bg-slate-50/60"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    {getActivityIcon(log.entity_type, log.action)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      <span className="font-semibold">
                        {log.profiles?.full_name || 'Admin User'}
                      </span>{' '}
                      {log.action} a {log.entity_type}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {format(new Date(log.created_at), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              {data.recentActivity.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No activity logged yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-8">
          {/* Action Required Inventory & Catalog Alerts */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50/50 px-6 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Action
                Required Alerts
              </h2>
              {totalActionAlerts > 0 && (
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  {totalActionAlerts}
                </span>
              )}
            </div>

            <div className="space-y-4 p-5 text-xs">
              {data.productsMissingImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <ImageOff className="h-3.5 w-3.5 text-amber-600" /> Missing
                    Product Images ({data.productsMissingImages.length})
                  </div>
                  <div className="space-y-1">
                    {data.productsMissingImages.map((p: any) => (
                      <Link
                        key={p.id}
                        href={`/dashboard/products/${p.id}/edit`}
                        className="flex items-center justify-between rounded p-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="shrink-0 font-semibold text-blue-600">
                          Fix &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {data.productsMissingPrices.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <FileQuestion className="h-3.5 w-3.5 text-amber-600" />{' '}
                    Missing Price Configuration (
                    {data.productsMissingPrices.length})
                  </div>
                  <div className="space-y-1">
                    {data.productsMissingPrices.map((p: any) => (
                      <Link
                        key={p.id}
                        href={`/dashboard/products/${p.id}/edit`}
                        className="flex items-center justify-between rounded p-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600"
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="shrink-0 font-semibold text-blue-600">
                          Fix &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {totalActionAlerts === 0 && (
                <div className="space-y-2 py-6 text-center text-slate-500">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="font-semibold text-slate-800">
                    All catalog items fully configured!
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Zero missing images, prices, or descriptions.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* System Status Center */}
          <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Enterprise
              Health Status
            </h2>

            <div className="space-y-3 text-xs font-medium">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <span className="flex items-center gap-2 text-slate-700">
                  <Database className="h-4 w-4 text-slate-400" /> Supabase
                  Database
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />{' '}
                  Operational
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <span className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-slate-400" /> Auth &
                  Security RLS
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />{' '}
                  Enforced
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <span className="flex items-center gap-2 text-slate-700">
                  <Package className="h-4 w-4 text-slate-400" /> Media Storage
                  Bucket
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />{' '}
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
