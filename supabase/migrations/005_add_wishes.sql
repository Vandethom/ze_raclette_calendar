-- Activités sans date : les joueurs votent sur des créneaux, l'organisateur planifie quand c'est prêt

create table public.wishes (
  id               uuid        primary key default gen_random_uuid(),
  activity_name    text        not null,
  creator_pseudo   text        not null,
  creator_class    text,
  required_players integer     not null default 2 check (required_players between 2 and 20),
  deadline         date,
  description      text,
  status           text        not null default 'open' check (status in ('open', 'converted')),
  converted_event_id uuid      references public.events(id) on delete set null,
  created_at       timestamptz not null default now()
);

create table public.wish_availabilities (
  id          uuid        primary key default gen_random_uuid(),
  wish_id     uuid        not null references public.wishes(id) on delete cascade,
  pseudo      text        not null,
  player_class text,
  slot_date   date        not null,
  slot_period text        not null check (slot_period in ('afternoon', 'evening', 'night')),
  joined_at   timestamptz not null default now(),
  unique (wish_id, pseudo, slot_date, slot_period)
);

alter table public.wishes enable row level security;
alter table public.wish_availabilities enable row level security;

create policy "wishes_all"              on public.wishes              for all using (true) with check (true);
create policy "wish_availabilities_all" on public.wish_availabilities for all using (true) with check (true);

alter publication supabase_realtime add table public.wishes;
alter publication supabase_realtime add table public.wish_availabilities;
