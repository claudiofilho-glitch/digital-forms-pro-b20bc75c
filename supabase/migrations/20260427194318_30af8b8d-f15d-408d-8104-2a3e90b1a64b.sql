DROP TRIGGER IF EXISTS trg_notify_os_event ON public.service_orders;

CREATE TRIGGER trg_notify_os_event
AFTER INSERT OR UPDATE ON public.service_orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_os_event();