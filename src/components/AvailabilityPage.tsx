import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, CalendarCheck, FileText, Check, Loader2, Sword, Mail, CheckCircle2, XCircle, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import { useAvailability } from '../hooks/useAvailability'
import type { WeeklyAvailability, GuildEvent, EventInvitationWithEvent } from '../types'

interface Props {
  targetPseudo: string
  isOwnProfile: boolean
  currentClass?: string
  onBack: () => void
  onEventClick?: (eventId: string) => void
  invitations?: EventInvitationWithEvent[]
  onRespondToInvitation?: (invId: string, status: 'accepted' | 'declined', eventId: string, playerClass: string | null) => Promise<boolean>
}

type ProfileTab = 'availability' | 'events'

const MIN_HOUR = 8
const MAX_HOUR = 23
const HOURS = Array.from({ length: MAX_HOUR - MIN_HOUR + 1 }, (_, i) => i + MIN_HOUR)

const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const DAYS_FULL  = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// Transforme une liste d'heures en plages lisibles : [18,19,20] → "18h–21h"
function groupToRanges(hours: number[]): string {
  if (!hours.length) return ''
  const sorted = [...hours].sort((a, b) => a - b)
  const ranges: string[] = []
  let start = sorted[0]
  let prev  = sorted[0]
  for (let i = 1; i <= sorted.length; i++) {
    if (i === sorted.length || sorted[i] !== prev + 1) {
      ranges.push(prev === start ? `${start}h` : `${start}h–${prev + 1}h`)
      if (i < sorted.length) { start = sorted[i]; prev = sorted[i] }
    } else {
      prev = sorted[i]
    }
  }
  return ranges.join(', ')
}

function buildSummary(slots: WeeklyAvailability[]): string {
  const lines = DAYS_FULL.map((day, i) => {
    const hours = slots.filter((s) => s.day_of_week === i).map((s) => s.hour)
    if (!hours.length) return null
    return `${day} : ${groupToRanges(hours)}`
  }).filter(Boolean) as string[]
  return lines.length ? lines.join('  ·  ') : 'Aucune disponibilité renseignée.'
}

// Classes CSS d'une cellule selon son état et ses voisins
function cellClass(
  isActive: boolean,
  aboveActive: boolean,
  belowActive: boolean,
  isWeekend: boolean,
  isOwnProfile: boolean
): string {
  const base = 'h-7 w-full transition-colors select-none '
  const cursor = isOwnProfile ? 'cursor-pointer ' : 'cursor-default '

  if (!isActive) {
    const hover = isOwnProfile ? 'hover:bg-[#1c2532] ' : ''
    return base + cursor + hover + 'bg-[#0d1117] '
  }

  const bg = isWeekend ? 'bg-amber-500/35 ' : 'bg-amber-500/22 '
  const hover = isOwnProfile ? (isWeekend ? 'hover:bg-amber-500/45 ' : 'hover:bg-amber-500/32 ') : ''

  // Coins arrondis selon continuité verticale
  let rounding = ''
  if (!aboveActive && !belowActive) rounding = 'rounded '
  else if (!aboveActive)            rounding = 'rounded-t '
  else if (!belowActive)            rounding = 'rounded-b '

  return base + cursor + bg + hover + rounding
}

export function AvailabilityPage({
  targetPseudo, isOwnProfile, currentClass, onBack, onEventClick,
  invitations = [], onRespondToInvitation,
}: Props) {
  const { profile, slots, loading, saveProfile, toggleSlot } = useAvailability(targetPseudo)

  const [activeTab, setActiveTab] = useState<ProfileTab>('availability')
  const [note, setNote] = useState('')
  const [noteChanged, setNoteChanged] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [togglingKey, setTogglingKey] = useState<string | null>(null)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  // Upcoming events (created + joined)
  const [myEvents, setMyEvents] = useState<(GuildEvent & { myRole: 'organisateur' | 'participant' })[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)

  const fetchMyEvents = useCallback(async () => {
    if (!isOwnProfile) return
    setEventsLoading(true)
    const now = new Date().toISOString()

    const [createdRes, partRes] = await Promise.all([
      supabase.from('events').select('*').eq('creator_pseudo', targetPseudo).gte('date_end', now).order('date_start'),
      supabase.from('participants').select('event_id').eq('pseudo', targetPseudo),
    ])

    const participantIds = (partRes.data ?? []).map((r: { event_id: string }) => r.event_id)
    let joinedEvents: GuildEvent[] = []
    if (participantIds.length > 0) {
      const { data } = await supabase.from('events').select('*').in('id', participantIds).gte('date_end', now).order('date_start')
      joinedEvents = (data ?? []) as GuildEvent[]
    }

    const created = ((createdRes.data ?? []) as GuildEvent[]).map(e => ({ ...e, myRole: 'organisateur' as const }))
    const joined = joinedEvents
      .filter(e => !created.some(c => c.id === e.id))
      .map(e => ({ ...e, myRole: 'participant' as const }))
    const merged = [...created, ...joined].sort((a, b) => a.date_start.localeCompare(b.date_start))
    setMyEvents(merged)
    setEventsLoading(false)
  }, [targetPseudo, isOwnProfile])

  useEffect(() => {
    if (activeTab === 'events') fetchMyEvents()
  }, [activeTab, fetchMyEvents])

  // Sync de la note depuis le profil chargé
  useEffect(() => {
    setNote(profile?.availability_note ?? '')
    setNoteChanged(false)
  }, [profile])

  // Création / sync du profil à la première visite
  const initialized = useRef(false)
  useEffect(() => {
    if (isOwnProfile && !loading && !initialized.current) {
      initialized.current = true
      if (profile === null) {
        saveProfile(currentClass ?? null, null)
      } else if (profile.player_class !== (currentClass ?? null)) {
        saveProfile(currentClass ?? null, profile.availability_note)
      }
    }
  }, [isOwnProfile, loading, profile]) // eslint-disable-line

  const handleToggle = async (dayOfWeek: number, hour: number) => {
    if (!isOwnProfile) return
    const key = `${dayOfWeek}-${hour}`
    setTogglingKey(key)
    await toggleSlot(dayOfWeek, hour)
    setTogglingKey(null)
  }

  const handleSaveNote = async () => {
    setSavingNote(true)
    await saveProfile(currentClass ?? null, note.trim() || null)
    setSavingNote(false)
    setNoteChanged(false)
  }

  const totalSlots = slots.length
  const summary    = buildSummary(slots)

  const inputClass =
    'w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-400 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none transition-colors text-sm resize-none'

  const pendingInvitations = invitations.filter((i: EventInvitationWithEvent) => i.status === 'pending')

  const handleRespond = async (inv: EventInvitationWithEvent, status: 'accepted' | 'declined') => {
    if (!onRespondToInvitation) return
    setRespondingId(inv.id)
    await onRespondToInvitation(inv.id, status, inv.event_id, currentClass ?? null)
    if (status === 'accepted') fetchMyEvents()
    setRespondingId(null)
  }

  const formatEventDate = (event: GuildEvent) => {
    const start = new Date(event.date_start)
    const end = new Date(event.date_end)
    const sameDay = start.toLocaleDateString('sv') === end.toLocaleDateString('sv')
    if (sameDay) {
      return `${format(start, 'EEE dd MMM', { locale: fr })} · ${format(start, 'HH:mm')}–${format(end, 'HH:mm')}`
    }
    return `${format(start, 'dd MMM', { locale: fr })} → ${format(end, 'dd MMM yyyy', { locale: fr })}`
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Retour</span>
          </button>
          <div className="w-px h-5 bg-[#30363d]" />
          <div className="flex items-center gap-2">
            <CalendarCheck size={18} className="text-amber-400" />
            <h1 className="text-white font-bold text-lg">
              {isOwnProfile ? 'Mon profil' : `Profil de ${targetPseudo}`}
            </h1>
          </div>
        </div>

        {(profile?.player_class || currentClass) && (
          <span className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/20">
            {profile?.player_class ?? currentClass}
          </span>
        )}
      </div>

      {/* Onglets (uniquement sur son propre profil) */}
      {isOwnProfile && (
        <div className="flex gap-1 mb-6 bg-[#0d1117] border border-[#30363d] rounded-xl p-1">
          <button
            onClick={() => setActiveTab('availability')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'availability'
                ? 'bg-[#161b22] text-amber-400 border border-[#30363d]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <CalendarCheck size={14} />
            Disponibilités
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'events'
                ? 'bg-[#161b22] text-amber-400 border border-[#30363d]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Sword size={14} />
            Mes événements
            {pendingInvitations.length > 0 && (
              <span className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {pendingInvitations.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── Onglet "Mes événements" ── */}
      {activeTab === 'events' && isOwnProfile && (
        <div className="space-y-6">

          {/* Invitations */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={15} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Invitations reçues</h2>
            </div>

            {invitations.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-4">Aucune invitation pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {[...invitations].sort((a, b) => {
                  const order = { pending: 0, accepted: 1, declined: 2 }
                  return order[a.status] - order[b.status]
                }).map((inv) => (
                  <div key={inv.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                    inv.status === 'pending' ? 'border-amber-500/30 bg-amber-500/5' : 'border-[#30363d] bg-[#0d1117]/50'
                  }`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{inv.events.dungeon_name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{formatEventDate(inv.events)}</p>
                      <p className="text-gray-600 text-xs">par {inv.events.creator_pseudo}</p>
                    </div>
                    {inv.status === 'pending' ? (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleRespond(inv, 'accepted')}
                          disabled={respondingId === inv.id}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          {respondingId === inv.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                          Accepter
                        </button>
                        <button
                          onClick={() => handleRespond(inv, 'declined')}
                          disabled={respondingId === inv.id}
                          className="flex items-center gap-1 border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <XCircle size={11} />
                          Refuser
                        </button>
                      </div>
                    ) : (
                      <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full border ${
                        inv.status === 'accepted'
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : 'text-gray-600 bg-[#0d1117] border-[#30363d]'
                      }`}>
                        {inv.status === 'accepted' ? '✓ Accepté' : '✗ Refusé'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prochains événements */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={15} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Prochains événements</h2>
            </div>

            {eventsLoading ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-4 justify-center">
                <Loader2 size={14} className="animate-spin" /> Chargement…
              </div>
            ) : myEvents.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-4">Aucun événement à venir.</p>
            ) : (
              <div className="space-y-2">
                {myEvents.map(e => (
                  <button
                    key={e.id}
                    onClick={() => onEventClick?.(e.id)}
                    disabled={!onEventClick}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#30363d] bg-[#0d1117]/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-colors text-left disabled:cursor-default disabled:hover:border-[#30363d] disabled:hover:bg-[#0d1117]/50"
                  >
                    <Sword size={14} className="text-amber-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{e.dungeon_name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{formatEventDate(e)}</p>
                    </div>
                    <span className={`flex-shrink-0 text-[11px] px-2 py-0.5 rounded-full border ${
                      e.myRole === 'organisateur'
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        : 'text-gray-400 bg-[#0d1117] border-[#30363d]'
                    }`}>
                      {e.myRole}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Onglet "Disponibilités" ── */}
      {(activeTab === 'availability' || !isOwnProfile) && (loading ? (
        <div className="flex items-center justify-center h-48 gap-3 text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Chargement…</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Note */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} className="text-amber-400" />
              <span className="text-sm font-medium text-gray-300">Note de disponibilité</span>
              {!isOwnProfile && !profile?.availability_note && (
                <span className="text-xs text-gray-600">(non renseignée)</span>
              )}
            </div>
            {isOwnProfile ? (
              <div className="space-y-3">
                <textarea
                  value={note}
                  onChange={(e) => { setNote(e.target.value); setNoteChanged(true) }}
                  placeholder="Ex : Dispo les soirs semaine après 19h, week-end variable. Ping sur Discord !"
                  rows={2}
                  className={inputClass}
                />
                {noteChanged && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-[#21262d] disabled:text-gray-600 text-black font-bold text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      {savingNote ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                {profile?.availability_note || 'Ce joueur n\'a pas laissé de note.'}
              </p>
            )}
          </div>

          {/* Grille heure par heure */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Grille hebdomadaire</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isOwnProfile
                    ? 'Clique sur un créneau pour le cocher ou le décocher.'
                    : 'Disponibilités habituelles (heure locale).'}
                </p>
              </div>
              {totalSlots > 0 && (
                <span className="text-xs text-amber-400/70 bg-amber-500/10 px-2.5 py-1 rounded-full">
                  {totalSlots}h cochée{totalSlots > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Conteneur scrollable */}
            <div className="overflow-x-auto">
              <div
                className="grid gap-px bg-[#30363d] rounded-lg overflow-hidden"
                style={{ gridTemplateColumns: '2.75rem repeat(7, minmax(2.5rem, 1fr))' }}
              >
                {/* En-tête : jours */}
                <div className="bg-[#161b22] h-8" />
                {DAYS_SHORT.map((day, i) => (
                  <div
                    key={day}
                    className={`bg-[#161b22] h-8 flex items-center justify-center text-xs font-medium ${
                      i >= 5 ? 'text-amber-400/80' : 'text-gray-400'
                    }`}
                  >
                    {day}
                  </div>
                ))}

                {/* Lignes d'heures */}
                {HOURS.map((hour) => (
                  <React.Fragment key={hour}>
                    {/* Étiquette heure */}
                    <div
                      className="bg-[#161b22] h-7 flex items-center justify-end pr-2 text-xs text-gray-600 font-mono"
                    >
                      {hour}h
                    </div>

                    {/* Cellules par jour */}
                    {Array.from({ length: 7 }, (_, d) => {
                      const key = `${d}-${hour}`
                      const isActive   = slots.some((s) => s.day_of_week === d && s.hour === hour)
                      const aboveActive = hour > MIN_HOUR && slots.some((s) => s.day_of_week === d && s.hour === hour - 1)
                      const belowActive = hour < MAX_HOUR && slots.some((s) => s.day_of_week === d && s.hour === hour + 1)
                      const isToggling = togglingKey === key
                      const isWeekend  = d >= 5

                      return (
                        <button
                          key={key}
                          onClick={() => handleToggle(d, hour)}
                          disabled={!isOwnProfile || !!isToggling}
                          title={
                            isOwnProfile
                              ? `${DAYS_FULL[d]} ${hour}h–${hour + 1}h`
                              : isActive
                                ? `${targetPseudo} disponible`
                                : ''
                          }
                          className={cellClass(isActive, aboveActive, belowActive, isWeekend, isOwnProfile)}
                        >
                          {isToggling && (
                            <div className="flex items-center justify-center h-full">
                              <Loader2 size={10} className="animate-spin text-amber-400/60" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Légende */}
            <div className="mt-4 pt-4 border-t border-[#30363d] flex flex-wrap gap-5 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-sm bg-amber-500/22 inline-block border border-amber-500/30" />
                Disponible (semaine)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-sm bg-amber-500/35 inline-block border border-amber-500/50" />
                Disponible (week-end)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-sm bg-[#0d1117] inline-block border border-[#30363d]" />
                Non renseigné
              </span>
            </div>
          </div>

          {/* Résumé textuel */}
          {totalSlots > 0 && (
            <div className="bg-[#0d1117]/50 border border-[#30363d] rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 font-medium mb-1.5">Résumé</p>
              <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
            </div>
          )}

          {totalSlots === 0 && !isOwnProfile && (
            <div className="text-center text-gray-600 py-10 text-sm bg-[#161b22] border border-[#30363d] rounded-xl">
              {targetPseudo} n'a pas encore renseigné ses disponibilités.
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
