-- Phase 2 security hardening: replace permissive RLS policies

-- Drop permissive legacy policies
drop policy if exists "Allow all for coaches" on coaches;
drop policy if exists "Allow all for clients" on clients;
drop policy if exists "Allow all for meal_plans" on meal_plans;
drop policy if exists "Allow all for checkins" on checkins;
drop policy if exists "Allow all for food_log_entries" on food_log_entries;

-- ------------------------------------------------------------------
-- coaches
-- ------------------------------------------------------------------
create policy "users read own coach"
  on coaches for select
  using (user_id = auth.uid());

create policy "users insert own coach"
  on coaches for insert
  with check (user_id = auth.uid());

create policy "users update own coach"
  on coaches for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users delete own coach"
  on coaches for delete
  using (user_id = auth.uid());

-- ------------------------------------------------------------------
-- clients
-- ------------------------------------------------------------------
create policy "clients read own client row"
  on clients for select
  using (user_id = auth.uid());

create policy "clients insert own client row"
  on clients for insert
  with check (user_id = auth.uid());

create policy "clients update own client row"
  on clients for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "coaches read own clients"
  on clients for select
  using (
    coach_id in (
      select id from coaches where user_id = auth.uid()
    )
  );

create policy "coaches update own clients"
  on clients for update
  using (
    coach_id in (
      select id from coaches where user_id = auth.uid()
    )
  )
  with check (
    coach_id in (
      select id from coaches where user_id = auth.uid()
    )
    or coach_id is null
  );

-- ------------------------------------------------------------------
-- meal_plans
-- ------------------------------------------------------------------
create policy "clients read own meal plans"
  on meal_plans for select
  using (
    client_id in (
      select id from clients where user_id = auth.uid()
    )
  );

create policy "clients insert own meal plans"
  on meal_plans for insert
  with check (
    client_id in (
      select id from clients where user_id = auth.uid()
    )
  );

create policy "clients update own meal plans"
  on meal_plans for update
  using (
    client_id in (
      select id from clients where user_id = auth.uid()
    )
  )
  with check (
    client_id in (
      select id from clients where user_id = auth.uid()
    )
  );

create policy "coaches read own clients meal plans"
  on meal_plans for select
  using (
    client_id in (
      select id from clients
      where coach_id in (select id from coaches where user_id = auth.uid())
    )
  );

create policy "coaches insert own clients meal plans"
  on meal_plans for insert
  with check (
    client_id in (
      select id from clients
      where coach_id in (select id from coaches where user_id = auth.uid())
    )
  );

create policy "coaches update own clients meal plans"
  on meal_plans for update
  using (
    client_id in (
      select id from clients
      where coach_id in (select id from coaches where user_id = auth.uid())
    )
  )
  with check (
    client_id in (
      select id from clients
      where coach_id in (select id from coaches where user_id = auth.uid())
    )
  );

-- ------------------------------------------------------------------
-- checkins
-- ------------------------------------------------------------------
create policy "clients manage own checkins"
  on checkins for all
  using (
    client_id in (
      select id from clients where user_id = auth.uid()
    )
  )
  with check (
    client_id in (
      select id from clients where user_id = auth.uid()
    )
  );

create policy "coaches read own clients checkins"
  on checkins for select
  using (
    client_id in (
      select id from clients
      where coach_id in (select id from coaches where user_id = auth.uid())
    )
  );

-- ------------------------------------------------------------------
-- food_log_entries
-- ------------------------------------------------------------------
create policy "clients manage own food logs"
  on food_log_entries for all
  using (
    client_id in (
      select id from clients where user_id = auth.uid()
    )
  )
  with check (
    client_id in (
      select id from clients where user_id = auth.uid()
    )
  );

create policy "coaches read own clients food logs"
  on food_log_entries for select
  using (
    client_id in (
      select id from clients
      where coach_id in (select id from coaches where user_id = auth.uid())
    )
  );
