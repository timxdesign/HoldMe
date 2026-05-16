-- Fix infinite recursion in RLS policies
-- Root cause: space_members SELECT policy referenced itself.
-- Fix: use simple user_id = auth.uid() on space_members, then other tables
-- can safely reference space_members without triggering recursion.

-- =============================================================
-- 1. Fix space_members: simple non-recursive SELECT policy
-- =============================================================
DROP POLICY IF EXISTS "Members can view space members" ON public.space_members;
CREATE POLICY "Members can view space members" ON public.space_members
  FOR SELECT USING (user_id = auth.uid());

-- Also fix INSERT to allow owners AND the user themselves to add membership
DROP POLICY IF EXISTS "Owners can manage members" ON public.space_members;
CREATE POLICY "Owners can manage members" ON public.space_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR space_id IN (SELECT id FROM public.spaces WHERE owner_id = auth.uid())
  );

-- =============================================================
-- 2. Fix spaces SELECT: allow owners + members to see spaces
-- =============================================================
DROP POLICY IF EXISTS "Space members can view spaces" ON public.spaces;
CREATE POLICY "Space members can view spaces" ON public.spaces
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
  );

-- =============================================================
-- 3. Fix users: view co-members without recursion
-- =============================================================
DROP POLICY IF EXISTS "Users can view others in shared spaces" ON public.users;
CREATE POLICY "Users can view others in shared spaces" ON public.users
  FOR SELECT USING (
    id IN (
      SELECT sm.user_id FROM public.space_members sm
      WHERE sm.space_id IN (
        SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
      )
    )
  );

-- =============================================================
-- 4. Fix accountability_items policies
-- =============================================================
DROP POLICY IF EXISTS "Members can view visible items" ON public.accountability_items;
CREATE POLICY "Members can view visible items" ON public.accountability_items
  FOR SELECT USING (
    user_id = auth.uid()
    OR (
      is_visible = true
      AND space_id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create items in their spaces" ON public.accountability_items;
CREATE POLICY "Users can create items in their spaces" ON public.accountability_items
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND space_id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
  );

-- =============================================================
-- 5. Fix item_checkins SELECT
-- =============================================================
DROP POLICY IF EXISTS "Users can view checkins for visible items" ON public.item_checkins;
CREATE POLICY "Users can view checkins for visible items" ON public.item_checkins
  FOR SELECT USING (
    item_id IN (
      SELECT id FROM public.accountability_items
      WHERE user_id = auth.uid()
        OR (is_visible = true AND space_id IN (
          SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
        ))
    )
  );

-- =============================================================
-- 6. Fix strengths INSERT
-- =============================================================
DROP POLICY IF EXISTS "Members can send strength" ON public.strengths;
CREATE POLICY "Members can send strength" ON public.strengths
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND item_id IN (
      SELECT id FROM public.accountability_items
      WHERE is_visible = true
        AND space_id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
    )
  );

-- =============================================================
-- 7. Fix comments policies
-- =============================================================
DROP POLICY IF EXISTS "Members can view comments" ON public.comments;
CREATE POLICY "Members can view comments" ON public.comments
  FOR SELECT USING (
    item_id IN (
      SELECT id FROM public.accountability_items
      WHERE user_id = auth.uid()
        OR (is_visible = true AND space_id IN (
          SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
        ))
    )
  );

DROP POLICY IF EXISTS "Members can create comments" ON public.comments;
CREATE POLICY "Members can create comments" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND item_id IN (
      SELECT id FROM public.accountability_items
      WHERE is_visible = true
        AND space_id IN (SELECT space_id FROM public.space_members WHERE user_id = auth.uid())
    )
  );

-- =============================================================
-- 8. Force PostgREST schema reload
-- =============================================================
NOTIFY pgrst, 'reload schema';
