import { useState } from 'react'
import { X, Sword, Calendar, Clock, Users, Star, FileText, Shield, CalendarRange } from 'lucide-react'
import type { CreateEventInput } from '../types'
import { ROLES } from '../lib/roles'

interface Props {
  initialDate?: string
  creatorPseudo: string
  creatorClass?: string
  onSubmit: (data: CreateEventInput) => Promise<boolean>
  onClose: () => void
}

export function CreateEventModal({ initialDate, creatorPseudo, creatorClass, onSubmit, onClose }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const initDate = initialDate?.slice(0, 10) ?? today

  const [dungeonName, setDungeonName] = useState('')
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [startDate, setStartDate] = useState(initDate)
  const [endDate, setEndDate] = useState(initDate)
  const [startTime, setStartTime] = useState(initialDate?.slice(11, 16) ?? '18:00')
  const [endTime, setEndTime] = useState('20:00')
  const [selectedRole, setSelectedRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [level, setLevel] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const effectiveRole = selectedRole === '__custom__' ? customRole.trim() : selectedRole

  const handleToggleMultiDay = (checked: boolean) => {
    setIsMultiDay(checked)
    if (!checked) setEndDate(startDate)
  }

  const handleStartDateChange = (val: string) => {
    setStartDate(val)
    // endDate ne peut pas être avant startDate
    if (endDate < val) setEndDate(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const dateStart = isMultiDay
      ? new Date(`${startDate}T00:00:00`).toISOString()
      : new Date(`${startDate}T${startTime}:00`).toISOString()

    const dateEnd = isMultiDay
      ? new Date(`${endDate}T23:59:59`).toISOString()
      : new Date(`${startDate}T${endTime}:00`).toISOString()

    const ok = await onSubmit({
      dungeon_name: dungeonName.trim(),
      creator_pseudo: creatorPseudo,
      creator_role: effectiveRole || null,
      creator_class: creatorClass || null,
      date_start: dateStart,
      date_end: dateEnd,
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      level: level ? parseInt(level) : null,
      description: description.trim() || null,
    })
    setSubmitting(false)
    if (ok) onClose()
  }

  const inputClass =
    'w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-400 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none transition-colors text-sm'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sword className="text-amber-400" size={20} />
            Proposer un événement
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-400">
            Organisé par{' '}
            <span className="text-amber-400 font-semibold">{creatorPseudo}</span>
          </p>

          {/* Nom de l'événement */}
          <div>
            <label className={labelClass}>
              <Sword size={13} className="inline mr-1 text-amber-400" />
              Nom de l'événement <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={dungeonName}
              onChange={(e) => setDungeonName(e.target.value)}
              placeholder="Ex : Comte Harebourg, Concours de skins…"
              className={inputClass}
              required
            />
          </div>

          {/* Toggle multi-jours */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={isMultiDay}
                onChange={(e) => handleToggleMultiDay(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#30363d] peer-checked:bg-amber-500 rounded-full transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex items-center gap-1.5">
              <CalendarRange size={14} className="text-amber-400" />
              Événement sur plusieurs jours
            </span>
          </label>

          {/* Dates */}
          {isMultiDay ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  <Calendar size={13} className="inline mr-1 text-amber-400" />
                  Date de début <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Calendar size={13} className="inline mr-1 text-amber-400" />
                  Date de fin <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className={labelClass}>
                  <Calendar size={13} className="inline mr-1 text-amber-400" />
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    <Clock size={13} className="inline mr-1 text-amber-400" />
                    Début <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Clock size={13} className="inline mr-1 text-amber-400" />
                    Fin <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Rôle de l'organisateur */}
          <div>
            <label className={labelClass}>
              <Shield size={13} className="inline mr-1 text-amber-400" />
              Ton rôle{' '}
              <span className="text-gray-500 font-normal">(optionnel)</span>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setCustomRole('') }}
              className={`${inputClass} appearance-none`}
            >
              <option value="">— Aucun rôle —</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
              <option value="__custom__">Autre (préciser)</option>
            </select>
            {selectedRole === '__custom__' && (
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Ton rôle…"
                className={`${inputClass} mt-2`}
                maxLength={30}
              />
            )}
          </div>

          {/* Places max + Niveau */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <Users size={13} className="inline mr-1 text-amber-400" />
                Places max{' '}
                <span className="text-gray-500 font-normal">(optionnel)</span>
              </label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                min="2"
                max="20"
                placeholder="Ex : 4"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <Star size={13} className="inline mr-1 text-amber-400" />
                Niveau{' '}
                <span className="text-gray-500 font-normal">(optionnel)</span>
              </label>
              <input
                type="number"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                min="1"
                max="230"
                placeholder="Ex : 200"
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>
              <FileText size={13} className="inline mr-1 text-amber-400" />
              Description{' '}
              <span className="text-gray-500 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Infos supplémentaires, prérequis…"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#30363d] text-gray-400 hover:text-white py-2.5 rounded-lg transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !dungeonName.trim() || !startDate || (isMultiDay && !endDate)}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-[#21262d] disabled:text-gray-600 text-black font-bold py-2.5 rounded-lg transition-colors text-sm"
            >
              {submitting ? 'Création…' : "Créer l'événement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
