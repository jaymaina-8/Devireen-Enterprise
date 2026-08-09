-- Update Quote to Order RPC to respect sale_price
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
        DECLARE
            v_prod_price numeric;
            v_prod_sale numeric;
        BEGIN
            SELECT price, sale_price INTO v_prod_price, v_prod_sale FROM public.products WHERE id = v_item.product_id;
            
            IF v_prod_sale IS NOT NULL AND v_prod_sale > 0 THEN
                v_item_price := v_prod_sale;
            ELSE
                v_item_price := COALESCE(v_prod_price, 0);
            END IF;
        END;
        
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
