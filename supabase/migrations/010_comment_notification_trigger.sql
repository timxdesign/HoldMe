CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS trigger AS $$
DECLARE
  sender_name text;
  item_title text;
  item_owner_id uuid;
  item_space_id uuid;
  parent_author_id uuid;
BEGIN
  SELECT full_name INTO sender_name FROM public.users WHERE id = NEW.user_id;
  SELECT title, user_id, space_id INTO item_title, item_owner_id, item_space_id
    FROM public.accountability_items WHERE id = NEW.item_id;

  -- Notify the goal owner (if commenter is not the owner)
  IF item_owner_id IS NOT NULL AND item_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      item_owner_id,
      'comment',
      coalesce(sender_name, 'Someone') || ' commented on your goal',
      '"' || coalesce(item_title, 'a goal') || '"',
      jsonb_build_object(
        'comment_id', NEW.id,
        'item_id', NEW.item_id,
        'space_id', item_space_id,
        'sender_id', NEW.user_id,
        'sender_name', coalesce(sender_name, 'Someone'),
        'item_title', coalesce(item_title, 'a goal')
      )
    );
  END IF;

  -- If this is a reply, also notify the parent comment author (if different from replier and goal owner)
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_author_id FROM public.comments WHERE id = NEW.parent_id;

    IF parent_author_id IS NOT NULL
       AND parent_author_id != NEW.user_id
       AND parent_author_id != item_owner_id THEN
      INSERT INTO public.notifications (user_id, type, title, body, data)
      VALUES (
        parent_author_id,
        'comment',
        coalesce(sender_name, 'Someone') || ' replied to your comment',
        'On "' || coalesce(item_title, 'a goal') || '"',
        jsonb_build_object(
          'comment_id', NEW.id,
          'item_id', NEW.item_id,
          'space_id', item_space_id,
          'sender_id', NEW.user_id,
          'sender_name', coalesce(sender_name, 'Someone'),
          'item_title', coalesce(item_title, 'a goal'),
          'parent_id', NEW.parent_id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment();
