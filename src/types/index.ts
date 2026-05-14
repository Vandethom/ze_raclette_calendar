export interface GuildEvent {
  id: string
  dungeon_name: string
  creator_pseudo: string
  creator_role: string | null
  creator_class: string | null
  date_start: string
  date_end: string
  max_participants: number | null
  level: number | null
  description: string | null
  created_at: string
}

export interface Participant {
  id: string
  event_id: string
  pseudo: string
  role: string | null
  player_class: string | null
  joined_at: string
}

export interface GuildEventWithParticipants extends GuildEvent {
  participants: Participant[]
}

export type CreateEventInput = Omit<GuildEvent, 'id' | 'created_at'>

export type UpdateEventInput = Partial<Pick<GuildEvent,
  'dungeon_name' | 'date_start' | 'date_end' | 'max_participants' | 'level' | 'description'
>>

// ─── Envies (activités sans date fixe) ──────────────────────────────────────

export type WishSlotPeriod = 'afternoon' | 'evening' | 'night'

export interface Wish {
  id: string
  activity_name: string
  creator_pseudo: string
  creator_class: string | null
  required_players: number
  deadline: string | null   // YYYY-MM-DD
  description: string | null
  status: 'open' | 'converted'
  converted_event_id: string | null
  created_at: string
}

export interface WishAvailability {
  id: string
  wish_id: string
  pseudo: string
  player_class: string | null
  slot_date: string         // YYYY-MM-DD
  slot_period: WishSlotPeriod
  joined_at: string
}

export interface WishWithAvailabilities extends Wish {
  availabilities: WishAvailability[]
}

export type CreateWishInput = {
  activity_name: string
  creator_pseudo: string
  creator_class?: string | null
  required_players: number
  deadline?: string | null
  description?: string | null
}

export interface EventPrefill {
  activityName?: string
  date?: string       // YYYY-MM-DD
  startTime?: string  // HH:MM
  endTime?: string    // HH:MM
}

// ─── Disponibilités hebdomadaires ────────────────────────────────────────────

export interface PlayerProfile {
  pseudo: string
  player_class: string | null
  availability_note: string | null
  updated_at: string
}

export interface WeeklyAvailability {
  id: string
  pseudo: string
  day_of_week: number   // 0 = Lundi … 6 = Dimanche
  hour: number          // 0-23 (heure de début : 18 = disponible de 18h à 19h)
}
