CREATE OR REPLACE FUNCTION public.notify_os_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recipients text[] := ARRAY[]::text[];
  unique_recipients text[];
  staff_emails text[];
  requester_email text;
  assignee_email text;
  event_type text;
  rec text;
BEGIN
  SELECT array_agg(DISTINCT u.email)
    INTO staff_emails
  FROM auth.users u
  JOIN public.user_roles r ON r.user_id = u.id
  WHERE r.role IN ('admin','administrative','coordinator')
    AND u.email IS NOT NULL;

  IF TG_OP = 'INSERT' THEN
    event_type := 'created';
    IF staff_emails IS NOT NULL THEN
      recipients := recipients || staff_emails;
    END IF;
    SELECT email INTO requester_email FROM auth.users WHERE id = NEW.requester_id;
    IF requester_email IS NOT NULL THEN
      recipients := recipients || requester_email;
    END IF;
    IF NEW.assigned_to IS NOT NULL THEN
      SELECT email INTO assignee_email FROM auth.users WHERE id = NEW.assigned_to;
      IF assignee_email IS NOT NULL THEN
        recipients := recipients || assignee_email;
      END IF;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
      event_type := 'assigned';
      SELECT email INTO assignee_email FROM auth.users WHERE id = NEW.assigned_to;
      IF assignee_email IS NOT NULL THEN
        recipients := recipients || assignee_email;
      END IF;
      IF staff_emails IS NOT NULL THEN
        recipients := recipients || staff_emails;
      END IF;

    ELSIF OLD.priority IS DISTINCT FROM NEW.priority AND NEW.priority = 'urgent' THEN
      event_type := 'escalated';
      IF staff_emails IS NOT NULL THEN recipients := recipients || staff_emails; END IF;
      IF NEW.assigned_to IS NOT NULL THEN
        SELECT email INTO assignee_email FROM auth.users WHERE id = NEW.assigned_to;
        IF assignee_email IS NOT NULL THEN recipients := recipients || assignee_email; END IF;
      END IF;
      SELECT email INTO requester_email FROM auth.users WHERE id = NEW.requester_id;
      IF requester_email IS NOT NULL THEN recipients := recipients || requester_email; END IF;

    ELSIF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' THEN
      event_type := 'completed';
      IF staff_emails IS NOT NULL THEN recipients := recipients || staff_emails; END IF;
      SELECT email INTO requester_email FROM auth.users WHERE id = NEW.requester_id;
      IF requester_email IS NOT NULL THEN recipients := recipients || requester_email; END IF;
      IF NEW.assigned_to IS NOT NULL THEN
        SELECT email INTO assignee_email FROM auth.users WHERE id = NEW.assigned_to;
        IF assignee_email IS NOT NULL THEN recipients := recipients || assignee_email; END IF;
      END IF;

    ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
      event_type := 'status_changed';
      IF staff_emails IS NOT NULL THEN recipients := recipients || staff_emails; END IF;
      SELECT email INTO requester_email FROM auth.users WHERE id = NEW.requester_id;
      IF requester_email IS NOT NULL THEN recipients := recipients || requester_email; END IF;
      IF NEW.assigned_to IS NOT NULL THEN
        SELECT email INTO assignee_email FROM auth.users WHERE id = NEW.assigned_to;
        IF assignee_email IS NOT NULL THEN recipients := recipients || assignee_email; END IF;
      END IF;
    END IF;
  END IF;

  IF event_type IS NOT NULL AND array_length(recipients, 1) > 0 THEN
    SELECT array_agg(DISTINCT x) INTO unique_recipients
    FROM unnest(recipients) x WHERE x IS NOT NULL;

    FOREACH rec IN ARRAY unique_recipients
    LOOP
      PERFORM net.http_post(
        url := 'https://zxzoslfqzrnmenuxqsup.supabase.co/functions/v1/send-os-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4em9zbGZxenJubWVudXhxc3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NTgzNTQsImV4cCI6MjA5MTAzNDM1NH0.tS_YGKZgdao31qtk0dXzdiPmHWe9gs4YHR1rwwTe3o8'
        ),
        body := jsonb_build_object(
          'event', event_type,
          'order', row_to_json(NEW),
          'recipient_email', rec
        )
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;