CREATE OR REPLACE FUNCTION public.get_next_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year text := to_char(now(), 'YYYY');
  next_num integer;
BEGIN
  SELECT COALESCE(MAX(
    CASE WHEN order_number LIKE current_year || '-%'
    THEN (split_part(order_number, '-', 2))::integer
    ELSE 0 END
  ), 0) + 1
  INTO next_num
  FROM service_orders;
  RETURN current_year || '-' || LPAD(next_num::text, 4, '0');
END;
$$;