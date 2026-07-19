CREATE TABLE public.grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grocery_lists_owner_select" ON public.grocery_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "grocery_lists_owner_insert" ON public.grocery_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "grocery_lists_owner_update" ON public.grocery_lists
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "grocery_lists_owner_delete" ON public.grocery_lists
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_grocery_lists_user ON public.grocery_lists(user_id);
