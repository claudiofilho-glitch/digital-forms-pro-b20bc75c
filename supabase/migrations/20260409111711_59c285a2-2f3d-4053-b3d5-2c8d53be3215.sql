
-- Change order_number from integer to text with year-based format
ALTER TABLE public.service_orders ALTER COLUMN order_number DROP DEFAULT;
ALTER TABLE public.service_orders ALTER COLUMN order_number TYPE text USING 
  EXTRACT(YEAR FROM created_at)::text || '-' || lpad(order_number::text, 4, '0');

-- Drop the old sequence
DROP SEQUENCE IF EXISTS service_orders_order_number_seq;

-- Create function to auto-generate order number, reusing gaps
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_year text;
  next_num integer;
  max_num integer;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::text;
  
  -- Get current max number for this year
  SELECT COALESCE(MAX(SPLIT_PART(order_number, '-', 2)::integer), 0)
  INTO max_num
  FROM service_orders
  WHERE order_number LIKE current_year || '-%';
  
  -- Find first available gap (reuse deleted numbers)
  SELECT MIN(n) INTO next_num
  FROM generate_series(1, max_num + 1) AS n
  WHERE NOT EXISTS (
    SELECT 1 FROM service_orders 
    WHERE order_number = current_year || '-' || lpad(n::text, 4, '0')
  );
  
  IF next_num IS NULL THEN
    next_num := 1;
  END IF;
  
  NEW.order_number := current_year || '-' || lpad(next_num::text, 4, '0');
  RETURN NEW;
END;
$$;

-- Create trigger to auto-set order number on insert
CREATE TRIGGER set_order_number_trigger
BEFORE INSERT ON public.service_orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_number();

-- Allow admins to delete cancelled OS
CREATE POLICY "Admins can delete cancelled OS"
ON public.service_orders
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND status = 'cancelled'::os_status);
