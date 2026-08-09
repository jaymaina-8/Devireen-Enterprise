-- 1. Create is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_admin boolean := false;
BEGIN
    -- Check if JWT email matches the hardcoded admin email fallback
    IF auth.jwt() ->> 'email' = 'admin@devireenenterprice.com' THEN
        RETURN true;
    END IF;

    -- Check if user exists in user_roles with the ADMIN role
    IF auth.uid() IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
        ) INTO v_is_admin;
    END IF;

    RETURN v_is_admin;
END;
$$;

-- 2. Drop insecure policies
DROP POLICY IF EXISTS "Public catalog read" ON public.categories;
DROP POLICY IF EXISTS "Public catalog read" ON public.brands;
DROP POLICY IF EXISTS "Public catalog read" ON public.products;
DROP POLICY IF EXISTS "Public catalog read" ON public.product_images;

DROP POLICY IF EXISTS "Admin catalog full access" ON public.categories;
DROP POLICY IF EXISTS "Admin catalog full access" ON public.brands;
DROP POLICY IF EXISTS "Admin catalog full access" ON public.products;
DROP POLICY IF EXISTS "Admin catalog full access" ON public.product_images;

DROP POLICY IF EXISTS "Admin full access to customers" ON public.customers;
DROP POLICY IF EXISTS "Admin full access to quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admin full access to quote_items" ON public.quote_items;
DROP POLICY IF EXISTS "Admin full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Admin full access to order_items" ON public.order_items;

DROP POLICY IF EXISTS "Allow read on own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Allow insert on quotes" ON public.quotes;
DROP POLICY IF EXISTS "Allow update on own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Allow read on own quote items" ON public.quote_items;
DROP POLICY IF EXISTS "Allow insert on quote items" ON public.quote_items;
DROP POLICY IF EXISTS "Allow update on own quote items" ON public.quote_items;

DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public read own order" ON public.orders;
DROP POLICY IF EXISTS "Allow public read own order items" ON public.order_items;

DROP POLICY IF EXISTS "Allow public read access to published testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow authenticated full access to testimonials" ON public.testimonials;

DROP POLICY IF EXISTS "Allow public read-only access to settings" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated full access to settings" ON public.settings;
DROP POLICY IF EXISTS "Allow public read-only access to seo_metadata" ON public.seo_metadata;
DROP POLICY IF EXISTS "Allow authenticated full access to seo_metadata" ON public.seo_metadata;

-- 3. Create secure policies
-- Categories
CREATE POLICY "Public catalog read" ON public.categories FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Admin full access" ON public.categories FOR ALL USING (public.is_admin());

-- Brands
CREATE POLICY "Public catalog read" ON public.brands FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Admin full access" ON public.brands FOR ALL USING (public.is_admin());

-- Products
CREATE POLICY "Public catalog read" ON public.products FOR SELECT USING (is_active = true AND deleted_at IS NULL);
CREATE POLICY "Admin full access" ON public.products FOR ALL USING (public.is_admin());

-- Product Images
CREATE POLICY "Public catalog read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON public.product_images FOR ALL USING (public.is_admin());

-- Testimonials
CREATE POLICY "Public read published" ON public.testimonials FOR SELECT USING (is_published = true);
CREATE POLICY "Admin full access" ON public.testimonials FOR ALL USING (public.is_admin());

-- Settings & SEO
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin full access settings" ON public.settings FOR ALL USING (public.is_admin());
CREATE POLICY "Public read seo" ON public.seo_metadata FOR SELECT USING (true);
CREATE POLICY "Admin full access seo" ON public.seo_metadata FOR ALL USING (public.is_admin());

-- Customers
CREATE POLICY "Admin full access" ON public.customers FOR ALL USING (public.is_admin());

-- Quotes & Quote Items (No public read, admin only)
CREATE POLICY "Admin full access" ON public.quotes FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access" ON public.quote_items FOR ALL USING (public.is_admin());

-- Orders & Order Items (No public read, admin only)
CREATE POLICY "Admin full access" ON public.orders FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access" ON public.order_items FOR ALL USING (public.is_admin());

-- 4. Update Storage Policies for 'products' bucket
-- Note: Policy names must be unique within the table, so we use slightly different names
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND public.is_admin());
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND public.is_admin());
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND public.is_admin());

-- 5. Quote to Order RPC
CREATE OR REPLACE FUNCTION public.convert_quote_to_order_rpc(p_quote_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_quote record;
    v_order_id uuid;
    v_total numeric(12,2) := 0;
    v_item record;
    v_item_price numeric(12,2);
BEGIN
    -- Only allow admins to convert quotes
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- 1. Get and lock the quote
    SELECT * INTO v_quote FROM public.quotes WHERE id = p_quote_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quote not found';
    END IF;
    
    IF v_quote.status = 'FULFILLED' THEN
        RAISE EXCEPTION 'Quote is already fulfilled';
    END IF;

    -- 2. Create the order
    INSERT INTO public.orders (
        quote_id,
        customer_id,
        status,
        payment_status,
        fulfillment_type,
        pricing_model,
        total_amount,
        notes,
        invoice_number
    ) VALUES (
        v_quote.id,
        v_quote.customer_id,
        'PENDING',
        'UNPAID',
        'DELIVERY', -- Default fulfillment type, since quote doesn't store this directly
        'RETAIL',   -- Default pricing model for quotes unless specified otherwise
        0, -- will update after calculation
        v_quote.notes,
        'INV-' || to_char(now(), 'YYYYMMDD') || '-' || (floor(random() * 9000) + 1000)::text
    ) RETURNING id INTO v_order_id;
    
    -- 3. Calculate and insert items
    FOR v_item IN (SELECT * FROM public.quote_items WHERE quote_id = p_quote_id) LOOP
        -- Retrieve the authoritative current retail price
        SELECT price INTO v_item_price FROM public.products WHERE id = v_item.product_id;
        
        IF v_item_price IS NULL THEN
            v_item_price := 0;
        END IF;
        
        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            unit_price
        ) VALUES (
            v_order_id,
            v_item.product_id,
            v_item.quantity,
            v_item_price
        );
        
        v_total := v_total + (v_item.quantity * v_item_price);
    END LOOP;
    
    -- 4. Update order total
    UPDATE public.orders SET total_amount = v_total WHERE id = v_order_id;
    
    -- 5. Mark quote as fulfilled
    UPDATE public.quotes SET status = 'FULFILLED' WHERE id = p_quote_id;
    
    RETURN v_order_id;
END;
$$;
