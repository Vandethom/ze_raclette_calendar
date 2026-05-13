import { useState } from 'react'
import { X, Swords, Users, Calendar, FileText } from 'lucide-react'
import type { CreateWishInput } from '../types'

interface Props {
  creatorPseudo: string
  creatorClass?: string | null
  onSubmit: (data: CreateWishInput) => Promise<boolean>
  onClose: () => void
}

export function CreateWishModal({ creatorPseudo, creatorClass, onSubmit, onClose }: Props) {
  const [activityName, setActivityName] = useState('')
  const [requiredPlayers, setRequiredPlayers] = useState('4')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const minDate = new Date().toISOString().slice(0, 10)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await onSubmit({
      activity_name: activityName.trim(),
      creator_pseudo: creatorPseudo,
      creator_class: creatorClass || null,
      required_players: Math.max(2, Math.min(20, parseInt(requiredPlayers) || 4)),
      deadline: deadline || null,
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
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Swords className="text-amber-400" size={20} />
            Proposer une activité
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-400">
            Proposé par{' '}
            <span className="text-amber-400 font-semibold">{creatorPseudo}</span>
            {' '}· Les membres voteront sur les créneaux disponibles.
          </p>

          {/* Nom de l'activité */}
          <div>
            <label className={labelClass}>
              <Swords size={13} className="inline mr-1 text-amber-400" />
              Activité <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Ex : Comte Harebourg, Farm Koli, Srambad…"
              className={inputClass}
              required
              autoFocus
            />
          </div>

          {/* Joueurs + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <Users size={13} className="inline mr-1 text-amber-400" />
                Joueurs requis <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={requiredPlayers}
                onChange={(e) => setRequiredPlayers(e.target.value)}
                min="2"
                max="20"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                <Calendar size={13} className="inline mr-1 text-amber-400" />
                Deadline{' '}
                <span className="text-gray-500 font-normal">(optionnel)</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={minDate}
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
              placeholder="Niveau requis, équipement, précisions…"
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
              disabled={submitting || !activityName.trim()}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-[#21262d] disabled:text-gray-600 text-black font-bold py-2.5 rounded-lg transition-colors text-sm"
            >
              {submitting ? 'Envoi…' : 'Proposer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
