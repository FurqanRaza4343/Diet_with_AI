CREATE TABLE public.nutrition_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text TEXT,
  image_url TEXT,
  result JSONB DEFAULT '{}'::jsonb,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nutrition_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutrition_analyses_owner_select" ON public.nutrition_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "nutrition_analyses_owner_insert" ON public.nutrition_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nutrition_analyses_owner_delete" ON public.nutrition_analyses
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_nutrition_analyses_user ON public.nutrition_analyses(user_id);
