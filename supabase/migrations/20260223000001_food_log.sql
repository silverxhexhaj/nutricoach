-- food_log_entries: stores individual food items a client logs per day
CREATE TABLE food_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  meal_slot TEXT NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack', 'supplement')),
  food_name TEXT NOT NULL,
  brand TEXT,
  serving_size DECIMAL,
  serving_unit TEXT DEFAULT 'g',
  calories DECIMAL NOT NULL DEFAULT 0,
  protein_g DECIMAL DEFAULT 0,
  carbs_g DECIMAL DEFAULT 0,
  fat_g DECIMAL DEFAULT 0,
  fiber_g DECIMAL DEFAULT 0,
  source TEXT CHECK (source IN ('usda', 'openfoodfacts', 'manual')),
  source_id TEXT,
  barcode TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_food_log_client_date ON food_log_entries(client_id, checkin_date);
CREATE INDEX idx_food_log_client_date_slot ON food_log_entries(client_id, checkin_date, meal_slot);

-- Enable RLS
ALTER TABLE food_log_entries ENABLE ROW LEVEL SECURITY;

-- Permissive policy (matches existing pattern — tighten in Phase 3)
CREATE POLICY "Allow all for food_log_entries" ON food_log_entries FOR ALL USING (true);
