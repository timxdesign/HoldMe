-- Circle comments, strengths, and enhanced goals

-- Enhance circle_goals with description, type, frequency
ALTER TABLE public.circle_goals ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.circle_goals ADD COLUMN IF NOT EXISTS type text default 'goal' check (type in ('goal', 'task', 'habit', 'commitment')) not null;
ALTER TABLE public.circle_goals ADD COLUMN IF NOT EXISTS frequency text default 'one_time' check (frequency in ('daily', 'weekly', 'monthly', 'one_time')) not null;

-- Circle comments (threaded)
CREATE TABLE public.circle_comments (
  id uuid default uuid_generate_v4() primary key,
  goal_id uuid references public.circle_goals(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  parent_id uuid references public.circle_comments(id) on delete cascade,
  created_at timestamptz default now() not null
);

-- Circle strengths (group encouragement, no receiver)
CREATE TABLE public.circle_strengths (
  id uuid default uuid_generate_v4() primary key,
  goal_id uuid references public.circle_goals(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  message text,
  created_at timestamptz default now() not null
);

-- Indexes
CREATE INDEX idx_circle_comments_goal ON public.circle_comments(goal_id);
CREATE INDEX idx_circle_comments_parent ON public.circle_comments(parent_id);
CREATE INDEX idx_circle_strengths_goal ON public.circle_strengths(goal_id);
CREATE INDEX idx_circle_strengths_sender ON public.circle_strengths(sender_id);

-- Enable RLS
ALTER TABLE public.circle_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_strengths ENABLE ROW LEVEL SECURITY;

-- RLS: circle_comments
CREATE POLICY "Members can view circle comments" ON public.circle_comments
  FOR SELECT USING (
    goal_id IN (
      SELECT id FROM public.circle_goals
      WHERE circle_id IN (SELECT circle_id FROM public.circle_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Members can create circle comments" ON public.circle_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND goal_id IN (
      SELECT id FROM public.circle_goals
      WHERE circle_id IN (SELECT circle_id FROM public.circle_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete own circle comments" ON public.circle_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS: circle_strengths
CREATE POLICY "Members can view circle strengths" ON public.circle_strengths
  FOR SELECT USING (
    goal_id IN (
      SELECT id FROM public.circle_goals
      WHERE circle_id IN (SELECT circle_id FROM public.circle_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Members can send circle strengths" ON public.circle_strengths
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND goal_id IN (
      SELECT id FROM public.circle_goals
      WHERE circle_id IN (SELECT circle_id FROM public.circle_members WHERE user_id = auth.uid())
    )
  );

-- Update notification type constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('strength', 'comment', 'reminder', 'invite', 'checkin', 'missed', 'circle_checkin', 'circle_comment', 'circle_strength', 'circle_mention'));

-- Trigger: notify on circle comment
CREATE OR REPLACE FUNCTION public.handle_circle_comment()
RETURNS trigger AS $$
DECLARE
  _sender_name text;
  _goal_title text;
  _goal_creator_id uuid;
  _circle_id uuid;
  _parent_author_id uuid;
  _mentioned_id uuid;
BEGIN
  SELECT full_name INTO _sender_name FROM public.users WHERE id = NEW.user_id;
  SELECT cg.title, cg.created_by, cg.circle_id INTO _goal_title, _goal_creator_id, _circle_id
    FROM public.circle_goals cg WHERE cg.id = NEW.goal_id;

  -- Notify goal creator
  IF _goal_creator_id IS NOT NULL AND _goal_creator_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      _goal_creator_id,
      'circle_comment',
      coalesce(_sender_name, 'Someone') || ' commented on your goal',
      '"' || coalesce(_goal_title, 'a goal') || '"',
      jsonb_build_object(
        'circle_id', _circle_id, 'goal_id', NEW.goal_id,
        'comment_id', NEW.id, 'sender_name', coalesce(_sender_name, 'Someone'),
        'url', '/circles/' || _circle_id || '/goals/' || NEW.goal_id
      )
    );
  END IF;

  -- Notify parent comment author on reply
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO _parent_author_id FROM public.circle_comments WHERE id = NEW.parent_id;
    IF _parent_author_id IS NOT NULL
       AND _parent_author_id != NEW.user_id
       AND (_goal_creator_id IS NULL OR _parent_author_id != _goal_creator_id) THEN
      INSERT INTO public.notifications (user_id, type, title, body, data)
      VALUES (
        _parent_author_id,
        'circle_comment',
        coalesce(_sender_name, 'Someone') || ' replied to your comment',
        'On "' || coalesce(_goal_title, 'a goal') || '"',
        jsonb_build_object(
          'circle_id', _circle_id, 'goal_id', NEW.goal_id,
          'comment_id', NEW.id, 'parent_id', NEW.parent_id,
          'sender_name', coalesce(_sender_name, 'Someone'),
          'url', '/circles/' || _circle_id || '/goals/' || NEW.goal_id
        )
      );
    END IF;
  END IF;

  -- Notify @mentioned users
  FOR _mentioned_id IN
    SELECT (regexp_matches(NEW.content, '@\[([0-9a-f-]+):', 'g'))[1]::uuid
  LOOP
    IF _mentioned_id != NEW.user_id
       AND (_goal_creator_id IS NULL OR _mentioned_id != _goal_creator_id)
       AND (_parent_author_id IS NULL OR _mentioned_id != _parent_author_id) THEN
      INSERT INTO public.notifications (user_id, type, title, body, data)
      VALUES (
        _mentioned_id,
        'circle_mention',
        coalesce(_sender_name, 'Someone') || ' mentioned you',
        'In "' || coalesce(_goal_title, 'a goal') || '"',
        jsonb_build_object(
          'circle_id', _circle_id, 'goal_id', NEW.goal_id,
          'comment_id', NEW.id, 'sender_name', coalesce(_sender_name, 'Someone'),
          'url', '/circles/' || _circle_id || '/goals/' || NEW.goal_id
        )
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_circle_comment_created
  AFTER INSERT ON public.circle_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_circle_comment();

-- Trigger: notify on circle strength
CREATE OR REPLACE FUNCTION public.handle_circle_strength()
RETURNS trigger AS $$
DECLARE
  _sender_name text;
  _goal_title text;
  _circle_id uuid;
  _member record;
BEGIN
  SELECT full_name INTO _sender_name FROM public.users WHERE id = NEW.sender_id;
  SELECT cg.title, cg.circle_id INTO _goal_title, _circle_id
    FROM public.circle_goals cg WHERE cg.id = NEW.goal_id;

  FOR _member IN
    SELECT user_id FROM public.circle_members
    WHERE circle_id = _circle_id AND user_id != NEW.sender_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      _member.user_id,
      'circle_strength',
      coalesce(_sender_name, 'Someone') || ' sent strength',
      'On "' || coalesce(_goal_title, 'a goal') || '"',
      jsonb_build_object(
        'circle_id', _circle_id, 'goal_id', NEW.goal_id,
        'sender_name', coalesce(_sender_name, 'Someone'),
        'url', '/circles/' || _circle_id || '/goals/' || NEW.goal_id
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_circle_strength_created
  AFTER INSERT ON public.circle_strengths
  FOR EACH ROW EXECUTE FUNCTION public.handle_circle_strength();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_strengths;
