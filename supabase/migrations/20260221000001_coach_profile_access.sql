-- Allow coaches to read and update profiles of their clients
CREATE POLICY "Coaches can manage client profiles" ON profiles
  FOR ALL
  USING (
    user_id IN (
      SELECT c.user_id FROM clients c
      JOIN coaches co ON co.id = c.coach_id
      WHERE co.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT c.user_id FROM clients c
      JOIN coaches co ON co.id = c.coach_id
      WHERE co.user_id = auth.uid()
    )
  );
