-- Phase 6: authoritative financial records, atomic quotes, and scoped access.

-- Persist tax figures at the time a commercial document is created. Existing
-- records intentionally remain NULL because their historical VAT breakdown is
-- not recoverable without inventing a tax calculation.
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS vat_rate numeric(5, 2) NOT NULL DEFAULT 16;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal_amount numeric(12, 2),
  ADD COLUMN IF NOT EXISTS vat_rate numeric(5, 2),
  ADD COLUMN IF NOT EXISTS vat_amount numeric(12, 2),
  ADD COLUMN IF NOT EXISTS invoice_access_token_hash text;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS subtotal_amount numeric(12, 2),
  ADD COLUMN IF NOT EXISTS vat_rate numeric(5, 2),
  ADD COLUMN IF NOT EXISTS vat_amount numeric(12, 2);

ALTER TABLE public.settings
  DROP CONSTRAINT IF EXISTS settings_vat_rate_range;
ALTER TABLE public.settings
  ADD CONSTRAINT settings_vat_rate_range CHECK (vat_rate >= 0 AND vat_rate <= 100);

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_tax_amounts_consistent;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_tax_amounts_consistent CHECK (
    (subtotal_amount IS NULL AND vat_rate IS NULL AND vat_amount IS NULL)
    OR (
      subtotal_amount >= 0
      AND vat_rate >= 0
      AND vat_rate <= 100
      AND vat_amount >= 0
      AND total_amount = subtotal_amount + vat_amount
    )
  );

ALTER TABLE public.quotes
  DROP CONSTRAINT IF EXISTS quotes_tax_amounts_consistent;
ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_tax_amounts_consistent CHECK (
    (subtotal_amount IS NULL AND vat_rate IS NULL AND vat_amount IS NULL)
    OR (
      subtotal_amount >= 0
      AND vat_rate >= 0
      AND vat_rate <= 100
      AND vat_amount >= 0
      AND total_amount = subtotal_amount + vat_amount
    )
  );

CREATE INDEX IF NOT EXISTS orders_invoice_access_token_hash_idx
  ON public.orders (invoice_access_token_hash)
  WHERE invoice_access_token_hash IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_order_rpc(
  p_order_data jsonb,
  p_order_items jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_subtotal numeric(12, 2) := 0;
  v_vat_rate numeric(5, 2);
  v_vat_amount numeric(12, 2);
  v_total_amount numeric(12, 2);
  v_quantity integer;
  v_unit_price numeric(10, 2);
BEGIN
  IF jsonb_typeof(p_order_items) <> 'array' OR jsonb_array_length(p_order_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_order_items)
  LOOP
    v_quantity := (v_item->>'quantity')::integer;
    v_unit_price := (v_item->>'unit_price')::numeric;

    IF v_quantity < 1 OR v_unit_price < 0 THEN
      RAISE EXCEPTION 'Order items must have a positive quantity and non-negative price';
    END IF;

    v_subtotal := v_subtotal + (v_quantity * v_unit_price);
  END LOOP;

  v_vat_rate := COALESCE((p_order_data->>'vat_rate')::numeric, 0);
  IF v_vat_rate < 0 OR v_vat_rate > 100 THEN
    RAISE EXCEPTION 'Invalid VAT rate';
  END IF;

  v_vat_amount := ROUND(v_subtotal * v_vat_rate / 100, 2);
  v_total_amount := v_subtotal + v_vat_amount;

  IF (p_order_data->>'subtotal_amount')::numeric <> v_subtotal
    OR (p_order_data->>'vat_amount')::numeric <> v_vat_amount
    OR (p_order_data->>'total_amount')::numeric <> v_total_amount THEN
    RAISE EXCEPTION 'Order financial totals do not match order items';
  END IF;

  IF COALESCE(p_order_data->>'invoice_access_token_hash', '') !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid invoice access token hash';
  END IF;

  INSERT INTO public.orders (
    customer_name,
    customer_email,
    customer_phone,
    fulfillment_type,
    pricing_model,
    delivery_address,
    shipping_address,
    county,
    courier_service,
    delivery_notes,
    subtotal_amount,
    vat_rate,
    vat_amount,
    total_amount,
    invoice_number,
    invoice_access_token_hash,
    status,
    payment_status,
    created_at,
    updated_at
  ) VALUES (
    p_order_data->>'customer_name',
    p_order_data->>'customer_email',
    p_order_data->>'customer_phone',
    p_order_data->>'fulfillment_type',
    p_order_data->>'pricing_model',
    p_order_data->>'delivery_address',
    p_order_data->>'shipping_address',
    p_order_data->>'county',
    p_order_data->>'courier_service',
    p_order_data->>'delivery_notes',
    v_subtotal,
    v_vat_rate,
    v_vat_amount,
    v_total_amount,
    p_order_data->>'invoice_number',
    p_order_data->>'invoice_access_token_hash',
    COALESCE(p_order_data->>'status', 'PENDING')::public.order_status,
    COALESCE(p_order_data->>'payment_status', 'UNPAID')::public.payment_status,
    NOW(),
    NOW()
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_order_items)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      quantity,
      unit_price
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::numeric
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_rpc(jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_rpc(jsonb, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.create_admin_quote_rpc(
  p_customer_id uuid,
  p_status public.quote_status,
  p_notes text,
  p_items jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_unit_price numeric(10, 2);
  v_subtotal numeric(12, 2) := 0;
  v_vat_rate numeric(5, 2) := 0;
  v_vat_amount numeric(12, 2) := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_status = 'FULFILLED' THEN
    RAISE EXCEPTION 'Quotes can only be fulfilled through order conversion';
  END IF;

  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Quote must contain at least one item';
  END IF;

  PERFORM 1 FROM public.customers WHERE id = p_customer_id AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    v_unit_price := (v_item->>'unit_price')::numeric;

    IF v_quantity < 1 OR v_unit_price < 0 THEN
      RAISE EXCEPTION 'Quote items must have a positive quantity and non-negative price';
    END IF;

    PERFORM 1
    FROM public.products
    WHERE id = v_product_id AND deleted_at IS NULL AND is_active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Quote item product is unavailable';
    END IF;

    v_subtotal := v_subtotal + (v_quantity * v_unit_price);
  END LOOP;

  SELECT CASE WHEN COALESCE(enable_vat, true) THEN COALESCE(vat_rate, 16) ELSE 0 END
  INTO v_vat_rate
  FROM public.settings
  LIMIT 1;
  v_vat_rate := COALESCE(v_vat_rate, 0);
  v_vat_amount := ROUND(v_subtotal * v_vat_rate / 100, 2);

  INSERT INTO public.quotes (
    customer_id,
    status,
    notes,
    subtotal_amount,
    vat_rate,
    vat_amount,
    total_amount
  ) VALUES (
    p_customer_id,
    p_status,
    p_notes,
    v_subtotal,
    v_vat_rate,
    v_vat_amount,
    v_subtotal + v_vat_amount
  ) RETURNING id INTO v_quote_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.quote_items (quote_id, product_id, quantity, unit_price)
    VALUES (
      v_quote_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::numeric
    );
  END LOOP;

  RETURN v_quote_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_admin_quote_rpc(
  p_quote_id uuid,
  p_customer_id uuid,
  p_status public.quote_status,
  p_notes text,
  p_items jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_quote public.quotes%ROWTYPE;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_unit_price numeric(10, 2);
  v_subtotal numeric(12, 2) := 0;
  v_vat_rate numeric(5, 2) := 0;
  v_vat_amount numeric(12, 2) := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_status = 'FULFILLED' THEN
    RAISE EXCEPTION 'Quotes can only be fulfilled through order conversion';
  END IF;

  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Quote must contain at least one item';
  END IF;

  SELECT * INTO v_existing_quote
  FROM public.quotes
  WHERE id = p_quote_id AND deleted_at IS NULL
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quote not found';
  END IF;

  IF v_existing_quote.status = 'FULFILLED' THEN
    RAISE EXCEPTION 'Fulfilled quotes cannot be changed';
  END IF;

  PERFORM 1 FROM public.customers WHERE id = p_customer_id AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    v_unit_price := (v_item->>'unit_price')::numeric;

    IF v_quantity < 1 OR v_unit_price < 0 THEN
      RAISE EXCEPTION 'Quote items must have a positive quantity and non-negative price';
    END IF;

    PERFORM 1
    FROM public.products
    WHERE id = v_product_id AND deleted_at IS NULL AND is_active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Quote item product is unavailable';
    END IF;

    v_subtotal := v_subtotal + (v_quantity * v_unit_price);
  END LOOP;

  SELECT CASE WHEN COALESCE(enable_vat, true) THEN COALESCE(vat_rate, 16) ELSE 0 END
  INTO v_vat_rate
  FROM public.settings
  LIMIT 1;
  v_vat_rate := COALESCE(v_vat_rate, 0);
  v_vat_amount := ROUND(v_subtotal * v_vat_rate / 100, 2);

  UPDATE public.quotes
  SET
    customer_id = p_customer_id,
    status = p_status,
    notes = p_notes,
    subtotal_amount = v_subtotal,
    vat_rate = v_vat_rate,
    vat_amount = v_vat_amount,
    total_amount = v_subtotal + v_vat_amount,
    updated_at = NOW()
  WHERE id = p_quote_id;

  DELETE FROM public.quote_items WHERE quote_id = p_quote_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.quote_items (quote_id, product_id, quantity, unit_price)
    VALUES (
      p_quote_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::numeric
    );
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.create_admin_quote_rpc(uuid, public.quote_status, text, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_admin_quote_rpc(uuid, uuid, public.quote_status, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_admin_quote_rpc(uuid, public.quote_status, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_quote_rpc(uuid, uuid, public.quote_status, text, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.convert_quote_to_order_rpc(p_quote_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote public.quotes%ROWTYPE;
  v_order_id uuid;
  v_item record;
  v_subtotal numeric(12, 2) := 0;
  v_invoice_number text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_quote FROM public.quotes WHERE id = p_quote_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quote not found';
  END IF;
  IF v_quote.status = 'FULFILLED' THEN
    RAISE EXCEPTION 'Quote is already fulfilled';
  END IF;
  IF v_quote.subtotal_amount IS NULL OR v_quote.vat_rate IS NULL OR v_quote.vat_amount IS NULL THEN
    RAISE EXCEPTION 'Quote has no authoritative tax breakdown';
  END IF;

  FOR v_item IN SELECT * FROM public.quote_items WHERE quote_id = p_quote_id
  LOOP
    v_subtotal := v_subtotal + (v_item.quantity * v_item.unit_price);
  END LOOP;

  IF v_subtotal <> v_quote.subtotal_amount THEN
    RAISE EXCEPTION 'Quote totals do not match quote items';
  END IF;

  v_invoice_number := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || nextval('public.invoice_number_seq')::text;

  INSERT INTO public.orders (
    quote_id,
    customer_id,
    status,
    payment_status,
    fulfillment_type,
    pricing_model,
    subtotal_amount,
    vat_rate,
    vat_amount,
    total_amount,
    notes,
    invoice_number
  ) VALUES (
    v_quote.id,
    v_quote.customer_id,
    'PENDING',
    'UNPAID',
    'DELIVERY',
    'RETAIL',
    v_quote.subtotal_amount,
    v_quote.vat_rate,
    v_quote.vat_amount,
    v_quote.total_amount,
    v_quote.notes,
    v_invoice_number
  ) RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
  SELECT v_order_id, product_id, quantity, unit_price
  FROM public.quote_items
  WHERE quote_id = p_quote_id;

  UPDATE public.quotes SET status = 'FULFILLED' WHERE id = p_quote_id;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.convert_quote_to_order_rpc(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.convert_quote_to_order_rpc(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.dashboard_quote_total_volume()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN COALESCE((
    SELECT SUM(total_amount)
    FROM public.quotes
    WHERE deleted_at IS NULL
  ), 0);
END;
$$;

REVOKE ALL ON FUNCTION public.dashboard_quote_total_volume() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dashboard_quote_total_volume() TO authenticated;

-- The public site reads a deliberately small safe projection via a server-only
-- repository method. Direct table reads no longer disclose tax credentials.
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Admin read settings" ON public.settings FOR SELECT USING (public.is_admin());

-- Product media is the only supported server-mediated upload target.
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products'
    AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
    AND public.is_admin()
  );

CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'products'
    AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
    AND public.is_admin()
  );

CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products'
    AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
    AND public.is_admin()
  );
