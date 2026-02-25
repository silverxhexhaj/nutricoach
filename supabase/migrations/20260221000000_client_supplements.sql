-- Add per-client supplement assignment to profiles (used when coach assigns products)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS herbalife_products TEXT[] DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS other_supplements TEXT[] DEFAULT NULL;
