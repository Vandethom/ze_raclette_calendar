import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { PlayerProfile, WeeklyAvailability } from '../types'

export function useAvailability(pseudo: string | null) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [slots, setSlots] = useState<WeeklyAvailability[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!pseudo || !isSupabaseConfigured) return
    setLoading(true)
    const [profileRes, slotsRes] = await Promise.all([
      supabase.from('player_profiles').select('*').eq('pseudo', pseudo).maybeSingle(),
      supabase.from('weekly_availabilities').select('*').eq('pseudo', pseudo),
    ])
    setProfile(profileRes.data ?? null)
    setSlots(slotsRes.data ?? [])
    setLoading(false)
  }, [pseudo])

  // Upsert le profil (classe + note). Crée la ligne si elle n'existe pas encore.
  const saveProfile = async (playerClass: string | null, note: string | null): Promise<boolean> => {
    if (!pseudo) return false
    const { error } = await supabase.from('player_profiles').upsert({
      pseudo,
      player_class: playerClass,
      availability_note: note,
      updated_at: new Date().toISOString(),
    })
    if (!error) await fetchAll()
    return !error
  }

  // Bascule un créneau horaire (ajoute s'il n'existe pas, supprime sinon)
  const toggleSlot = async (dayOfWeek: number, hour: number): Promise<boolean> => {
    if (!pseudo) return false
    const existing = slots.find(
      (s) => s.day_of_week === dayOfWeek && s.hour === hour
    )
    if (existing) {
      const { error } = await supabase.from('weekly_availabilities').delete().eq('id', existing.id)
      if (!error) await fetchAll()
      return !error
    } else {
      const { error } = await supabase
        .from('weekly_availabilities')
        .insert({ pseudo, day_of_week: dayOfWeek, hour })
      if (!error) await fetchAll()
      return !error
    }
  }

  useEffect(() => {
    fetchAll()
    if (!pseudo || !isSupabaseConfigured) return

    const channel = supabase
      .channel(`avail-${pseudo}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_availabilities' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'player_profiles' }, fetchAll)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pseudo, fetchAll])

  return { profile, slots, loading, saveProfile, toggleSlot }
}
