-- ==============================================================================
-- Migration: Add missing tax & token columns to orders/quotes and define create_order_rpc
-- ==============================================================================

-- 1. Add missing tax & token columns to settings, orders, and quotes
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

-- 2. Index for invoice access tokens
CREATE INDEX IF NOT EXISTS orders_invoice_access_token_hash_idx
  ON public.orders (invoice_access_token_hash)
  WHERE invoice_access_token_hash IS NOT NULL;

-- 3. Define create_order_rpc with proper ENUM casting and precision tolerance
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

-- 4. Grant execution permissions to anon, authenticated, and service_role
GRANT EXECUTE ON FUNCTION public.create_order_rpc(jsonb, jsonb) TO anon, authenticated, service_role;
