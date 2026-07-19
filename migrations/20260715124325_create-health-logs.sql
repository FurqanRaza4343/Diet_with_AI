CREATE TABLE public.health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(5,1),
  water_intake NUMERIC(4,1),
  calories INTEGER,
  steps INTEGER,
  sleep_hours NUMERIC(3,1),
  mood TEXT DEFAULT 'happy',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "health_logs_owner_select" ON public.health_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "health_logs_owner_insert" ON public.health_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "health_logs_owner_update" ON public.health_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "health_logs_owner_delete" ON public.health_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_health_logs_user_date ON public.health_logs(user_id, date);
