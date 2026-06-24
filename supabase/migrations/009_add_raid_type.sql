-- Ajout du type d'événement (donjon / raid) et des sous-groupes de raid

alter table public.events
  add column event_type text not null default 'dungeon'
    check (event_type in ('dungeon', 'raid')),
  add column raid_groups int;            -- nombre de sous-groupes (2-4), null pour les donjons

alter table public.participants
  add column group_number int;           -- sous-groupe du joueur (1-N), null pour les donjons
