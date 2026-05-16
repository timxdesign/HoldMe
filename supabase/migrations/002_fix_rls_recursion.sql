-- Fix infinite recursion in RLS policies
-- The space_members SELECT policy referenced itself, causing recursion.
-- Solution: use SECURITY DEFINER functions to check membership without triggering RLS.

-- Helper function: get current user's space IDs (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_space_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT space_id FROM public.space_members WHERE user_id = auth.uid();
$$;

-- Fix space_members SELECT (was self-referencing → infinite recursion)
DROP POLICY "Members can view space members" ON public.space_members;
CREATE POLICY "Members can view space members" ON public.space_members
  FOR SELECT USING (
    space_id IN (SELECT public.get_user_space_ids())
  );

-- Fix spaces SELECT (depended on recursive space_members policy)
-- Also allow owners to see their spaces immediately after creation
DROP POLICY "Space members can view spaces" ON public.spaces;
CREATE POLICY "Space members can view spaces" ON public.spaces
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (SELECT public.get_user_space_ids())
  );

-- Fix users "view others in shared spaces" policy
DROP POLICY "Users can view others in shared spaces" ON public.users;
CREATE POLICY "Users can view others in shared spaces" ON public.users
  FOR SELECT USING (
    id IN (
      SELECT sm.user_id FROM public.space_members sm
      WHERE sm.space_id IN (SELECT public.get_user_space_ids())
    )
  );

-- Fix accountability_items SELECT
DROP POLICY "Members can view visible items" ON public.accountability_items;
CREATE POLICY "Members can view visible items" ON public.accountability_items
  FOR SELECT USING (
    user_id = auth.uid()
    OR (
      is_visible = true
      AND space_id IN (SELECT public.get_user_space_ids())
    )
  );

-- Fix accountability_items INSERT
DROP POLICY "Users can create items in their spaces" ON public.accountability_items;
CREATE POLICY "Users can create items in their spaces" ON public.accountability_items
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND space_id IN (SELECT public.get_user_space_ids())
  );

-- Fix item_checkins SELECT
DROP POLICY "Users can view checkins for visible items" ON public.item_checkins;
CREATE POLICY "Users can view checkins for visible items" ON public.item_checkins
  FOR SELECT USING (
    item_id IN (
      SELECT id FROM public.accountability_items
      WHERE user_id = auth.uid()
        OR (is_visible = true AND space_id IN (SELECT public.get_user_space_ids()))
    )
  );

-- Fix strengths INSERT
DROP POLICY "Members can send strength" ON public.strengths;
CREATE POLICY "Members can send strength" ON public.strengths
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND item_id IN (
      SELECT id FROM public.accountability_items
      WHERE is_visible = true
        AND space_id IN (SELECT public.get_user_space_ids())
    )
  );

-- Fix comments SELECT
DROP POLICY "Members can view comments" ON public.comments;
CREATE POLICY "Members can view comments" ON public.comments
  FOR SELECT USING (
    item_id IN (
      SELECT id FROM public.accountability_items
      WHERE user_id = auth.uid()
        OR (is_visible = true AND space_id IN (SELECT public.get_user_space_ids()))
    )
  );

-- Fix comments INSERT
DROP POLICY "Members can create comments" ON public.comments;
CREATE POLICY "Members can create comments" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND item_id IN (
      SELECT id FROM public.accountability_items
      WHERE is_visible = true
        AND space_id IN (SELECT public.get_user_space_ids())
    )
  );
