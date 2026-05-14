-- Profil public de chaque joueur (note de disponibilité + classe à jour)
create table public.player_profiles (
  pseudo             text        primary key,
  player_class       text,
  availability_note  text,
  updated_at         timestamptz not null default now()
);

-- Grille de disponibilités hebdomadaires récurrentes heure par heure
-- day_of_week : 0 = Lundi … 6 = Dimanche
-- hour        : 0–23 (heure de début du créneau d'une heure)
--               Ex : hour=18 → "disponible de 18h à 19h"
create table public.weekly_availabilities (
  id          uuid    primary key default gen_random_uuid(),
  pseudo      text    not null references public.player_profiles(pseudo) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  hour        integer not null check (hour between 0 and 23),
  unique(pseudo, day_of_week, hour)
);

alter table public.player_profiles      enable row level security;
alter table public.weekly_availabilities enable row level security;

create policy "player_profiles_all"       on public.player_profiles      for all using (true) with check (true);
create policy "weekly_availabilities_all" on public.weekly_availabilities for all using (true) with check (true);

alter publication supabase_realtime add table public.player_profiles;
alter publication supabase_realtime add table public.weekly_availabilities;
