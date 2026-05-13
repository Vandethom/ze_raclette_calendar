import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Wish, WishAvailability, WishWithAvailabilities, CreateWishInput, WishSlotPeriod } from '../types'

export function useWishes() {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [wishAvailabilities, setWishAvailabilities] = useState<WishAvailability[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWishes = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setLoading(true)
    const [wishRes, availRes] = await Promise.all([
      supabase.from('wishes').select('*').eq('status', 'open').order('created_at', { ascending: false }),
      supabase.from('wish_availabilities').select('*'),
    ])
    setWishes(wishRes.data ?? [])
    setWishAvailabilities(availRes.data ?? [])
    setLoading(false)
  }, [])

  const fetchWishWithAvailabilities = async (wishId: string): Promise<WishWithAvailabilities | null> => {
    const [wishRes, availRes] = await Promise.all([
      supabase.from('wishes').select('*').eq('id', wishId).single(),
      supabase.from('wish_availabilities').select('*').eq('wish_id', wishId),
    ])
    if (!wishRes.data) return null
    return { ...wishRes.data, availabilities: availRes.data ?? [] }
  }

  const createWish = async (input: CreateWishInput): Promise<boolean> => {
    const { error } = await supabase.from('wishes').insert(input)
    if (error) return false
    await fetchWishes()
    return true
  }

  const toggleAvailability = async (
    wishId: string,
    pseudo: string,
    playerClass: string | null,
    slotDate: string,
    slotPeriod: WishSlotPeriod
  ): Promise<boolean> => {
    const { data } = await supabase
      .from('wish_availabilities')
      .select('id')
      .eq('wish_id', wishId)
      .eq('pseudo', pseudo)
      .eq('slot_date', slotDate)
      .eq('slot_period', slotPeriod)
      .maybeSingle()

    if (data) {
      const { error } = await supabase.from('wish_availabilities').delete().eq('id', data.id)
      return !error
    } else {
      const { error } = await supabase.from('wish_availabilities').insert({
        wish_id: wishId,
        pseudo,
        player_class: playerClass,
        slot_date: slotDate,
        slot_period: slotPeriod,
      })
      return !error
    }
  }

  const convertWish = async (wishId: string, eventId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('wishes')
      .update({ status: 'converted', converted_event_id: eventId })
      .eq('id', wishId)
    if (error) return false
    await fetchWishes()
    return true
  }

  const deleteWish = async (wishId: string): Promise<boolean> => {
    const { error } = await supabase.from('wishes').delete().eq('id', wishId)
    if (error) return false
    await fetchWishes()
    return true
  }

  useEffect(() => {
    fetchWishes()

    const channel = supabase
      .channel('wishes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, fetchWishes)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wish_availabilities' }, fetchWishes)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchWishes])

  return {
    wishes,
    wishAvailabilities,
    loading,
    createWish,
    fetchWishWithAvailabilities,
    toggleAvailability,
    convertWish,
    deleteWish,
  }
}
