import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { GuildEventWithParticipants } from '../types'

export interface MemberStat {
  pseudo: string
  events_created: number
  events_joined: number
  total: number
  last_activity: string
}

export interface MonthStat {
  month: string   // "2024-11"
  label: string   // "Nov 2024"
  count: number
}

export interface DungeonStat {
  name: string
  count: number
}

export interface GlobalStats {
  total_events: number
  total_participations: number
  unique_members: number
  most_active_month: string
  months: MonthStat[]
  top_creators: MemberStat[]
  member_activity: MemberStat[]
  popular_dungeons: DungeonStat[]
}

export function useStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    const [eventsRes, participantsRes] = await Promise.all([
      supabase.from('events').select('id, creator_pseudo, dungeon_name, date_start, created_at'),
      supabase.from('participants').select('event_id, pseudo, joined_at'),
    ])

    const events = eventsRes.data ?? []
    const participants = participantsRes.data ?? []

    // Events by month (last 12 months)
    const monthMap = new Map<string, number>()
    events.forEach(e => {
      const d = new Date(e.date_start)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
    })
    const months: MonthStat[] = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => {
        const [y, m] = month.split('-')
        const label = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
        return { month, label, count }
      })

    const mostActiveMonth = months.reduce((a, b) => a.count >= b.count ? a : b, { month: '', label: '–', count: 0 })

    // Popular dungeons
    const dungeonMap = new Map<string, number>()
    events.forEach(e => dungeonMap.set(e.dungeon_name, (dungeonMap.get(e.dungeon_name) ?? 0) + 1))
    const popular_dungeons: DungeonStat[] = Array.from(dungeonMap.entries())
      .sort(([, a], [, b]) => b - a).slice(0, 8)
      .map(([name, count]) => ({ name, count }))

    // Member activity
    const creatorMap = new Map<string, { created: number; last: string }>()
    events.forEach(e => {
      const prev = creatorMap.get(e.creator_pseudo) ?? { created: 0, last: '' }
      creatorMap.set(e.creator_pseudo, {
        created: prev.created + 1,
        last: e.date_start > prev.last ? e.date_start : prev.last,
      })
    })

    const joinedMap = new Map<string, { joined: number; last: string }>()
    participants.forEach(p => {
      const event = events.find(e => e.id === p.event_id)
      const prev = joinedMap.get(p.pseudo) ?? { joined: 0, last: '' }
      joinedMap.set(p.pseudo, {
        joined: prev.joined + 1,
        last: event && event.date_start > prev.last ? event.date_start : prev.last,
      })
    })

    const allPseudos = new Set([...creatorMap.keys(), ...joinedMap.keys()])
    const member_activity: MemberStat[] = Array.from(allPseudos).map(pseudo => {
      const c = creatorMap.get(pseudo) ?? { created: 0, last: '' }
      const j = joinedMap.get(pseudo) ?? { joined: 0, last: '' }
      return {
        pseudo,
        events_created: c.created,
        events_joined: j.joined,
        total: c.created + j.joined,
        last_activity: c.last > j.last ? c.last : j.last,
      }
    }).sort((a, b) => b.total - a.total)

    const top_creators = [...member_activity]
      .sort((a, b) => b.events_created - a.events_created)
      .filter(m => m.events_created > 0)
      .slice(0, 10)

    setStats({
      total_events: events.length,
      total_participations: participants.length,
      unique_members: allPseudos.size,
      most_active_month: mostActiveMonth.label,
      months,
      top_creators,
      member_activity,
      popular_dungeons,
    })
    setLoading(false)
  }, [])

  // Export events in a date range with their participants
  const fetchEventsInRange = useCallback(async (from: string, to: string): Promise<GuildEventWithParticipants[]> => {
    const toEnd = `${to}T23:59:59.999Z`
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .gte('date_start', `${from}T00:00:00.000Z`)
      .lte('date_start', toEnd)
      .order('date_start')

    if (!eventsData?.length) return []

    const { data: participantsData } = await supabase
      .from('participants')
      .select('*')
      .in('event_id', eventsData.map(e => e.id))

    return eventsData.map(e => ({
      ...e,
      participants: (participantsData ?? []).filter(p => p.event_id === e.id),
    })) as GuildEventWithParticipants[]
  }, [])

  const deleteEvents = useCallback(async (ids: string[]): Promise<boolean> => {
    if (!ids.length) return true
    const { error } = await supabase.from('events').delete().in('id', ids)
    return !error
  }, [])

  return { stats, loading, fetchStats, fetchEventsInRange, deleteEvents }
}
