import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const ip = await getClientIp();
  const rateLimitResult = await rateLimit(ip, 'SEARCH');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(
            Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
          ),
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2 || query.length > 100) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();
  const searchPattern = `%${query}%`;
  const results: any[] = [];

  // 1. Search Products
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, sku, price')
      .is('deleted_at', null)
      .or(`name.ilike.${searchPattern},sku.ilike.${searchPattern}`)
      .limit(4);

    if (products) {
      results.push(
        ...products.map((p) => ({
          type: 'product',
          title: p.name,
          subtitle: `SKU: ${p.sku} • KSh ${p.price?.toLocaleString() || 0}`,
          url: `/dashboard/products/${p.id}/edit`,
        }))
      );
    }
  } catch (e) {}

  // 2. Search Categories
  try {
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .is('deleted_at', null)
      .ilike('name', searchPattern)
      .limit(4);

    if (categories) {
      results.push(
        ...categories.map((c) => ({
          type: 'category',
          title: c.name,
          subtitle: `Slug: /${c.slug}`,
          url: `/dashboard/categories`,
        }))
      );
    }
  } catch (e) {}

  // 3. Search Customers
  try {
    const { data: customers } = await supabase
      .from('customers')
      .select('id, company_name, contact_email, contact_phone')
      .is('deleted_at', null)
      .or(
        `company_name.ilike.${searchPattern},contact_email.ilike.${searchPattern},contact_phone.ilike.${searchPattern}`
      )
      .limit(4);

    if (customers) {
      results.push(
        ...customers.map((c) => ({
          type: 'customer',
          title: c.company_name || 'Individual Customer',
          subtitle: c.contact_email || c.contact_phone || 'No email',
          url: `/dashboard/customers`,
        }))
      );
    }
  } catch (e) {}

  // 4. Search Quotes
  try {
    const { data: quotes } = await supabase
      .from('quotes')
      .select('id, quote_number, status, total_amount')
      .is('deleted_at', null)
      .or(`quote_number.ilike.${searchPattern},id.ilike.${searchPattern}`)
      .limit(4);

    if (quotes) {
      results.push(
        ...quotes.map((q) => ({
          type: 'quote',
          title: `Quote #${q.quote_number || q.id.slice(0, 8)}`,
          subtitle: `Status: ${q.status} • KSh ${q.total_amount?.toLocaleString() || 0}`,
          url: `/dashboard/quotes`,
        }))
      );
    }
  } catch (e) {}

  // 5. Search Orders
  try {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount')
      .is('deleted_at', null)
      .or(`order_number.ilike.${searchPattern},id.ilike.${searchPattern}`)
      .limit(4);

    if (orders) {
      results.push(
        ...orders.map((o) => ({
          type: 'order',
          title: `Order #${o.order_number || o.id.slice(0, 8)}`,
          subtitle: `Status: ${o.status} • KSh ${o.total_amount?.toLocaleString() || 0}`,
          url: `/dashboard/orders`,
        }))
      );
    }
  } catch (e) {}

  // 6. Search Testimonials
  try {
    const { data: testimonials } = await supabase
      .from('testimonials')
      .select('id, customer_name, company')
      .is('deleted_at', null)
      .or(`customer_name.ilike.${searchPattern},company.ilike.${searchPattern}`)
      .limit(4);

    if (testimonials) {
      results.push(
        ...testimonials.map((t) => ({
          type: 'testimonial',
          title: t.customer_name,
          subtitle: t.company ? `Company: ${t.company}` : 'Review',
          url: `/dashboard/testimonials`,
        }))
      );
    }
  } catch (e) {}

  // 7. Settings keywords search
  try {
    const settingsPages = [
      {
        name: 'Company Profile & Contact',
        keywords: ['company', 'phone', 'email', 'address', 'whatsapp'],
        url: '/dashboard/settings#profile',
      },
      {
        name: 'Tax & KRA PIN Settings',
        keywords: ['tax', 'kra', 'vat', 'pin', 'invoice'],
        url: '/dashboard/settings#tax',
      },
      {
        name: 'Business Hours',
        keywords: ['hours', 'weekdays', 'weekends', 'opening', 'time'],
        url: '/dashboard/settings#hours',
      },
    ];

    settingsPages.forEach((s) => {
      if (s.keywords.some((k) => k.includes(query.toLowerCase()))) {
        results.push({
          type: 'settings',
          title: s.name,
          subtitle: 'Enterprise Settings',
          url: s.url,
        });
      }
    });
  } catch (e) {}

  return NextResponse.json({ results });
}
