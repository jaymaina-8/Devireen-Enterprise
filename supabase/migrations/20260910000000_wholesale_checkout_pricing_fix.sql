-- ==============================================================================
-- Migration: Wholesale Checkout Pricing Fix
-- 1. Add pricing_mode column to order_items
-- 2. Update create_order_rpc to persist item-level pricing_mode
-- 3. Update convert_quote_to_order_rpc to preserve pricing_mode
-- ==============================================================================

-- 1. Add pricing_mode column to order_items
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS pricing_mode text NOT NULL DEFAULT 'RETAIL'
  CHECK (pricing_mode IN ('RETAIL', 'WHOLESALE'));

-- 2. Update create_order_rpc with item-level pricing_mode support
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
  v_pricing_mode text;
BEGIN
  IF jsonb_typeof(p_order_items) <> 'array' OR jsonb_array_length(p_order_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_order_items)
  LOOP
    v_quantity := (v_item->>'quantity')::integer;
    v_unit_price := (v_item->>'unit_price')::numeric;
    v_pricing_mode := COALESCE(v_item->>'pricing_mode', 'RETAIL');

    IF v_quantity < 1 OR v_unit_price < 0 THEN
      RAISE EXCEPTION 'Order items must have a positive quantity and non-negative price';
    END IF;

    IF v_pricing_mode NOT IN ('RETAIL', 'WHOLESALE') THEN
      RAISE EXCEPTION 'Invalid pricing mode: %', v_pricing_mode;
    END IF;

    v_subtotal := v_subtotal + (v_quantity * v_unit_price);
  END LOOP;

  v_vat_rate := COALESCE((p_order_data->>'vat_rate')::numeric, 0);
  IF v_vat_rate < 0 OR v_vat_rate > 100 THEN
    RAISE EXCEPTION 'Invalid VAT rate';
  END IF;

  v_vat_amount := ROUND(v_subtotal * v_vat_rate / 100, 2);
  v_total_amount := v_subtotal + v_vat_amount;

  IF ABS(COALESCE((p_order_data->>'subtotal_amount')::numeric, 0) - v_subtotal) > 0.05
    OR ABS(COALESCE((p_order_data->>'vat_amount')::numeric, 0) - v_vat_amount) > 0.05
    OR ABS(COALESCE((p_order_data->>'total_amount')::numeric, 0) - v_total_amount) > 0.05 THEN
    RAISE EXCEPTION 'Order financial totals do not match order items (calculated subtotal: %, vat: %, total: %)', v_subtotal, v_vat_amount, v_total_amount;
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
      unit_price,
      pricing_mode
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price')::numeric,
      COALESCE(v_item->>'pricing_mode', 'RETAIL')
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order_rpc(jsonb, jsonb) TO anon, authenticated, service_role;

-- 3. Update convert_quote_to_order_rpc to preserve customer's pricing model
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
  v_pricing_model text := 'RETAIL';
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

  -- Determine pricing model from customer type if available
  IF EXISTS (
    SELECT 1 FROM public.customers c WHERE c.id = v_quote.customer_id AND c.type = 'WHOLESALE'
  ) THEN
    v_pricing_model := 'WHOLESALE';
  ELSE
    v_pricing_model := 'RETAIL';
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
    v_pricing_model,
    v_quote.subtotal_amount,
    v_quote.vat_rate,
    v_quote.vat_amount,
    v_quote.total_amount,
    v_quote.notes,
    v_invoice_number
  ) RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, pricing_mode)
  SELECT v_order_id, product_id, quantity, unit_price, v_pricing_model
  FROM public.quote_items
  WHERE quote_id = p_quote_id;

  UPDATE public.quotes SET status = 'FULFILLED' WHERE id = p_quote_id;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.convert_quote_to_order_rpc(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.convert_quote_to_order_rpc(uuid) TO authenticated;
