-- ============================================================
-- Migration 003 — Rôle par participant
-- ============================================================
-- À exécuter dans SQL Editor > New query

alter table public.participants
  add column if not exists role text;
