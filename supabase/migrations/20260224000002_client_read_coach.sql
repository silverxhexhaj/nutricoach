create policy "clients read assigned coach"
  on coaches for select
  using (
    id in (
      select coach_id from clients
      where user_id = auth.uid()
        and coach_id is not null
    )
  );
