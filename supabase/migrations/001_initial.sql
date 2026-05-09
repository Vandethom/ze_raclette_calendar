-- ============================================================
-- Calendrier Ze Raclette — Migration initiale
-- ============================================================
-- À exécuter dans l'éditeur SQL de Supabase (SQL Editor > New query)
-- ============================================================

-- Table des événements
create table if not exists public.events (
  id              uuid        default gen_random_uuid() primary key,
  dungeon_name    text        not null,
  creator_pseudo  text        not null,
  date_start      timestamptz not null,
  date_end        timestamptz not null,
  max_participants integer    check (max_participants >= 2 and max_participants <= 20),
  level           integer     check (level >= 1 and level <= 230),
  description     text,
  created_at      timestamptz default now() not null
);

-- Table des participants (hors créateur)
create table if not exists public.participants (
  id          uuid        default gen_random_uuid() primary key,
  event_id    uuid        not null references public.events(id) on delete cascade,
  pseudo      text        not null,
  joined_at   timestamptz default now() not null,
  unique(event_id, pseudo)   -- un pseudo ne peut rejoindre qu'une fois
);

-- Row Level Security (activé mais ouvert : pas d'auth)
alter table public.events      enable row level security;
alter table public.participants enable row level security;

create policy "Public select events"     on public.events      for select using (true);
create policy "Public insert events"     on public.events      for insert with check (true);
create policy "Public delete events"     on public.events      for delete using (true);

create policy "Public select participants" on public.participants for select using (true);
create policy "Public insert participants" on public.participants for insert with check (true);
create policy "Public delete participants" on public.participants for delete using (true);

-- Activer la réplication temps-réel pour les deux tables
-- (à faire dans Database > Replication si la commande échoue)
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.participants;
