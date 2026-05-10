import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Users, Shield } from 'lucide-react'
import type { GuildEvent } from '../types'

interface AllParticipant {
  event_id: string
  pseudo: string
}

interface Props {
  events: GuildEvent[]
  allParticipants: AllParticipant[]
  searchQuery: string
  currentPseudo: string
  onEventClick: (id: string) => void
}

export function SearchResults({ events, allParticipants, searchQuery, currentPseudo, onEventClick }: Props) {
  if (!searchQuery.trim()) return null

  return (
    <div className="mb-6">
      <p className="text-xs text-gray-500 mb-3 px-1">
        {events.length > 0
          ? <>{events.length} résultat{events.length > 1 ? 's' : ''} pour <span className="text-amber-400">"{searchQuery}"</span></>
          : <>Aucun résultat pour <span className="text-gray-400">"{searchQuery}"</span></>
        }
      </p>

      {events.length === 0 ? (
        <div className="text-center text-gray-600 py-10 text-sm bg-[#161b22] border border-[#30363d] rounded-xl">
          Aucun événement, créateur ou participant ne correspond.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              participants={allParticipants.filter((p) => p.event_id === event.id)}
              currentPseudo={currentPseudo}
              onClick={() => onEventClick(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CardProps {
  event: GuildEvent
  participants: AllParticipant[]
  currentPseudo: string
  onClick: () => void
}

function EventCard({ event, participants, currentPseudo, onClick }: CardProps) {
  const totalCount = participants.length + 1
  const isFull = event.max_participants !== null && totalCount >= event.max_participants
  const isInvolved = event.creator_pseudo === currentPseudo || participants.some((p) => p.pseudo === currentPseudo)
  const isMultiDay = event.date_start.slice(0, 10) !== event.date_end.slice(0, 10)

  const dateStart = new Date(event.date_start)
  const dateEnd = new Date(event.date_end)

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const dateLabel = isMultiDay
    ? `Du ${capitalize(format(dateStart, 'd MMM', { locale: fr }))} au ${capitalize(format(dateEnd, 'd MMM yyyy', { locale: fr }))}`
    : `${capitalize(format(dateStart, 'EEE d MMM', { locale: fr }))} · ${format(dateStart, 'HH:mm')}–${format(dateEnd, 'HH:mm')}`

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-[#161b22] border rounded-xl p-4 hover:border-amber-400/50 transition-all group ${
        isInvolved ? 'border-amber-500/30' : 'border-[#30363d]'
      }`}
    >
      {/* Nom + niveau */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors leading-snug">
          {event.dungeon_name}
        </span>
        {event.level && (
          <span className="flex-shrink-0 text-[11px] text-amber-400/70 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
            Niv. {event.level}
          </span>
        )}
      </div>

      {/* Créateur + rôle */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2.5">
        <span>Par</span>
        <span className="text-amber-400 font-medium">{event.creator_pseudo}</span>
        {event.creator_role && (
          <span className="flex items-center gap-1 text-gray-500">
            <Shield size={10} />
            {event.creator_role}
          </span>
        )}
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2.5">
        <Calendar size={11} className="flex-shrink-0" />
        <span>{dateLabel}</span>
      </div>

      {/* Participants */}
      <div className="flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1 ${isFull ? 'text-red-400/70' : 'text-gray-600'}`}>
          <Users size={11} />
          {totalCount}{event.max_participants ? `/${event.max_participants}` : ''} participant{totalCount > 1 ? 's' : ''}
          {isFull ? ' · Complet' : ''}
        </span>
        {isInvolved && (
          <span className="text-[10px] text-amber-400/60 font-medium">Tu participes</span>
        )}
      </div>
    </button>
  )
}
