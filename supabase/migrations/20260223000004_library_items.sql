-- Library items: reusable content coaches can add to programs

create table if not exists library_items (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id) on delete cascade,
  type text not null check (type in ('workout', 'exercise', 'meal', 'video', 'text')),
  title text not null,
  content jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_library_items_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger library_items_updated_at
  before update on library_items
  for each row execute function update_library_items_updated_at();

-- RLS: coaches manage their own
alter table library_items enable row level security;
create policy "coaches manage own library"
  on library_items for all
  using (
    coach_id in (
      select id from coaches where user_id = auth.uid()
    )
  );
