
-- Create clients table
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view clients
CREATE POLICY "Authenticated users can view clients"
  ON public.clients FOR SELECT TO authenticated
  USING (true);

-- Only admins can manage clients
CREATE POLICY "Admins can manage clients"
  ON public.clients FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add client_id to service_orders
ALTER TABLE public.service_orders
  ADD COLUMN client_id uuid REFERENCES public.clients(id),
  ADD COLUMN client_name text DEFAULT '';

-- Trigger for updated_at on clients
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
