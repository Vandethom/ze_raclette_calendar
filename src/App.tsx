import { useState } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import { Navbar } from './components/Navbar'
import { CalendarView } from './components/CalendarView'
import { SearchResults } from './components/SearchResults'
import { GuidePage } from './components/GuidePage'
import { CreateEventModal } from './components/CreateEventModal'
import { EventDetailModal } from './components/EventDetailModal'
import { PseudoSetup } from './components/PseudoSetup'
import { ToastContainer } from './components/Toast'
import { useEvents } from './hooks/useEvents'
import { useToast } from './hooks/useToast'
import type { GuildEventWithParticipants, CreateEventInput } from './types'

const PSEUDO_KEY = 'ze_raclette_pseudo'
const CLASS_KEY = 'ze_raclette_class'

function SetupRequired() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="bg-[#161b22] border border-amber-400/30 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">⚙️</span>
          <div>
            <h1 className="text-white font-bold text-xl">Configuration requise</h1>
            <p className="text-gray-400 text-sm">Le backend Supabase n'est pas encore configuré.</p>
          </div>
        </div>
        <ol className="space-y-4 text-sm">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs">1</span>
            <span className="text-gray-300">
              Crée un projet gratuit sur{' '}
              <span className="text-amber-400 font-medium">supabase.com</span>
              {' '}(pas de carte bancaire requise)
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs">2</span>
            <span className="text-gray-300">
              Dans <span className="text-white font-medium">SQL Editor</span>, colle et exécute le contenu de{' '}
              <code className="bg-[#0d1117] text-amber-400 px-1.5 py-0.5 rounded text-xs">supabase/migrations/001_initial.sql</code>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs">3</span>
            <div className="text-gray-300 space-y-2">
              <p>Copie <code className="bg-[#0d1117] text-amber-400 px-1.5 py-0.5 rounded text-xs">.env.example</code> → <code className="bg-[#0d1117] text-amber-400 px-1.5 py-0.5 rounded text-xs">.env.local</code> et remplis :</p>
              <pre className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs text-gray-400 overflow-x-auto">{`VITE_SUPABASE_URL=https://xxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJ...`}</pre>
              <p className="text-gray-500">Les valeurs sont dans <span className="text-white">Project Settings → API</span>.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs">4</span>
            <span className="text-gray-300">
              Relance <code className="bg-[#0d1117] text-amber-400 px-1.5 py-0.5 rounded text-xs">npm run dev</code>
            </span>
          </li>
        </ol>
      </div>
    </div>
  )
}

function App() {
  if (!isSupabaseConfigured) return <SetupRequired />
  const [pseudo, setPseudo] = useState<string>(() => localStorage.getItem(PSEUDO_KEY) ?? '')
  const [playerClass, setPlayerClass] = useState<string>(() => localStorage.getItem(CLASS_KEY) ?? '')
  const [showPseudoSetup, setShowPseudoSetup] = useState(() => !localStorage.getItem(PSEUDO_KEY))
  const [createModalDate, setCreateModalDate] = useState<string | null>(null)
  const [detailEvent, setDetailEvent] = useState<GuildEventWithParticipants | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState<'calendar' | 'guide'>('calendar')

  const { events, allParticipants, myParticipatedIds, loading, error, createEvent, deleteEvent, fetchEventWithParticipants, joinEvent, leaveEvent } =
    useEvents(pseudo)

  const filteredEvents = searchQuery.trim()
    ? events.filter((e) => {
        const q = searchQuery.trim().toLowerCase()
        if (e.dungeon_name.toLowerCase().includes(q)) return true
        if (e.creator_pseudo.toLowerCase().includes(q)) return true
        return allParticipants.some((p) => p.event_id === e.id && p.pseudo.toLowerCase().includes(q))
      })
    : events
  const { toasts, addToast, dismissToast } = useToast()

  const handleSetPseudo = (newPseudo: string, newClass: string) => {
    setPseudo(newPseudo)
    setPlayerClass(newClass)
    localStorage.setItem(PSEUDO_KEY, newPseudo)
    if (newClass) localStorage.setItem(CLASS_KEY, newClass)
    else localStorage.removeItem(CLASS_KEY)
    setShowPseudoSetup(false)
  }

  const handleDateClick = (dateStr: string) => {
    if (!pseudo) { setShowPseudoSetup(true); return }
    setCreateModalDate(dateStr)
  }

  const handleEventClick = async (eventId: string) => {
    const event = await fetchEventWithParticipants(eventId)
    if (event) setDetailEvent(event)
    else addToast('Impossible de charger l\'événement.', 'error')
  }

  const handleCreateEvent = async (data: CreateEventInput): Promise<boolean> => {
    const result = await createEvent(data)
    if (result) {
      addToast('Événement créé avec succès !', 'success')
      return true
    }
    addToast('Erreur lors de la création.', 'error')
    return false
  }

  const handleJoin = async (role: string | null) => {
    if (!detailEvent) return
    const { ok, errorMsg } = await joinEvent(detailEvent.id, pseudo, role, playerClass || null)
    if (ok) {
      addToast(`Tu as rejoint "${detailEvent.dungeon_name}" !`, 'success')
      const updated = await fetchEventWithParticipants(detailEvent.id)
      if (updated) setDetailEvent(updated)
    } else {
      addToast(errorMsg ?? 'Impossible de rejoindre l\'événement.', 'error')
    }
  }

  const handleLeave = async () => {
    if (!detailEvent) return
    const ok = await leaveEvent(detailEvent.id, pseudo)
    if (ok) {
      addToast('Tu as quitté l\'événement.', 'success')
      const updated = await fetchEventWithParticipants(detailEvent.id)
      if (updated) setDetailEvent(updated)
    } else {
      addToast('Impossible de quitter l\'événement.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!detailEvent) return
    const ok = await deleteEvent(detailEvent.id)
    if (ok) {
      addToast('Événement supprimé.', 'success')
      setDetailEvent(null)
    } else {
      addToast('Impossible de supprimer l\'événement.', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar
        pseudo={pseudo}
        playerClass={playerClass}
        onChangePseudo={() => setShowPseudoSetup(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <main className={currentPage === 'guide' ? '' : 'container mx-auto px-4 py-6 max-w-6xl'}>
        {currentPage === 'guide' ? (
          <GuidePage />
        ) : (
          <>
            {error && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
                <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                <span className="text-sm">Chargement des événements…</span>
              </div>
            ) : searchQuery.trim() ? (
              <SearchResults
                events={filteredEvents}
                allParticipants={allParticipants}
                searchQuery={searchQuery}
                currentPseudo={pseudo}
                onEventClick={handleEventClick}
              />
            ) : (
              <CalendarView
                events={events}
                currentPseudo={pseudo}
                myParticipatedIds={myParticipatedIds}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            )}
          </>
        )}
      </main>

      {/* Bouton flottant pour créer un événement (mobile) */}
      {pseudo && (
        <button
          onClick={() => setCreateModalDate(new Date().toISOString())}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-full shadow-xl transition-colors text-sm"
        >
          + Proposer un événement
        </button>
      )}

      {/* Modals */}
      {showPseudoSetup && (
        <PseudoSetup onSetPseudo={handleSetPseudo} currentPseudo={pseudo} currentClass={playerClass} />
      )}

      {createModalDate !== null && (
        <CreateEventModal
          initialDate={createModalDate}
          creatorPseudo={pseudo}
          creatorClass={playerClass}
          onSubmit={handleCreateEvent}
          onClose={() => setCreateModalDate(null)}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          currentPseudo={pseudo}
          onJoin={handleJoin}
          onLeave={handleLeave}
          onDelete={handleDelete}
          onClose={() => setDetailEvent(null)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default App
