create or replace function public.is_client_assigned_to_coach(target_coach_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clients c
    where c.user_id = auth.uid()
      and c.coach_id = target_coach_id
  );
$$;

revoke all on function public.is_client_assigned_to_coach(uuid) from public;
grant execute on function public.is_client_assigned_to_coach(uuid) to authenticated;

drop policy if exists "clients read assigned coach" on coaches;

create policy "clients read assigned coach"
  on coaches for select
  using (public.is_client_assigned_to_coach(id));
