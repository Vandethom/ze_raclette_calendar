-- Ajoute 'morning' aux périodes autorisées pour les disponibilités d'Envies
alter table public.wish_availabilities
  drop constraint wish_availabilities_slot_period_check;

alter table public.wish_availabilities
  add constraint wish_availabilities_slot_period_check
  check (slot_period in ('morning', 'afternoon', 'evening', 'night'));
