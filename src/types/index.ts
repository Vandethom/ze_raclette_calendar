export interface GuildEvent {
  id: string
  dungeon_name: string
  creator_pseudo: string
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
  joined_at: string
}

export interface GuildEventWithParticipants extends GuildEvent {
  participants: Participant[]
}

export type CreateEventInput = Omit<GuildEvent, 'id' | 'created_at'>
