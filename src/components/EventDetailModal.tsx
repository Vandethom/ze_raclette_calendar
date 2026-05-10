import { useState } from 'react'
import { X, Sword, Calendar, Clock, Users, Star, UserPlus, UserMinus, Trash2, FileText, Shield, CalendarRange, Pencil, ShieldAlert } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { GuildEventWithParticipants } from '../types'
import { ROLES } from '../lib/roles'

interface Props {
  event: GuildEventWithParticipants
  currentPseudo: string
  isAdmin?: boolean
  onJoin: (role: string | null) => Promise<void>
  onLeave: () => Promise<void>
  onDelete: () => Promise<void>
  onEdit?: () => void
  onClose: () => void
}

export function EventDetailModal({ event, currentPseudo, isAdmin, onJoin, onLeave, onDelete, onEdit, onClose }: Props) {
  const [loading, setLoading] = useState<'join' | 'leave' | 'delete' | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [joinRole, setJoinRole] = useState('')
  const [joinCustomRole, setJoinCustomRole] = useState('')

  const effectiveJoinRole = joinRole === '__custom__' ? joinCustomRole.trim() : joinRole

  const isCreator = event.creator_pseudo === currentPseudo
  const hasJoined = event.participants.some((p) => p.pseudo === currentPseudo)
  const totalCount = event.participants.length + 1
  const isFull = event.max_participants !== null && totalCount >= event.max_participants

  const dateStart = new Date(event.date_start)
  const dateEnd = new Date(event.date_end)
  const isMultiDay = event.date_start.slice(0, 10) !== event.date_end.slice(0, 10)

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const withLoading = async (key: typeof loading, fn: () => Promise<void>) => {
    setLoading(key)
    await fn()
    setLoading(null)
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#30363d]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sword className="text-amber-400 flex-shrink-0" size={20} />
              {event.dungeon_name}
            </h2>
            {event.level && (
              <span className="text-xs text-amber-400/70 ml-7">Niveau {event.level}</span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors mt-0.5">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Organisateur + rôle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Organisé par{' '}
              <span className="text-amber-400 font-semibold">{event.creator_pseudo}</span>
            </p>
            {event.creator_role && (
              <span className="flex items-center gap-1 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-full">
                <Shield size={11} />
                {event.creator_role}
              </span>
            )}
          </div>

          {/* Date & heure */}
          <div className="bg-[#0d1117] rounded-xl p-4 space-y-2">
            {isMultiDay ? (
              <div className="flex items-start gap-2 text-sm">
                <CalendarRange size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">
                  Du{' '}
                  <span className="font-medium">
                    {capitalize(format(dateStart, 'EEEE dd MMMM', { locale: fr }))}
                  </span>
                  {' '}au{' '}
                  <span className="font-medium">
                    {capitalize(format(dateEnd, 'EEEE dd MMMM yyyy', { locale: fr }))}
                  </span>
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-amber-400 flex-shrink-0" />
                  <span className="text-white">
                    {capitalize(format(dateStart, 'EEEE dd MMMM yyyy', { locale: fr }))}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-amber-400 flex-shrink-0" />
                  <span className="text-white">
                    {format(dateStart, 'HH:mm')} – {format(dateEnd, 'HH:mm')}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                <Users size={14} className="text-amber-400" />
                Participants
              </span>
              <span className={`text-sm font-semibold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                {totalCount}
                {event.max_participants ? `/${event.max_participants}` : ''}
                {isFull ? ' · Complet' : event.max_participants ? ` · ${event.max_participants - totalCount} place(s)` : ''}
              </span>
            </div>

            {event.max_participants && (
              <div className="w-full h-1.5 bg-[#30363d] rounded-full mb-3">
                <div
                  className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, (totalCount / event.max_participants) * 100)}%` }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              {/* Créateur */}
              <div className="flex items-center gap-2 text-sm">
                <Star size={12} className="text-amber-400 flex-shrink-0" />
                <span className="text-white">{event.creator_pseudo}</span>
                {event.creator_class && (
                  <span className="text-[11px] text-amber-400/70 bg-amber-500/8 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                    {event.creator_class}
                  </span>
                )}
                {event.creator_role && (
                  <span className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                    {event.creator_role}
                  </span>
                )}
                <span className="ml-auto text-[11px] text-amber-400/60">Organisateur</span>
              </div>
              {/* Participants */}
              {event.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.pseudo === currentPseudo ? 'bg-blue-400' : 'bg-gray-500'}`} />
                  <span className="text-white">{p.pseudo}</span>
                  {p.player_class && (
                    <span className="text-[11px] text-gray-500 bg-[#0d1117] border border-[#30363d] px-1.5 py-0.5 rounded-full">
                      {p.player_class}
                    </span>
                  )}
                  {p.role && (
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full border ${p.pseudo === currentPseudo ? 'text-blue-300 bg-blue-500/10 border-blue-500/20' : 'text-gray-400 bg-[#0d1117] border-[#30363d]'}`}>
                      {p.role}
                    </span>
                  )}
                  {p.pseudo === currentPseudo && (
                    <span className="ml-auto text-[11px] text-blue-400/60">Toi</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="bg-[#0d1117] rounded-xl p-3 text-sm text-gray-300 flex gap-2">
              <FileText size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{event.description}</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-1">

            {/* ── Mode admin ── */}
            {isAdmin && (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs text-amber-400/70">
                  <ShieldAlert size={12} /> Actions administrateur
                </p>
                {!confirmDelete ? (
                  <div className="flex gap-2">
                    <button
                      onClick={onEdit}
                      className="flex-1 flex items-center justify-center gap-2 border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 py-2.5 rounded-lg transition-colors text-sm"
                    >
                      <Pencil size={14} /> Modifier
                    </button>
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex-1 flex items-center justify-center gap-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 py-2.5 rounded-lg transition-colors text-sm"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => withLoading('delete', onDelete)}
                      disabled={loading !== null}
                      className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                    >
                      {loading === 'delete' ? 'Suppression…' : 'Confirmer la suppression'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="border border-[#30363d] text-gray-400 hover:text-white px-3 py-2.5 rounded-lg transition-colors text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Mode membre normal ── */}
            {!isAdmin && (
              <>
                {/* Sélecteur de rôle + rejoindre */}
                {!isCreator && !hasJoined && !isFull && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                        <Shield size={11} className="text-amber-400" />
                        Ton rôle <span className="text-gray-600 font-normal">(optionnel)</span>
                      </label>
                      <select
                        value={joinRole}
                        onChange={(e) => { setJoinRole(e.target.value); setJoinCustomRole('') }}
                        className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-400 rounded-lg px-3 py-2 text-white text-sm focus:outline-none transition-colors appearance-none"
                      >
                        <option value="">— Aucun rôle —</option>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        <option value="__custom__">Autre (préciser)</option>
                      </select>
                      {joinRole === '__custom__' && (
                        <input
                          type="text"
                          value={joinCustomRole}
                          onChange={(e) => setJoinCustomRole(e.target.value)}
                          placeholder="Ton rôle…"
                          className="w-full mt-1.5 bg-[#0d1117] border border-[#30363d] focus:border-amber-400 rounded-lg px-3 py-2 text-white text-sm focus:outline-none transition-colors"
                          maxLength={30}
                        />
                      )}
                    </div>
                    <button
                      onClick={() => withLoading('join', () => onJoin(effectiveJoinRole || null))}
                      disabled={loading !== null}
                      className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <UserPlus size={15} />
                      {loading === 'join' ? 'Inscription…' : 'Rejoindre'}
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  {!isCreator && hasJoined && (
                    <button
                      onClick={() => withLoading('leave', onLeave)}
                      disabled={loading !== null}
                      className="flex-1 border border-red-500/50 text-red-400 hover:bg-red-500/10 disabled:opacity-50 py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <UserMinus size={15} />
                      {loading === 'leave' ? 'Désinscription…' : 'Quitter'}
                    </button>
                  )}

                  {!isCreator && isFull && !hasJoined && (
                    <div className="flex-1 text-center text-sm text-gray-500 py-2.5">
                      Événement complet
                    </div>
                  )}

                  {isCreator && !confirmDelete && (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="border border-[#30363d] text-gray-500 hover:text-red-400 hover:border-red-500/40 p-2.5 rounded-lg transition-colors"
                      title="Supprimer l'événement"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  {isCreator && confirmDelete && (
                    <div className="flex gap-2 flex-1">
                      <button
                        onClick={() => withLoading('delete', onDelete)}
                        disabled={loading !== null}
                        className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                      >
                        {loading === 'delete' ? 'Suppression…' : 'Confirmer la suppression'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="border border-[#30363d] text-gray-400 hover:text-white px-3 py-2.5 rounded-lg transition-colors text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
