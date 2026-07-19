CREATE TABLE public.weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  goal TEXT DEFAULT 'maintain',
  days JSONB DEFAULT '[]'::jsonb,
  weekly_summary JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_plans_owner_select" ON public.weekly_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "weekly_plans_owner_insert" ON public.weekly_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "weekly_plans_owner_update" ON public.weekly_plans
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "weekly_plans_owner_delete" ON public.weekly_plans
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_weekly_plans_user ON public.weekly_plans(user_id);
