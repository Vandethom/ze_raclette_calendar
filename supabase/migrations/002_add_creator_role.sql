-- ============================================================
-- Migration 002 — Ajout du rôle de l'organisateur
-- ============================================================
-- À exécuter dans SQL Editor > New query

alter table public.events
  add column if not exists creator_role text;
