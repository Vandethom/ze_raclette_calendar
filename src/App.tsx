import { useState, useEffect, useRef } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import { Navbar } from './components/Navbar'
import { CalendarView } from './components/CalendarView'
import { SearchResults } from './components/SearchResults'
import { GuidePage } from './components/GuidePage'
import { AvailabilityPage } from './components/AvailabilityPage'
import { StatsPage } from './components/StatsPage'
import { CreateEventModal } from './components/CreateEventModal'
import { EditEventModal } from './components/EditEventModal'
import { EventDetailModal } from './components/EventDetailModal'
import { AdminPasswordModal } from './components/AdminPasswordModal'
import { PseudoSetup } from './components/PseudoSetup'
import { WishesPanel } from './components/WishesPanel'
import { CreateWishModal } from './components/CreateWishModal'
import { WishDetailModal } from './components/WishDetailModal'
import { ToastContainer } from './components/Toast'
import { useEvents } from './hooks/useEvents'
import { useWishes } from './hooks/useWishes'
import { useInvitations } from './hooks/useInvitations'
import { useToast } from './hooks/useToast'
import type {
  GuildEventWithParticipants,
  CreateEventInput,
  UpdateEventInput,
  CreateWishInput,
  EventPrefill,
} from './types'

const PSEUDO_KEY = 'ze_raclette_pseudo'
const CLASS_KEY = 'ze_raclette_class'
const ADMIN_SESSION_KEY = 'ze_raclette_admin'
const ADMIN_PSEUDO = 'BlueCheese'

type Page = 'calendar' | 'guide' | 'availabilities' | 'stats'

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
  const [isAdmin, setIsAdmin] = useState(() =>
    localStorage.getItem(PSEUDO_KEY) === ADMIN_PSEUDO &&
    sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'
  )
  const [showPseudoSetup, setShowPseudoSetup] = useState(() => !localStorage.getItem(PSEUDO_KEY))
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [pendingAdmin, setPendingAdmin] = useState<{ pseudo: string; playerClass: string } | null>(null)

  // Navigation
  const [currentPage, setCurrentPage] = useState<Page>('calendar')
  // Pseudo dont on consulte le profil de dispos (null = propre profil)
  const [availabilityViewPseudo, setAvailabilityViewPseudo] = useState<string | null>(null)

  // Événements planifiés
  const [createModalDate, setCreateModalDate] = useState<string | null>(null)
  const [createModalPrefill, setCreateModalPrefill] = useState<EventPrefill | undefined>(undefined)
  const [pendingConvertWishId, setPendingConvertWishId] = useState<string | null>(null)
  const [detailEvent, setDetailEvent] = useState<GuildEventWithParticipants | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Envies
  const [showCreateWishModal, setShowCreateWishModal] = useState(false)
  const [detailWishId, setDetailWishId] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')

  const {
    events,
    allParticipants,
    myParticipatedIds,
    loading,
    error,
    createEvent,
    deleteEvent,
    updateEvent,
    fetchEventWithParticipants,
    joinEvent,
    leaveEvent,
  } = useEvents(pseudo)

  const { wishes, wishAvailabilities, createWish, convertWish, deleteWish } = useWishes()
  const {
    invitations,
    pendingCount: pendingInvitations,
    sendInvitations,
    respondToInvitation,
  } = useInvitations(pseudo || null)

  const filteredEvents = searchQuery.trim()
    ? events.filter((e) => {
        const q = searchQuery.trim().toLowerCase()
        if (e.dungeon_name.toLowerCase().includes(q)) return true
        if (e.creator_pseudo.toLowerCase().includes(q)) return true
        return allParticipants.some((p) => p.event_id === e.id && p.pseudo.toLowerCase().includes(q))
      })
    : events

  const { toasts, addToast, dismissToast } = useToast()

  // Toast à la (re)connexion si invitations en attente
  const prevPseudo = useRef('')
  useEffect(() => {
    if (pseudo && prevPseudo.current === '' && pendingInvitations > 0) {
      addToast(
        `Tu as ${pendingInvitations} invitation${pendingInvitations > 1 ? 's' : ''} en attente !`,
        'info'
      )
    }
    prevPseudo.current = pseudo
  }, [pseudo, pendingInvitations]) // eslint-disable-line

  const applyProfile = (newPseudo: string, newClass: string) => {
    setPseudo(newPseudo)
    setPlayerClass(newClass)
    localStorage.setItem(PSEUDO_KEY, newPseudo)
    if (newClass) localStorage.setItem(CLASS_KEY, newClass)
    else localStorage.removeItem(CLASS_KEY)
  }

  const handleSetPseudo = (newPseudo: string, newClass: string) => {
    if (newPseudo === ADMIN_PSEUDO && import.meta.env.VITE_ADMIN_PASSWORD) {
      setPendingAdmin({ pseudo: newPseudo, playerClass: newClass })
      setShowPseudoSetup(false)
      setShowAdminModal(true)
    } else {
      applyProfile(newPseudo, newClass)
      setIsAdmin(false)
      sessionStorage.removeItem(ADMIN_SESSION_KEY)
      setShowPseudoSetup(false)
    }
  }

  const handleAdminSuccess = () => {
    if (!pendingAdmin) return
    applyProfile(pendingAdmin.pseudo, pendingAdmin.playerClass)
    setIsAdmin(true)
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
    setPendingAdmin(null)
    setShowAdminModal(false)
  }

  const handleAdminCancel = () => {
    setPendingAdmin(null)
    setShowAdminModal(false)
    setShowPseudoSetup(true)
  }

  const handleDateClick = (dateStr: string) => {
    if (!pseudo) { setShowPseudoSetup(true); return }
    if (isAdmin) return
    setCreateModalPrefill(undefined)
    setCreateModalDate(dateStr)
  }

  const handleEventClick = async (eventId: string) => {
    const event = await fetchEventWithParticipants(eventId)
    if (event) setDetailEvent(event)
    else addToast('Impossible de charger l\'événement.', 'error')
  }

  const handleCreateEvent = async (data: CreateEventInput, invitedPseudos: string[]): Promise<boolean> => {
    const result = await createEvent(data)
    if (result) {
      addToast('Événement créé avec succès !', 'success')
      if (invitedPseudos.length > 0) {
        await sendInvitations(result.id, invitedPseudos)
      }
      if (pendingConvertWishId) {
        await convertWish(pendingConvertWishId, result.id)
        addToast('Envie convertie en événement !', 'success')
        setPendingConvertWishId(null)
      }
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

  const handleEditEvent = async (updates: UpdateEventInput): Promise<boolean> => {
    if (!detailEvent) return false
    const ok = await updateEvent(detailEvent.id, updates)
    if (ok) {
      addToast('Événement modifié.', 'success')
      setShowEditModal(false)
      const updated = await fetchEventWithParticipants(detailEvent.id)
      if (updated) setDetailEvent(updated)
      return true
    }
    addToast('Impossible de modifier l\'événement.', 'error')
    return false
  }

  // ── Envies ───────────────────────────────────────────────────────────────

  const handleCreateWish = async (data: CreateWishInput): Promise<boolean> => {
    const ok = await createWish(data)
    if (ok) addToast('Activité proposée !', 'success')
    else addToast('Erreur lors de la proposition.', 'error')
    return ok
  }

  const handleWishConvert = (prefill: EventPrefill, wishId: string) => {
    setDetailWishId(null)
    setPendingConvertWishId(wishId)
    setCreateModalPrefill(prefill)
    setCreateModalDate(prefill.date ?? new Date().toISOString())
  }

  const handleDeleteWish = async (wishId: string) => {
    const ok = await deleteWish(wishId)
    if (ok) {
      addToast('Envie supprimée.', 'success')
      setDetailWishId(null)
    } else {
      addToast('Impossible de supprimer l\'envie.', 'error')
    }
  }

  // ── Disponibilités ───────────────────────────────────────────────────────

  const handleViewProfile = (targetPseudo: string) => {
    setSearchQuery('')
    setAvailabilityViewPseudo(targetPseudo === pseudo ? null : targetPseudo)
    setCurrentPage('availabilities')
  }

  const handleNavigate = (page: Page) => {
    if (page === 'availabilities') {
      setAvailabilityViewPseudo(null)  // toujours son propre profil via navbar
    }
    setCurrentPage(page)
  }

  const availabilityTarget = availabilityViewPseudo ?? pseudo

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar
        pseudo={pseudo}
        playerClass={playerClass}
        isAdmin={isAdmin}
        pendingInvitations={pendingInvitations}
        onChangePseudo={() => setShowPseudoSetup(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      <main className={currentPage === 'guide' ? '' : 'container mx-auto px-4 py-6 max-w-6xl'}>
        {currentPage === 'guide' ? (
          <GuidePage />
        ) : currentPage === 'stats' ? (
          <StatsPage onBack={() => setCurrentPage('calendar')} />
        ) : currentPage === 'availabilities' ? (
          <AvailabilityPage
            targetPseudo={availabilityTarget}
            isOwnProfile={!availabilityViewPseudo}
            currentClass={playerClass || undefined}
            onBack={() => setCurrentPage('calendar')}
            onEventClick={async (eventId) => {
              const event = await fetchEventWithParticipants(eventId)
              if (event) setDetailEvent(event)
            }}
            invitations={invitations}
            onRespondToInvitation={respondToInvitation}
          />
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
                onViewProfile={handleViewProfile}
              />
            ) : (
              <>
                <WishesPanel
                  wishes={wishes}
                  wishAvailabilities={wishAvailabilities}
                  currentPseudo={pseudo}
                  isAdmin={isAdmin}
                  onOpenWish={(id) => setDetailWishId(id)}
                  onCreateWish={() => {
                    if (!pseudo) { setShowPseudoSetup(true); return }
                    setShowCreateWishModal(true)
                  }}
                />
                <CalendarView
                  events={events}
                  currentPseudo={pseudo}
                  myParticipatedIds={myParticipatedIds}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* Bouton flottant (mobile) */}
      {pseudo && !isAdmin && currentPage === 'calendar' && (
        <button
          onClick={() => { setCreateModalPrefill(undefined); setCreateModalDate(new Date().toISOString()) }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-full shadow-xl transition-colors text-sm"
        >
          + Proposer un événement
        </button>
      )}

      {/* ── Modals ── */}

      {showPseudoSetup && (
        <PseudoSetup onSetPseudo={handleSetPseudo} currentPseudo={pseudo} currentClass={playerClass} />
      )}

      {createModalDate !== null && (
        <CreateEventModal
          initialDate={createModalDate}
          prefill={createModalPrefill}
          creatorPseudo={pseudo}
          creatorClass={playerClass}
          onSubmit={handleCreateEvent}
          onClose={() => {
            setCreateModalDate(null)
            setCreateModalPrefill(undefined)
            setPendingConvertWishId(null)
          }}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          currentPseudo={pseudo}
          isAdmin={isAdmin}
          onJoin={handleJoin}
          onLeave={handleLeave}
          onDelete={handleDelete}
          onEdit={() => setShowEditModal(true)}
          onClose={() => { setDetailEvent(null); setShowEditModal(false) }}
        />
      )}

      {detailEvent && showEditModal && (
        <EditEventModal
          event={detailEvent}
          onSubmit={handleEditEvent}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showAdminModal && (
        <AdminPasswordModal
          onSuccess={handleAdminSuccess}
          onCancel={handleAdminCancel}
        />
      )}

      {showCreateWishModal && (
        <CreateWishModal
          creatorPseudo={pseudo}
          creatorClass={playerClass || null}
          onSubmit={handleCreateWish}
          onClose={() => setShowCreateWishModal(false)}
        />
      )}

      {detailWishId && (
        <WishDetailModal
          wishId={detailWishId}
          currentPseudo={pseudo}
          playerClass={playerClass || null}
          isAdmin={isAdmin}
          onConvert={handleWishConvert}
          onDelete={handleDeleteWish}
          onClose={() => setDetailWishId(null)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default App
