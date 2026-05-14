import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Users, Shield, CalendarCheck } from 'lucide-react'
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
  onViewProfile: (pseudo: string) => void
}

export function SearchResults({
  events,
  allParticipants,
  searchQuery,
  currentPseudo,
  onEventClick,
  onViewProfile,
}: Props) {
  if (!searchQuery.trim()) return null

  // Joueurs uniques mentionnés dans les résultats (créateurs + participants)
  const filteredIds = new Set(events.map((e) => e.id))
  const relevantParticipants = allParticipants.filter((p) => filteredIds.has(p.event_id))
  const uniquePseudos = [
    ...new Set([
      ...events.map((e) => e.creator_pseudo),
      ...relevantParticipants.map((p) => p.pseudo),
    ]),
  ].sort()

  return (
    <div className="mb-6">
      <p className="text-xs text-gray-500 mb-4 px-1">
        {events.length > 0 ? (
          <>
            {events.length} résultat{events.length > 1 ? 's' : ''} pour{' '}
            <span className="text-amber-400">"{searchQuery}"</span>
          </>
        ) : (
          <>
            Aucun résultat pour <span className="text-gray-400">"{searchQuery}"</span>
          </>
        )}
      </p>

      {/* Section joueurs trouvés */}
      {uniquePseudos.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-gray-500 font-medium mb-2">
            Joueurs mentionnés
          </p>
          <div className="flex flex-wrap gap-2">
            {uniquePseudos.map((pseudo) => {
              const creatorEvent = events.find((e) => e.creator_pseudo === pseudo)
              const playerClass = creatorEvent?.creator_class ?? null
              const isCurrentUser = pseudo === currentPseudo

              return (
                <button
                  key={pseudo}
                  onClick={() => onViewProfile(pseudo)}
                  className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] hover:border-amber-400/50 rounded-lg px-3 py-2 transition-all group"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
                    {pseudo.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-white text-xs font-medium group-hover:text-amber-400 transition-colors">
                      {pseudo}
                      {isCurrentUser && (
                        <span className="ml-1 text-[10px] text-amber-400/60">(moi)</span>
                      )}
                    </div>
                    {playerClass && (
                      <div className="text-[10px] text-gray-500">{playerClass}</div>
                    )}
                  </div>
                  <CalendarCheck
                    size={13}
                    className="text-gray-600 group-hover:text-amber-400 transition-colors ml-1"
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Événements */}
      {events.length === 0 ? (
        <div className="text-center text-gray-600 py-10 text-sm bg-[#161b22] border border-[#30363d] rounded-xl">
          Aucun événement, créateur ou participant ne correspond.
        </div>
      ) : (
        <>
          {uniquePseudos.length > 0 && (
            <p className="text-xs text-gray-500 font-medium mb-2">Événements</p>
          )}
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
        </>
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
  const isInvolved =
    event.creator_pseudo === currentPseudo ||
    participants.some((p) => p.pseudo === currentPseudo)
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

      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2.5">
        <Calendar size={11} className="flex-shrink-0" />
        <span>{dateLabel}</span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1 ${isFull ? 'text-red-400/70' : 'text-gray-600'}`}>
          <Users size={11} />
          {totalCount}
          {event.max_participants ? `/${event.max_participants}` : ''} participant
          {totalCount > 1 ? 's' : ''}
          {isFull ? ' · Complet' : ''}
        </span>
        {isInvolved && (
          <span className="text-[10px] text-amber-400/60 font-medium">Tu participes</span>
        )}
      </div>
    </button>
  )
}
