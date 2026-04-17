ALTER TABLE public.service_orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_orders;