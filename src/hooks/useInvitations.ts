import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { EventInvitationWithEvent } from '../types'

export function useInvitations(pseudo: string | null) {
  const [invitations, setInvitations] = useState<EventInvitationWithEvent[]>([])
  const [loading, setLoading] = useState(false)

  const fetchInvitations = useCallback(async () => {
    if (!pseudo || !isSupabaseConfigured) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('event_invitations')
        .select('*, events(*)')
        .eq('pseudo', pseudo)
        .order('invited_at', { ascending: false })
      if (!error) setInvitations((data ?? []) as EventInvitationWithEvent[])
    } catch {
      // table inexistante (migration pas encore exécutée) — fail silencieux
    }
    setLoading(false)
  }, [pseudo])

  const sendInvitations = async (eventId: string, pseudos: string[]): Promise<boolean> => {
    if (!pseudos.length) return true
    try {
      const { error } = await supabase
        .from('event_invitations')
        .insert(pseudos.map(p => ({ event_id: eventId, pseudo: p })))
      return !error
    } catch {
      return false
    }
  }

  const respondToInvitation = async (
    invitationId: string,
    status: 'accepted' | 'declined',
    eventId: string,
    playerClass: string | null
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('event_invitations')
        .update({ status })
        .eq('id', invitationId)

      if (!error && status === 'accepted' && pseudo) {
        await supabase.from('participants').upsert(
          { event_id: eventId, pseudo, player_class: playerClass, role: null },
          { onConflict: 'event_id,pseudo', ignoreDuplicates: true }
        )
      }

      if (!error) await fetchInvitations()
      return !error
    } catch {
      return false
    }
  }

  useEffect(() => {
    fetchInvitations()
    if (!pseudo || !isSupabaseConfigured) return

    const channel = supabase
      .channel(`invitations-${pseudo}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_invitations' }, fetchInvitations)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [pseudo, fetchInvitations])

  const pendingCount = invitations.filter(i => i.status === 'pending').length

  return { invitations, loading, pendingCount, sendInvitations, respondToInvitation }
}
