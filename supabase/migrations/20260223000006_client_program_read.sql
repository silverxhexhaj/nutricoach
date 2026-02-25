-- Clients can read programs they are assigned to
create policy "clients read assigned programs"
  on programs for select
  using (
    id in (
      select program_id from client_programs cp
      join clients c on c.id = cp.client_id
      where c.user_id = auth.uid() and cp.is_active = true
    )
  );

-- Clients can read program_days for their assigned programs
create policy "clients read assigned program days"
  on program_days for select
  using (
    program_id in (
      select program_id from client_programs cp
      join clients c on c.id = cp.client_id
      where c.user_id = auth.uid() and cp.is_active = true
    )
  );

-- Clients can read program_items via program_days
create policy "clients read assigned program items"
  on program_items for select
  using (
    program_day_id in (
      select pd.id from program_days pd
      join client_programs cp on cp.program_id = pd.program_id
      join clients c on c.id = cp.client_id
      where c.user_id = auth.uid() and cp.is_active = true
    )
  );
