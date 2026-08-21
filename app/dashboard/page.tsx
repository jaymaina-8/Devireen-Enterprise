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
  ChevronRight,
  FileQuestion,
  ImageOff,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  FolderTree,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { format, startOfDay } from 'date-fns';

export const metadata = {
  title: 'Command Center | Devireen Enterprise OS',
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
    dbHealthRes,
    authHealthRes,
    storageHealthRes,
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
          .in('status', ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'])
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
      async () => {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, sku, product_images(id)')
          .is('deleted_at', null)
          .limit(50);
        if (error || !data) return { data: [] };
        const missing = data
          .filter(
            (p: any) => !p.product_images || p.product_images.length === 0
          )
          .slice(0, 5)
          .map((p: any) => ({ id: p.id, name: p.name, sku: p.sku }));
        return { data: missing };
      },
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
    safeQuery(
      async () => {
        const res = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true });
        return { ok: !res.error };
      },
      { ok: false }
    ),
    safeQuery(
      async () => {
        const res = await supabase.auth.getUser();
        return { ok: !res.error && !!res.data?.user };
      },
      { ok: false }
    ),
    safeQuery(
      async () => {
        const res = await supabase.storage
          .from('products')
          .list('', { limit: 1 });
        return { ok: !res.error };
      },
      { ok: false }
    ),
  ]);

  // Total estimated volume calculated from quotes (via RPC with fallback)
  let totalVolume = 0;
  try {
    const { data: rpcVolume, error: rpcError } = await supabase.rpc(
      'dashboard_quote_total_volume'
    );
    if (!rpcError && rpcVolume != null) {
      totalVolume = Number(rpcVolume);
    } else {
      const { data: totalVolumeData } = await supabase
        .from('quotes')
        .select('total_amount')
        .is('deleted_at', null)
        .limit(500);

      totalVolume = (totalVolumeData || []).reduce(
        (sum, item) => sum + Number(item.total_amount || 0),
        0
      );
    }
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
    health: {
      database: !!dbHealthRes.ok,
      auth: !!authHealthRes.ok,
      storage: !!storageHealthRes.ok,
    },
  };
}

export default async function DashboardOverview() {
  const data = await getDashboardData();

  const getActivityIcon = (type: string, action: string) => {
    if (action === 'deleted' || action === 'blocked')
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (type === 'product')
      return <Package className="h-4 w-4 text-slate-600" />;
    if (type === 'quote') return <FileText className="h-4 w-4 text-red-600" />;
    if (type === 'order')
      return <ShoppingCart className="h-4 w-4 text-emerald-600" />;
    if (type === 'customer')
      return <Users className="h-4 w-4 text-purple-600" />;
    return <Activity className="h-4 w-4 text-slate-400" />;
  };

  const totalActionAlerts =
    data.productsMissingImages.length +
    data.productsMissingPrices.length +
    data.productsMissingDescriptions.length;

  return (
    <div className="space-y-6">
      {/* Command Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
              Live Operations
            </span>
            <span className="text-xs text-slate-400">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Command Center
          </h1>
          <p className="text-xs text-slate-500">
            Real-time management for quotation requests, orders, catalog items,
            and customer directory.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            asChild
            size="sm"
            className="rounded-xl border-0 bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
          >
            <Link href="/dashboard/quotes/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Quote
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Link href="/dashboard/products/new">
              <Package className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> Add
              Product
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Link href="/dashboard/customers/new">
              <Users className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> New
              Customer
            </Link>
          </Button>
        </div>
      </div>

      {/* Primary KPI Metric Cards (Interactive) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Today's Quotes"
          value={data.stats.todayQuotes}
          icon={<FileText className="h-5 w-5" />}
          variant="red"
          href="/dashboard/quotes"
          description="Submitted today"
          trend={{ value: 'RFQ Inflow', isPositive: true }}
        />

        <DashboardCard
          title="Pending RFQs"
          value={data.stats.pendingQuotes}
          icon={<Clock className="h-5 w-5" />}
          variant="amber"
          href="/dashboard/quotes"
          badge={
            data.stats.pendingQuotes > 0
              ? `${data.stats.pendingQuotes} Action Required`
              : undefined
          }
          description="Awaiting review"
        />

        <DashboardCard
          title="Active Orders"
          value={data.stats.orders}
          icon={<ShoppingCart className="h-5 w-5" />}
          variant="emerald"
          href="/dashboard/orders"
          description="Fulfillment pipeline"
          trend={{ value: 'Active', isPositive: true }}
        />

        <DashboardCard
          title="Est. Pipeline Value"
          value={`KSh ${data.stats.totalVolume.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          variant="default"
          href="/dashboard/quotes"
          description="Across all quotations"
        />
      </div>

      {/* Secondary Operations Summary Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          href="/dashboard/products"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-red-50 group-hover:text-red-600">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Products</p>
              <p className="text-sm font-bold text-slate-900">
                {data.stats.products}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>

        <Link
          href="/dashboard/categories"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-red-50 group-hover:text-red-600">
              <Tags className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Categories</p>
              <p className="text-sm font-bold text-slate-900">
                {data.stats.categories}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>

        <Link
          href="/dashboard/customers"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-red-50 group-hover:text-red-600">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Customers</p>
              <p className="text-sm font-bold text-slate-900">
                {data.stats.customers}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>

        <Link
          href="/dashboard/testimonials"
          className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-red-50 group-hover:text-red-600">
              <Star className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Testimonials</p>
              <p className="text-sm font-bold text-slate-900">
                {data.stats.testimonials}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Core Workspaces */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recent Quotation Requests */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-600" />
                <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                  Recent Quotation Requests
                </h2>
              </div>
              <Link
                href="/dashboard/quotes"
                className="flex items-center gap-1 text-xs font-semibold text-red-600 transition-colors hover:text-red-700"
              >
                View All Quotes <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {data.recentQuotes.length > 0 ? (
                data.recentQuotes.map((quote: any) => (
                  <Link
                    key={quote.id}
                    href={`/dashboard/quotes/${quote.id}`}
                    className="group flex items-center justify-between p-4 px-5 transition-colors hover:bg-slate-50/80"
                  >
                    <div className="space-y-0.5">
                      <span className="block font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                        Quote #{quote.quote_number || quote.id.slice(0, 8)}
                      </span>
                      <span className="text-slate-500">
                        {quote.customers?.company_name || 'Direct Customer'}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <span className="block font-semibold text-slate-900">
                        KSh {Number(quote.total_amount || 0).toLocaleString()}
                      </span>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          quote.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : quote.status === 'APPROVED' ||
                                quote.status === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {quote.status}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No quote requests submitted yet.
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-emerald-600" />
                <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                  Recent Orders
                </h2>
              </div>
              <Link
                href="/dashboard/orders"
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900"
              >
                View All Orders <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {data.recentOrders.length > 0 ? (
                data.recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="group flex items-center justify-between p-4 px-5 transition-colors hover:bg-slate-50/80"
                  >
                    <div className="space-y-0.5">
                      <span className="block font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
                        Order #{order.order_number || order.id.slice(0, 8)}
                      </span>
                      <span className="text-slate-500">
                        {order.customers?.company_name ||
                          order.customer_name ||
                          'Customer'}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <span className="block font-semibold text-slate-900">
                        KSh {Number(order.total_amount || 0).toLocaleString()}
                      </span>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          order.status === 'COMPLETED' ||
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'PROCESSING' ||
                                order.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No orders recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* System Audit Trail */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-600" />
                <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                  Live Audit Trail
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                Activity Stream
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {data.recentActivity.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-3.5 px-5 transition-colors hover:bg-slate-50/60"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
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
                  No system activity recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Action Center & Health */}
        <div className="space-y-6">
          {/* Action Center Alerts */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50/40 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h2 className="text-xs font-bold tracking-wider text-amber-900 uppercase">
                  Action Center
                </h2>
              </div>
              {totalActionAlerts > 0 ? (
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  {totalActionAlerts} Required
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Clean
                </span>
              )}
            </div>

            <div className="space-y-4 p-5 text-xs">
              {data.productsMissingImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <ImageOff className="h-3.5 w-3.5 text-amber-600" /> Missing
                    Images ({data.productsMissingImages.length})
                  </div>
                  <div className="space-y-1">
                    {data.productsMissingImages.map((p: any) => (
                      <Link
                        key={p.id}
                        href={`/dashboard/products/${p.id}`}
                        className="flex items-center justify-between rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600"
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="shrink-0 font-semibold text-red-600">
                          Fix &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {data.productsMissingPrices.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <FileQuestion className="h-3.5 w-3.5 text-amber-600" />{' '}
                    Missing Price Configuration (
                    {data.productsMissingPrices.length})
                  </div>
                  <div className="space-y-1">
                    {data.productsMissingPrices.map((p: any) => (
                      <Link
                        key={p.id}
                        href={`/dashboard/products/${p.id}`}
                        className="flex items-center justify-between rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600"
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="shrink-0 font-semibold text-red-600">
                          Fix &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {data.productsMissingDescriptions.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <FileText className="h-3.5 w-3.5 text-amber-600" /> Missing
                    Descriptions ({data.productsMissingDescriptions.length})
                  </div>
                  <div className="space-y-1">
                    {data.productsMissingDescriptions.map((p: any) => (
                      <Link
                        key={p.id}
                        href={`/dashboard/products/${p.id}`}
                        className="flex items-center justify-between rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600"
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="shrink-0 font-semibold text-red-600">
                          Fix &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {totalActionAlerts === 0 && (
                <div className="space-y-2 py-4 text-center text-slate-500">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" />
                  <p className="font-semibold text-slate-800">
                    Catalog Items Configured
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Zero missing product images, prices, or descriptions.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Operations Directory */}
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
              Operations Shortcuts
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/dashboard/products"
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Package className="h-3.5 w-3.5 text-slate-500" /> Products
              </Link>
              <Link
                href="/dashboard/quotes"
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <FileText className="h-3.5 w-3.5 text-slate-500" /> Quotes
              </Link>
              <Link
                href="/dashboard/orders"
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <ShoppingCart className="h-3.5 w-3.5 text-slate-500" /> Orders
              </Link>
              <Link
                href="/dashboard/customers"
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Users className="h-3.5 w-3.5 text-slate-500" /> Customers
              </Link>
            </div>
          </div>

          {/* System Health Status */}
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <h2 className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-900 uppercase">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Enterprise
              Health
            </h2>

            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                <span className="flex items-center gap-2 text-slate-700">
                  <Database className="h-3.5 w-3.5 text-slate-400" /> Database
                  Engine
                </span>
                {data.health.database ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />{' '}
                    Operational
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />{' '}
                    Degraded
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                <span className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" /> Auth &
                  RLS
                </span>
                {data.health.auth ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />{' '}
                    Enforced
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />{' '}
                    Degraded
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                <span className="flex items-center gap-2 text-slate-700">
                  <Package className="h-3.5 w-3.5 text-slate-400" /> Media
                  Storage
                </span>
                {data.health.storage ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />{' '}
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />{' '}
                    Degraded
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
