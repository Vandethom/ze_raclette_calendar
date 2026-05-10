import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { GuildEvent, GuildEventWithParticipants, CreateEventInput } from '../types'

export function useEvents(currentPseudo: string) {
  const [events, setEvents] = useState<GuildEvent[]>([])
  const [myParticipatedIds, setMyParticipatedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      const [eventsRes, partRes] = await Promise.all([
        supabase.from('events').select('*').order('date_start', { ascending: true }),
        currentPseudo
          ? supabase.from('participants').select('event_id').eq('pseudo', currentPseudo)
          : Promise.resolve({ data: [], error: null }),
      ])

      if (eventsRes.error) throw eventsRes.error
      setEvents(eventsRes.data ?? [])

      if (partRes.data) {
        setMyParticipatedIds(new Set(partRes.data.map((p) => p.event_id)))
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [currentPseudo])

  const fetchEventWithParticipants = async (id: string): Promise<GuildEventWithParticipants | null> => {
    const { data, error } = await supabase
      .from('events')
      .select('*, participants(*)')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as GuildEventWithParticipants
  }

  const createEvent = async (input: CreateEventInput): Promise<GuildEvent | null> => {
    const { data, error } = await supabase.from('events').insert(input).select().single()
    if (error) { setError(error.message); return null }
    return data
  }

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    if (error) { setError(error.message); return false }
    return true
  }

  const joinEvent = async (eventId: string, pseudo: string, role?: string | null): Promise<{ ok: boolean; errorMsg?: string }> => {
    const payload: Record<string, unknown> = { event_id: eventId, pseudo }
    if (role) payload.role = role   // n'envoie pas role: null si la colonne n'existe pas encore
    const { error } = await supabase.from('participants').insert(payload)
    if (error) { setError(error.message); return { ok: false, errorMsg: error.message } }
    return { ok: true }
  }

  const leaveEvent = async (eventId: string, pseudo: string): Promise<boolean> => {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('event_id', eventId)
      .eq('pseudo', pseudo)
    if (error) { setError(error.message); return false }
    return true
  }

  useEffect(() => {
    fetchEvents()

    const channel = supabase
      .channel('realtime-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchEvents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, fetchEvents)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchEvents])

  return {
    events,
    myParticipatedIds,
    loading,
    error,
    createEvent,
    deleteEvent,
    fetchEventWithParticipants,
    joinEvent,
    leaveEvent,
    refetch: fetchEvents,
  }
}
