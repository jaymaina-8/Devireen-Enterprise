-- Add bulk_unit to products
alter table public.products
  add column if not exists bulk_unit text default 'Dozen';

-- Update existing products to have 'Dozen' if null
update public.products set bulk_unit = 'Dozen' where bulk_unit is null;
