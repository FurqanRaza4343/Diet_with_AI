CREATE TABLE public.food_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  calories NUMERIC(7,1) DEFAULT 0,
  protein NUMERIC(6,1) DEFAULT 0,
  carbs NUMERIC(6,1) DEFAULT 0,
  fat NUMERIC(6,1) DEFAULT 0,
  serving_size TEXT DEFAULT '100g',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "food_database_select_all" ON public.food_database
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "food_database_admin_insert" ON public.food_database
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND goal = 'admin')
  );

CREATE POLICY "food_database_admin_update" ON public.food_database
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND goal = 'admin')
  );

CREATE POLICY "food_database_admin_delete" ON public.food_database
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND goal = 'admin')
  );

CREATE INDEX idx_food_database_category ON public.food_database(category);
CREATE INDEX idx_food_database_name ON public.food_database(name);
