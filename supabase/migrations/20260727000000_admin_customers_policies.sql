-- Add full access policy for customers and quotes to authenticated users (admin dashboard)
CREATE POLICY "Admin full access to customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to quotes" ON public.quotes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to quote_items" ON public.quote_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
