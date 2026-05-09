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

    return {
      id: event.id,
      title: `${event.creator_pseudo} — ${event.dungeon_name}${event.level ? ` (${event.level})` : ''}`,
      start: event.date_start,
      end: event.date_end,
      backgroundColor: isInvolved ? '#f59e0b' : '#3b82f6',
      borderColor: isInvolved ? '#b45309' : '#1d4ed8',
      textColor: isInvolved ? '#000' : '#fff',
      extendedProps: { isMine, hasJoined, maxParticipants: event.max_participants },
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
        allDaySlot={false}
        slotDuration="00:30:00"
        height="auto"
        nowIndicator
        eventDisplay="block"
        dayMaxEvents={isMobile ? 3 : false}
      />
    </div>
  )
}
