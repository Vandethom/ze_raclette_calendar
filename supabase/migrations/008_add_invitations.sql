-- Invitations à un événement
create table public.event_invitations (
  id          uuid        primary key default gen_random_uuid(),
  event_id    uuid        not null references public.events(id) on delete cascade,
  pseudo      text        not null,
  status      text        not null default 'pending'
              check (status in ('pending', 'accepted', 'declined')),
  invited_at  timestamptz not null default now(),
  unique (event_id, pseudo)
);

alter table public.event_invitations enable row level security;
create policy "event_invitations_all" on public.event_invitations for all using (true) with check (true);
alter publication supabase_realtime add table public.event_invitations;
