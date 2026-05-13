import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr'
import type { GuildEvent } from '../types'

interface Props {
  events: GuildEvent[]
  currentPseudo: string
  myParticipatedIds: Set<string>
  onDateClick: (dateStr: string) => void
  onEventClick: (eventId: string) => void
}

export function CalendarView({
  events,
  currentPseudo,
  myParticipatedIds,
  onDateClick,
  onEventClick,
}: Props) {
  const isMobile = window.innerWidth < 768

  const fcEvents = events.map((event) => {
    const isMine = event.creator_pseudo === currentPseudo
    const hasJoined = myParticipatedIds.has(event.id)
    const isInvolved = isMine || hasJoined

    // Comparaison en dates LOCALES (pas UTC) pour éviter le décalage horaire.
    // toLocaleDateString('sv') donne "YYYY-MM-DD" dans le fuseau du navigateur.
    const localStart = new Date(event.date_start).toLocaleDateString('sv')
    const localEnd   = new Date(event.date_end).toLocaleDateString('sv')
    const durationMs = new Date(event.date_end).getTime() - new Date(event.date_start).getTime()
    // Multi-jour = jours locaux différents ET durée > 20h (évite les événements qui chevauchent minuit)
    const isMultiDay = localStart !== localEnd && durationMs > 20 * 3_600_000

    let fcStart: string
    let fcEnd: string

    if (isMultiDay) {
      // FullCalendar allDay utilise une fin exclusive : on ajoute 1 jour en heure locale
      const endPlusOne = new Date(event.date_end)
      endPlusOne.setDate(endPlusOne.getDate() + 1)
      fcStart = localStart
      fcEnd   = endPlusOne.toLocaleDateString('sv')
    } else {
      // Événement ponctuel : on passe les ISO UTC, FullCalendar affiche en heure locale
      fcStart = event.date_start
      fcEnd   = event.date_end
    }

    const roleLabel = event.creator_role ? ` · ${event.creator_role}` : ''
    const levelLabel = event.level ? ` (${event.level})` : ''
    const title = `${event.creator_pseudo} — ${event.dungeon_name}${levelLabel}${roleLabel}`

    return {
      id: event.id,
      title,
      start: fcStart,
      end: fcEnd,
      allDay: isMultiDay,
      backgroundColor: isInvolved ? '#f59e0b' : '#3b82f6',
      borderColor: isInvolved ? '#b45309' : '#1d4ed8',
      textColor: isInvolved ? '#000' : '#fff',
    }
  })

  return (
    <div className="fc-dofus">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={isMobile ? 'dayGridMonth' : 'timeGridWeek'}
        locale={frLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: isMobile ? 'dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={fcEvents}
        dateClick={(info) => onDateClick(info.dateStr)}
        eventClick={(info) => onEventClick(info.event.id)}
        slotMinTime="06:00:00"
        slotMaxTime="26:00:00"
        allDaySlot
        allDayText="Long"
        slotDuration="00:30:00"
        height="auto"
        nowIndicator
        eventDisplay="block"
        dayMaxEvents={isMobile ? 3 : false}
      />
    </div>
  )
}
