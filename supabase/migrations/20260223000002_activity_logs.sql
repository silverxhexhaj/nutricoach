-- supplement_logs: tracks whether client took each planned supplement
CREATE TABLE supplement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  supplement_name TEXT NOT NULL,
  dose TEXT,
  time_slot TEXT NOT NULL,
  taken BOOLEAN DEFAULT false,
  taken_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, date, supplement_name, time_slot)
);

CREATE INDEX idx_supplement_logs_client_date ON supplement_logs(client_id, date);

-- exercise_logs: tracks whether client completed each planned exercise
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercise_name TEXT NOT NULL,
  planned_sets INT,
  planned_reps TEXT,
  completed BOOLEAN DEFAULT false,
  actual_sets INT,
  actual_reps TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, date, exercise_name)
);

CREATE INDEX idx_exercise_logs_client_date ON exercise_logs(client_id, date);

-- Enable RLS
ALTER TABLE supplement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

-- Clients can manage their own supplement_logs
CREATE POLICY "Clients manage own supplement_logs" ON supplement_logs
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- Coaches can read their clients' supplement_logs
CREATE POLICY "Coaches read clients supplement_logs" ON supplement_logs
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()))
  );

-- Clients can manage their own exercise_logs
CREATE POLICY "Clients manage own exercise_logs" ON exercise_logs
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- Coaches can read their clients' exercise_logs
CREATE POLICY "Coaches read clients exercise_logs" ON exercise_logs
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()))
  );
