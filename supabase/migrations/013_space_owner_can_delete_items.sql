CREATE POLICY "Space owners can delete items" ON public.accountability_items
  FOR DELETE USING (
    auth.uid() = user_id
    OR space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    )
  );

DROP POLICY "Users can delete own items" ON public.accountability_items;
