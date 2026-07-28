-- Allow authenticated users (admins) full access to orders and order_items
create policy "Admin full access to orders" on public.orders for all to authenticated using (true) with check (true);

create policy "Admin full access to order_items" on public.order_items for all to authenticated using (true) with check (true);
