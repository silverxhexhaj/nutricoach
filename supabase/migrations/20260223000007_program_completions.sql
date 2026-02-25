-- Program completion tracking: day-level and per-item (workout/meal)

create table if not exists program_day_completions (
  id uuid primary key default gen_random_uuid(),
  client_program_id uuid not null references client_programs(id) on delete cascade,
  program_day_id uuid not null references program_days(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (client_program_id, program_day_id)
);

create table if not exists program_item_completions (
  id uuid primary key default gen_random_uuid(),
  client_program_id uuid not null references client_programs(id) on delete cascade,
  program_item_id uuid not null references program_items(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (client_program_id, program_item_id)
);

create index idx_program_day_completions_client_program
  on program_day_completions(client_program_id);

create index idx_program_item_completions_client_program
  on program_item_completions(client_program_id);

-- RLS
alter table program_day_completions enable row level security;
alter table program_item_completions enable row level security;

-- Clients: full access to their own completions (via client_programs -> clients -> user_id)
create policy "clients manage own day completions"
  on program_day_completions for all
  using (
    client_program_id in (
      select cp.id from client_programs cp
      join clients c on c.id = cp.client_id
      where c.user_id = auth.uid() and cp.is_active = true
    )
  )
  with check (
    client_program_id in (
      select cp.id from client_programs cp
      join clients c on c.id = cp.client_id
      where c.user_id = auth.uid() and cp.is_active = true
    )
  );

create policy "clients manage own item completions"
  on program_item_completions for all
  using (
    client_program_id in (
      select cp.id from client_programs cp
      join clients c on c.id = cp.client_id
      where c.user_id = auth.uid() and cp.is_active = true
    )
  )
  with check (
    client_program_id in (
      select cp.id from client_programs cp
      join clients c on c.id = cp.client_id
      where c.user_id = auth.uid() and cp.is_active = true
    )
  );

-- Coaches: read-only for their clients' completions
create policy "coaches read client day completions"
  on program_day_completions for select
  using (
    client_program_id in (
      select cp.id from client_programs cp
      join clients c on c.id = cp.client_id
      join coaches co on co.id = c.coach_id
      where co.user_id = auth.uid()
    )
  );

create policy "coaches read client item completions"
  on program_item_completions for select
  using (
    client_program_id in (
      select cp.id from client_programs cp
      join clients c on c.id = cp.client_id
      join coaches co on co.id = c.coach_id
      where co.user_id = auth.uid()
    )
  );
