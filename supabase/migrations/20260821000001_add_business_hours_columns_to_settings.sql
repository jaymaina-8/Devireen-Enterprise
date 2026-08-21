-- Migration: Add missing settings columns to public.settings table
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS kra_pin TEXT,
  ADD COLUMN IF NOT EXISTS vat_rate NUMERIC NOT NULL DEFAULT 16,
  ADD COLUMN IF NOT EXISTS enable_vat BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS business_hours_weekdays TEXT,
  ADD COLUMN IF NOT EXISTS business_hours_weekends TEXT;
