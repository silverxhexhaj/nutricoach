-- Programs feature: template programs coaches can assign to clients

create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id) on delete cascade,
  name text not null,
  description text,
  tags text[] not null default '{}',
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  days_per_week smallint,
  duration_weeks smallint not null default 1,
  start_day text not null default 'monday',
  color text not null default '#B8F04A',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  day_number smallint not null,
  label text,
  unique (program_id, day_number)
);

create table if not exists program_items (
  id uuid primary key default gen_random_uuid(),
  program_day_id uuid not null references program_days(id) on delete cascade,
  type text not null check (type in ('workout', 'exercise', 'meal', 'video', 'text')),
  title text not null,
  content jsonb,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists client_programs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  program_id uuid not null references programs(id) on delete cascade,
  start_date date not null,
  is_active boolean not null default true,
  assigned_at timestamptz not null default now()
);

-- Auto-update updated_at on programs
create or replace function update_programs_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger programs_updated_at
  before update on programs
  for each row execute function update_programs_updated_at();

-- RLS
alter table programs enable row level security;
alter table program_days enable row level security;
alter table program_items enable row level security;
alter table client_programs enable row level security;

-- Coaches manage their own programs
create policy "coaches manage own programs"
  on programs for all
  using (
    coach_id in (
      select id from coaches where user_id = auth.uid()
    )
  );

-- Program days accessible if program is accessible
create policy "program days via program"
  on program_days for all
  using (
    program_id in (
      select id from programs
      where coach_id in (select id from coaches where user_id = auth.uid())
    )
  );

-- Program items accessible if day is accessible
create policy "program items via program"
  on program_items for all
  using (
    program_day_id in (
      select pd.id from program_days pd
      join programs p on p.id = pd.program_id
      where p.coach_id in (select id from coaches where user_id = auth.uid())
    )
  );

-- Coaches manage client program assignments for their clients
create policy "coaches manage client programs"
  on client_programs for all
  using (
    client_id in (
      select id from clients
      where coach_id in (select id from coaches where user_id = auth.uid())
    )
  );

-- Clients can read their own assigned programs
create policy "clients read own assignments"
  on client_programs for select
  using (
    client_id in (
      select id from clients where user_id = auth.uid()
    )
  );
