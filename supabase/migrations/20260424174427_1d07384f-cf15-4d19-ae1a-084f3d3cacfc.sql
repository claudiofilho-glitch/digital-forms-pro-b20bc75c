-- Habilitar extensão pg_net se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_os_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_type text;
  recipient_email text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    event_type := 'created';
    SELECT email INTO recipient_email
      FROM auth.users WHERE id = NEW.requester_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to
       AND NEW.assigned_to IS NOT NULL THEN
      event_type := 'assigned';
      SELECT email INTO recipient_email
        FROM auth.users WHERE id = NEW.assigned_to;
    ELSIF OLD.priority != 'urgent'
       AND NEW.priority = 'urgent' THEN
      event_type := 'escalated';
      SELECT email INTO recipient_email
        FROM auth.users WHERE id = NEW.assigned_to;
    ELSIF OLD.status != 'completed'
       AND NEW.status = 'completed' THEN
      event_type := 'completed';
      SELECT email INTO recipient_email
        FROM auth.users WHERE id = NEW.requester_id;
    END IF;
  END IF;

  IF event_type IS NOT NULL AND recipient_email IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://zxzoslfqzrnmenuxqsup.supabase.co/functions/v1/send-os-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4em9zbGZxenJubWVudXhxc3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NTgzNTQsImV4cCI6MjA5MTAzNDM1NH0.tS_YGKZgdao31qtk0dXzdiPmHWe9gs4YHR1rwwTe3o8'
      ),
      body := jsonb_build_object(
        'event', event_type,
        'order', row_to_json(NEW),
        'recipient_email', recipient_email
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS os_notification_trigger ON public.service_orders;

CREATE TRIGGER os_notification_trigger
AFTER INSERT OR UPDATE ON public.service_orders
FOR EACH ROW EXECUTE FUNCTION public.notify_os_event();