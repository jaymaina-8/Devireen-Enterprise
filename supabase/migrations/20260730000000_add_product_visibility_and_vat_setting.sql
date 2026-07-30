-- Add product visibility flags
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS show_in_retail BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_in_bulk BOOLEAN NOT NULL DEFAULT TRUE;

-- Add VAT setting to settings table
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS enable_vat BOOLEAN DEFAULT TRUE;
