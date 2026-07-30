-- Rename bulk_price to wholesale_price
ALTER TABLE public.products RENAME COLUMN bulk_price TO wholesale_price;

-- Rename show_in_bulk to show_in_wholesale
ALTER TABLE public.products RENAME COLUMN show_in_bulk TO show_in_wholesale;

-- Drop existing check constraints if they exist
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_pricing_model_check;

-- Update existing records
UPDATE public.orders SET pricing_model = 'WHOLESALE' WHERE pricing_model = 'BULK';

-- Add new check constraints to allow 'WHOLESALE'
ALTER TABLE public.orders ADD CONSTRAINT orders_pricing_model_check CHECK (pricing_model IN ('RETAIL', 'WHOLESALE'));
