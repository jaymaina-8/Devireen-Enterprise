-- Phase 10: Dual Pricing + Order Upgrade Migration
-- Adds bulk_price to products and enriches orders with fulfillment/customer/invoice data

-- 1. Add bulk_price to products
alter table public.products
  add column if not exists bulk_price numeric(10, 2);

-- 2. Extend orders table with new fields
alter table public.orders
  add column if not exists fulfillment_type text check (fulfillment_type in ('DELIVERY', 'PICKUP')),
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists delivery_address text,
  add column if not exists county text,
  add column if not exists courier_service text,
  add column if not exists delivery_notes text,
  add column if not exists pricing_model text not null default 'RETAIL' check (pricing_model in ('RETAIL', 'BULK')),
  add column if not exists invoice_number text unique,
  add column if not exists whatsapp_sent boolean not null default false,
  add column if not exists invoice_url text;

-- 3. Add order_number sequence for human-readable invoice numbers
create sequence if not exists public.invoice_number_seq start 1000;

-- 4. Public insert access for orders (guest checkout)
-- DROP first so re-running is safe (CREATE POLICY has no IF NOT EXISTS in PG15)
drop policy if exists "Allow public insert on orders" on public.orders;
create policy "Allow public insert on orders"
  on public.orders for insert with check (true);

drop policy if exists "Allow public insert on order_items" on public.order_items;
create policy "Allow public insert on order_items"
  on public.order_items for insert with check (true);

-- 5. Allow public read of order by id (UUID is the auth token for guests)
drop policy if exists "Allow public read own order" on public.orders;
create policy "Allow public read own order"
  on public.orders for select using (true);

drop policy if exists "Allow public read own order items" on public.order_items;
create policy "Allow public read own order items"
  on public.order_items for select using (true);

-- 6. Index new fields for dashboard queries
create index if not exists orders_fulfillment_type_idx on public.orders (fulfillment_type);
create index if not exists orders_pricing_model_idx on public.orders (pricing_model);
create index if not exists orders_invoice_number_idx on public.orders (invoice_number);

