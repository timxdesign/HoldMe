CREATE OR REPLACE FUNCTION public.handle_new_strength()
RETURNS trigger AS $$
DECLARE
  sender_name text;
  item_title text;
  item_space_id uuid;
BEGIN
  SELECT full_name INTO sender_name FROM public.users WHERE id = NEW.sender_id;
  SELECT title, space_id INTO item_title, item_space_id FROM public.accountability_items WHERE id = NEW.item_id;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.receiver_id,
    'strength',
    coalesce(sender_name, 'Someone') || ' sent you strength',
    'On your goal "' || coalesce(item_title, 'a goal') || '"',
    jsonb_build_object(
      'strength_id', NEW.id,
      'item_id', NEW.item_id,
      'space_id', item_space_id,
      'sender_id', NEW.sender_id,
      'sender_name', coalesce(sender_name, 'Someone'),
      'item_title', coalesce(item_title, 'a goal')
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
