ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS contact1_phone text,
  ADD COLUMN IF NOT EXISTS contact2_phone text;