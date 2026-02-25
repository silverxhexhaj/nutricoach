-- Client library support:
-- 1) shared platform items in library_items
-- 2) client personal items in client_library_items

-- Make library_items support platform-owned rows
alter table if exists library_items
  alter column coach_id drop not null;

alter table if exists library_items
  add column if not exists is_platform boolean not null default false;

-- Replace previous broad policy with explicit policies
drop policy if exists "coaches manage own library" on library_items;
drop policy if exists "coaches read own library" on library_items;
drop policy if exists "coaches insert own library" on library_items;
drop policy if exists "coaches update own library" on library_items;
drop policy if exists "coaches delete own library" on library_items;
drop policy if exists "clients read visible library" on library_items;

create policy "coaches read own library"
  on library_items for select
  using (
    coach_id in (
      select id from coaches where user_id = auth.uid()
    )
  );

create policy "coaches insert own library"
  on library_items for insert
  with check (
    is_platform = false
    and coach_id in (
      select id from coaches where user_id = auth.uid()
    )
  );

create policy "coaches update own library"
  on library_items for update
  using (
    coach_id in (
      select id from coaches where user_id = auth.uid()
    )
  )
  with check (
    is_platform = false
    and coach_id in (
      select id from coaches where user_id = auth.uid()
    )
  );

create policy "coaches delete own library"
  on library_items for delete
  using (
    coach_id in (
      select id from coaches where user_id = auth.uid()
    )
  );

create policy "clients read visible library"
  on library_items for select
  using (
    is_platform = true
    or coach_id in (
      select c.coach_id
      from clients c
      where c.user_id = auth.uid()
        and c.coach_id is not null
    )
  );

-- Client personal library rows
create table if not exists client_library_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  type text not null check (type in ('note', 'bookmark', 'recipe', 'workout')),
  title text not null,
  content jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function update_client_library_items_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists client_library_items_updated_at on client_library_items;
create trigger client_library_items_updated_at
  before update on client_library_items
  for each row execute function update_client_library_items_updated_at();

alter table client_library_items enable row level security;

drop policy if exists "clients manage own client library" on client_library_items;

create policy "clients manage own client library"
  on client_library_items for all
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

-- Platform defaults (idempotent seed)
insert into library_items (coach_id, is_platform, type, title, content)
select
  null,
  true,
  seed.type,
  seed.title,
  seed.content
from (
  values
    (
      'text'::text,
      'Hydration Guide',
      '{"body":"Aim for consistent hydration throughout the day. Start your morning with water, sip regularly, and increase intake around workouts."}'::jsonb
    ),
    (
      'video'::text,
      'Warm-Up Basics',
      '{"url":"https://www.youtube.com/watch?v=2L2lnxIcNmo","notes":"Use this short dynamic warm-up before training sessions."}'::jsonb
    ),
    (
      'meal'::text,
      'Balanced Recovery Bowl',
      '{"foods":[{"name":"Rice","amount":"120","unit":"g"},{"name":"Chicken Breast","amount":"150","unit":"g"},{"name":"Mixed Vegetables","amount":"100","unit":"g"}],"meal_type":"Post-workout","notes":"Great option after training for carbs + protein."}'::jsonb
    )
) as seed(type, title, content)
where not exists (
  select 1
  from library_items li
  where li.is_platform = true
    and li.title = seed.title
);
