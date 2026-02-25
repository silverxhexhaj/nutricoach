-- Per-client program item overrides: add, replace, or hide template items per client

create table if not exists client_program_item_overrides (
  id uuid primary key default gen_random_uuid(),
  client_program_id uuid not null references client_programs(id) on delete cascade,
  program_day_id uuid not null references program_days(id) on delete cascade,
  source_item_id uuid references program_items(id) on delete cascade,
  action text not null default 'add'
    check (action in ('add', 'replace', 'hide')),
  type text check (type in ('workout', 'exercise', 'meal', 'video', 'text')),
  title text,
  content jsonb,
  sort_order smallint default 0,
  created_at timestamptz not null default now()
);

create index idx_client_program_overrides_cp
  on client_program_item_overrides(client_program_id);

create index idx_client_program_overrides_day
  on client_program_item_overrides(program_day_id);

-- Extend program_item_completions to support override items.
-- Keep the original (client_program_id, program_item_id) unique constraint
-- for template-item completions. Add a separate partial unique index for
-- override-based completions so NULL override_id rows are unaffected.
alter table program_item_completions
  alter column program_item_id drop not null;

alter table program_item_completions
  add column override_id uuid references client_program_item_overrides(id) on delete cascade;

create unique index idx_program_item_completions_override
  on program_item_completions(client_program_id, override_id)
  where override_id is not null;

alter table program_item_completions
  add constraint completion_has_item_or_override
    check (program_item_id is not null or override_id is not null);

-- RLS
alter table client_program_item_overrides enable row level security;

-- Coaches: full CRUD on overrides for their programs
create policy "coaches manage client overrides"
  on client_program_item_overrides for all
  using (
    client_program_id in (
      select cp.id from client_programs cp
      join clients c on c.id = cp.client_id
      join coaches co on co.id = c.coach_id
      where co.user_id = auth.uid()
    )
  )
  with check (
    client_program_id in (
      select cp.id from client_programs cp
      join clients c on c.id = cp.client_id
      join coaches co on co.id = c.coach_id
      where co.user_id = auth.uid()
    )
  );

-- Clients: read-only access to their own overrides
create policy "clients read own overrides"
  on client_program_item_overrides for select
  using (
    client_program_id in (
      select cp.id from client_programs cp
      join clients c on c.id = cp.client_id
      where c.user_id = auth.uid() and cp.is_active = true
    )
  );
