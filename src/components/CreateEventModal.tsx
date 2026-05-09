import { useState } from 'react'
import { X, Sword, Calendar, Clock, Users, Star, FileText } from 'lucide-react'
import type { CreateEventInput } from '../types'

interface Props {
  initialDate?: string
  creatorPseudo: string
  onSubmit: (data: CreateEventInput) => Promise<boolean>
  onClose: () => void
}

export function CreateEventModal({ initialDate, creatorPseudo, onSubmit, onClose }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [dungeonName, setDungeonName] = useState('')
  const [date, setDate] = useState(initialDate?.slice(0, 10) ?? today)
  const [startTime, setStartTime] = useState(initialDate?.slice(11, 16) ?? '18:00')
  const [endTime, setEndTime] = useState('20:00')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [level, setLevel] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await onSubmit({
      dungeon_name: dungeonName.trim(),
      creator_pseudo: creatorPseudo,
      date_start: `${date}T${startTime}:00+02:00`,
      date_end: `${date}T${endTime}:00+02:00`,
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

          {/* Dungeon */}
          <div>
            <label className={labelClass}>
              <Sword size={13} className="inline mr-1 text-amber-400" />
              Nom du donjon <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={dungeonName}
              onChange={(e) => setDungeonName(e.target.value)}
              placeholder="Ex : Comte Harebourg, Tengu Shogun…"
              className={inputClass}
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className={labelClass}>
              <Calendar size={13} className="inline mr-1 text-amber-400" />
              Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {/* Start / End */}
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

          {/* Optional */}
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
              disabled={submitting || !dungeonName.trim() || !date}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-[#21262d] disabled:text-gray-600 text-black font-bold py-2.5 rounded-lg transition-colors text-sm"
            >
              {submitting ? 'Création…' : 'Créer l\'événement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
