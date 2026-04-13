ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS technician_signature text,
  ADD COLUMN IF NOT EXISTS client_signature text,
  ADD COLUMN IF NOT EXISTS technician_signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS client_signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS client_signer_name text;