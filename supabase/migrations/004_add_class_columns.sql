-- Classe du personnage pour le créateur d'un événement
alter table public.events
  add column if not exists creator_class text;

-- Classe du personnage pour chaque participant
alter table public.participants
  add column if not exists player_class text;
