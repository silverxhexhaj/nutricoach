-- profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  weight_kg DECIMAL,
  height_cm DECIMAL,
  age INT,
  goal TEXT,
  activity_level TEXT,
  training_days INT,
  dietary_restrictions TEXT[],
  available_foods TEXT,
  supplements TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- coaches
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  brand_name TEXT,
  logo_url TEXT,
  subscription_tier TEXT DEFAULT 'starter',
  stripe_customer_id TEXT,
  client_limit INT DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- clients (coach_id NULL = self-serve individual)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  name TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  current_plan_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- meal_plans
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  plan_json JSONB NOT NULL,
  week_start_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- checkins
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg DECIMAL,
  water_ml INT,
  calories INT,
  protein_g INT,
  workout_done BOOLEAN,
  energy_level INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, date)
);

-- Indexes for common queries
CREATE INDEX idx_meal_plans_client ON meal_plans(client_id);
CREATE INDEX idx_meal_plans_coach ON meal_plans(coach_id);
CREATE INDEX idx_checkins_client_date ON checkins(client_id, date);
