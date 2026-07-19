CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meals JSONB DEFAULT '[]'::jsonb,
  total_calories INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meal_plans_owner_select" ON public.meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meal_plans_owner_insert" ON public.meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_plans_owner_update" ON public.meal_plans
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_plans_owner_delete" ON public.meal_plans
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_meal_plans_user_date ON public.meal_plans(user_id, date);
