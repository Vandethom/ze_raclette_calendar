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
