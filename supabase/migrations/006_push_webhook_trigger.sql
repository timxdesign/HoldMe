-- Trigger function that calls the send-push Edge Function via pg_net
CREATE OR REPLACE FUNCTION notify_push_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://xwmoqtugrdtjfbalodks.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', '87325a18dd968c95ed6e99a2db4db178ab75780338f257551a36f3fd9e3c4575'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'notifications',
      'record', jsonb_build_object(
        'id', NEW.id,
        'user_id', NEW.user_id,
        'type', NEW.type,
        'title', NEW.title,
        'body', NEW.body,
        'data', NEW.data,
        'created_at', NEW.created_at
      )
    )
  );
  RETURN NEW;
END;
$$;

-- Trigger on notifications table INSERT
DROP TRIGGER IF EXISTS on_notification_insert_push ON notifications;
CREATE TRIGGER on_notification_insert_push
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION notify_push_on_insert();
