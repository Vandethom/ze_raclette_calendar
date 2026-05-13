import { useState, useEffect, useCallback } from 'react'
import { X, Users, Calendar, Zap, CheckCircle2, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { WishWithAvailabilities, WishAvailability, WishSlotPeriod, EventPrefill } from '../types'

interface Props {
  wishId: string
  currentPseudo: string
  playerClass?: string | null
  isAdmin?: boolean
  onConvert: (prefill: EventPrefill, wishId: string) => void
  onDelete: (wishId: string) => void
  onClose: () => void
}

const PERIODS: WishSlotPeriod[] = ['afternoon', 'evening', 'night']

const PERIOD_CONFIG: Record<WishSlotPeriod, { label: string; time: string; icon: string; startTime: string; endTime: string }> = {
  afternoon: { label: 'Après-midi', time: '14h–18h', icon: '🌤', startTime: '14:00', endTime: '18:00' },
  evening:   { label: 'Soirée',     time: '18h–22h', icon: '🌆', startTime: '18:00', endTime: '22:00' },
  night:     { label: 'Nuit',       time: '22h–00h', icon: '🌙', startTime: '22:00', endTime: '23:59' },
}

function getNext14Days(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toLocaleDateString('sv')
  })
}

function formatDayHeader(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`)
  const short = d.toLocaleDateString('fr-FR', { weekday: 'short' })
  const num = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' })
  return {
    short: short.charAt(0).toUpperCase() + short.slice(1, 3),
    num,
  }
}

export function WishDetailModal({ wishId, currentPseudo, playerClass, isAdmin, onConvert, onDelete, onClose }: Props) {
  const [wish, setWish] = useState<WishWithAvailabilities | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const days = getNext14Days()

  const fetchWish = useCallback(async () => {
    const [wishRes, availRes] = await Promise.all([
      supabase.from('wishes').select('*').eq('id', wishId).single(),
      supabase.from('wish_availabilities').select('*').eq('wish_id', wishId),
    ])
    if (wishRes.data) {
      setWish({ ...wishRes.data as WishWithAvailabilities, availabilities: (availRes.data ?? []) as WishAvailability[] })
    }
    setLoading(false)
  }, [wishId])

  async function handleToggle(slotDate: string, slotPeriod: WishSlotPeriod) {
    if (!currentPseudo || !wish) return
    const key = `${slotDate}-${slotPeriod}`
    setToggling(key)

    const existing = wish.availabilities.find(
      (a) => a.pseudo === currentPseudo && a.slot_date === slotDate && a.slot_period === slotPeriod
    )

    if (existing) {
      await supabase.from('wish_availabilities').delete().eq('id', existing.id)
    } else {
      await supabase.from('wish_availabilities').insert({
        wish_id: wishId,
        pseudo: currentPseudo,
        player_class: playerClass ?? null,
        slot_date: slotDate,
        slot_period: slotPeriod,
      })
    }

    await fetchWish()
    setToggling(null)
  }

  function handleConvert(slotDate: string, slotPeriod: WishSlotPeriod) {
    if (!wish) return
    const config = PERIOD_CONFIG[slotPeriod]
    onConvert(
      {
        activityName: wish.activity_name,
        date: slotDate,
        startTime: config.startTime,
        endTime: config.endTime,
      },
      wishId
    )
  }

  useEffect(() => {
    fetchWish()

    const channel = supabase
      .channel(`wish-detail-${wishId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wish_availabilities' }, fetchWish)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, fetchWish)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [wishId, fetchWish])

  if (loading || !wish) {
    return (
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
      </div>
    )
  }

  const isCreator = wish.creator_pseudo === currentPseudo
  const canDelete = isCreator || isAdmin

  // Créneaux ayant atteint le seuil
  const bestSlots: Array<{ date: string; period: WishSlotPeriod; players: WishAvailability[] }> = []
  for (const date of days) {
    for (const period of PERIODS) {
      const players = wish.availabilities.filter(
        (a) => a.slot_date === date && a.slot_period === period
      )
      if (players.length >= wish.required_players) {
        bestSlots.push({ date, period, players })
      }
    }
  }

  const uniqueInterested = new Set(wish.availabilities.map((a) => a.pseudo)).size

  const formatDeadline = (d: string) =>
    new Date(`${d}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

  // Wish convertie par quelqu'un d'autre en temps réel
  if (wish.status === 'converted') {
    return (
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#161b22] border border-amber-500/40 rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-white font-bold text-lg mb-2">Activité planifiée !</h2>
          <p className="text-gray-400 text-sm mb-6">
            « {wish.activity_name} » a été ajoutée au calendrier.
          </p>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-lg transition-colors"
          >
            Voir le calendrier
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-4xl my-4 shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#30363d]">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{wish.activity_name}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-400">
              <span>
                Proposé par{' '}
                <span className="text-amber-400">{wish.creator_pseudo}</span>
              </span>
              {wish.creator_class && (
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full">
                  {wish.creator_class}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users size={12} />
                {wish.required_players} joueurs requis
              </span>
              {wish.deadline && (
                <span className="flex items-center gap-1 text-orange-400">
                  <Calendar size={12} />
                  Avant le {formatDeadline(wish.deadline)}
                </span>
              )}
            </div>
            {wish.description && (
              <p className="mt-2 text-sm text-gray-500 italic">{wish.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors ml-4 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 bg-[#0d1117]/40 border-b border-[#30363d]">
          <p className="text-sm text-gray-400">
            {currentPseudo
              ? <>
                  Clique sur les cases pour indiquer tes disponibilités en tant que{' '}
                  <span className="text-amber-400 font-medium">{currentPseudo}</span>.
                  {' '}Quand assez de joueurs coïncident, l'organisateur peut planifier l'événement.
                </>
              : 'Connecte-toi pour indiquer tes disponibilités.'}
          </p>
        </div>

        {/* Grille Doodle */}
        <div className="p-4 overflow-x-auto">
          <table className="min-w-max w-full">
            <thead>
              <tr>
                <th className="w-32 pr-4" />
                {days.map((day) => {
                  const { short, num } = formatDayHeader(day)
                  const isToday = day === new Date().toLocaleDateString('sv')
                  return (
                    <th
                      key={day}
                      className={`text-center px-1 pb-2 min-w-[3.5rem] ${isToday ? 'text-amber-400' : 'text-gray-500'}`}
                    >
                      <div className="text-xs font-medium">{short}</div>
                      <div className={`text-xs ${isToday ? 'bg-amber-500/20 rounded px-1' : ''}`}>{num}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => {
                const config = PERIOD_CONFIG[period]
                return (
                  <tr key={period}>
                    <td className="pr-4 py-1 whitespace-nowrap align-middle">
                      <div className="text-gray-300 text-xs font-medium">
                        {config.icon} {config.label}
                      </div>
                      <div className="text-gray-600 text-xs">{config.time}</div>
                    </td>
                    {days.map((day) => {
                      const key = `${day}-${period}`
                      const cellPlayers = wish.availabilities.filter(
                        (a) => a.slot_date === day && a.slot_period === period
                      )
                      const isMine = cellPlayers.some((a) => a.pseudo === currentPseudo)
                      const count = cellPlayers.length
                      const isFull = count >= wish.required_players
                      const isToggling = toggling === key

                      let cls =
                        'relative w-14 h-11 rounded-lg border transition-all text-xs font-semibold flex items-center justify-center '
                      if (!currentPseudo) {
                        cls += 'cursor-default '
                      } else {
                        cls += 'cursor-pointer '
                      }

                      if (isFull) {
                        cls += 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_6px_rgba(251,191,36,0.25)] hover:bg-amber-500/35 '
                      } else if (isMine && count > 1) {
                        cls += 'bg-amber-500/20 border-amber-500/60 text-amber-300 hover:bg-amber-500/30 '
                      } else if (isMine) {
                        cls += 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30 '
                      } else if (count > 0) {
                        cls += 'bg-blue-900/25 border-blue-600/40 text-blue-300 hover:bg-blue-900/35 '
                      } else {
                        cls += 'bg-[#0d1117] border-[#30363d] text-gray-700 hover:border-[#484f58] hover:text-gray-500 '
                      }

                      const tooltipNames = cellPlayers.map((a) => a.pseudo).join(', ')

                      return (
                        <td key={day} className="px-0.5 py-1">
                          <button
                            className={cls}
                            onClick={() => currentPseudo && handleToggle(day, period)}
                            disabled={isToggling || !currentPseudo}
                            title={tooltipNames || 'Aucun joueur'}
                          >
                            {isToggling ? (
                              <div className="w-3 h-3 border border-amber-400/50 border-t-amber-400 rounded-full animate-spin" />
                            ) : (
                              <>
                                {isFull && (
                                  <span className="absolute -top-1.5 -right-1 text-[10px]">⭐</span>
                                )}
                                {count > 0 ? (
                                  <span>{count}</span>
                                ) : (
                                  <span className="text-[10px] opacity-40">+</span>
                                )}
                                {isMine && (
                                  <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                )}
                              </>
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Légende */}
        <div className="px-6 pb-3 flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/50 inline-block" />
            Moi
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-900/25 border border-blue-600/40 inline-block" />
            Autres joueurs
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/25 border border-amber-400 inline-block" />
            ⭐ Seuil atteint — prêt à planifier !
          </span>
          <span className="text-gray-600">· Survole une case pour voir les noms</span>
        </div>

        {/* Créneaux prêts à planifier */}
        {bestSlots.length > 0 && (
          <div className="mx-6 mb-4 p-4 border border-amber-500/30 bg-amber-500/5 rounded-xl">
            <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
              <Zap size={14} />
              {bestSlots.length === 1
                ? 'Un créneau est prêt !'
                : `${bestSlots.length} créneaux sont prêts !`}
            </h3>
            <div className="flex flex-wrap gap-2">
              {bestSlots.map(({ date, period, players }) => {
                const config = PERIOD_CONFIG[period]
                const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
                return (
                  <div
                    key={`${date}-${period}`}
                    className="flex items-center gap-3 bg-[#161b22] border border-amber-500/30 rounded-lg px-3 py-2"
                  >
                    <span className="text-base">{config.icon}</span>
                    <div>
                      <div className="text-white text-xs font-medium capitalize">{dateLabel}</div>
                      <div className="text-amber-400/80 text-xs">
                        {config.label} {config.time} ·{' '}
                        <span className="text-white">{players.length}</span> joueurs (
                        {players.map((p) => p.pseudo).join(', ')})
                      </div>
                    </div>
                    {(isCreator || isAdmin) ? (
                      <button
                        onClick={() => handleConvert(date, period)}
                        className="ml-1 flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <CheckCircle2 size={12} />
                        Planifier
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
            {!isCreator && !isAdmin && (
              <p className="text-xs text-gray-600 mt-2">
                Seul le créateur peut planifier l'événement à partir de cette envie.
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#30363d] flex items-center justify-between">
          <div className="text-xs text-gray-600">
            {uniqueInterested > 0
              ? `${uniqueInterested} joueur${uniqueInterested > 1 ? 's ont' : ' a'} indiqué ${uniqueInterested > 1 ? 'leurs' : 'sa'} disponibilité${uniqueInterested > 1 ? 's' : ''}`
              : 'Sois le premier à indiquer ta disponibilité !'}
          </div>
          {canDelete && (
            <button
              onClick={() => onDelete(wishId)}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs transition-colors"
            >
              <Trash2 size={13} />
              Supprimer cette envie
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
