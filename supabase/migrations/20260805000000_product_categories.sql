-- 1. Create junction table
CREATE TABLE public.product_categories (
  product_id uuid references public.products(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  PRIMARY KEY (product_id, category_id)
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for product_categories
CREATE POLICY "Public catalog read" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Admin catalog full access" ON public.product_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Add is_all_categories boolean to products
ALTER TABLE public.products ADD COLUMN is_all_categories boolean not null default false;

-- 3. Migrate existing data
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id FROM public.products WHERE category_id IS NOT NULL;

-- 4. Drop category_id column from products
ALTER TABLE public.products DROP COLUMN category_id;
