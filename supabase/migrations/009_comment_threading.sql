-- Add parent_id for threaded comments
ALTER TABLE public.comments ADD COLUMN parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;

-- Indexes for comment and strength lookups
CREATE INDEX IF NOT EXISTS idx_comments_item ON public.comments(item_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_strengths_item ON public.strengths(item_id);
CREATE INDEX IF NOT EXISTS idx_strengths_sender ON public.strengths(sender_id);
