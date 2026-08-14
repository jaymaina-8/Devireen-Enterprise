-- Create RPC for atomic order creation
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
BEGIN
  -- Insert into orders
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
    total_amount,
    invoice_number,
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
    (p_order_data->>'total_amount')::numeric,
    p_order_data->>'invoice_number',
    p_order_data->>'status',
    p_order_data->>'payment_status',
    NOW(),
    NOW()
  ) RETURNING id INTO v_order_id;

  -- Insert items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_order_items)
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
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create order: %', SQLERRM;
END;
$$;
