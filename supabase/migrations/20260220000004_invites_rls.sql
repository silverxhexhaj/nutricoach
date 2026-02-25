ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Coaches can manage their own invites
CREATE POLICY "Coaches manage own invites" ON invites
  FOR ALL USING (
    coach_id IN (SELECT id FROM coaches WHERE user_id = auth.uid())
  );

-- Anyone can read invite by token (for accept flow - validated in app)
CREATE POLICY "Anyone can read invites by token" ON invites
  FOR SELECT USING (true);
