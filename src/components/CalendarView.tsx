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

    // Détecte les événements multi-jours pour les afficher en all-day
    const startDay = event.date_start.slice(0, 10)
    const endDay = event.date_end.slice(0, 10)
    const isMultiDay = startDay !== endDay

    // Pour les allDay, FullCalendar utilise une fin exclusive : on ajoute 1 jour
    let fcEnd: string = event.date_end
    if (isMultiDay) {
      const d = new Date(event.date_end)
      d.setDate(d.getDate() + 1)
      fcEnd = d.toISOString().slice(0, 10)
    }

    const roleLabel = event.creator_role ? ` · ${event.creator_role}` : ''
    const levelLabel = event.level ? ` (${event.level})` : ''
    const title = `${event.creator_pseudo} — ${event.dungeon_name}${levelLabel}${roleLabel}`

    return {
      id: event.id,
      title,
      start: isMultiDay ? startDay : event.date_start,
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
