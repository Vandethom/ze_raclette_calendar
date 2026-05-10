import { useState } from 'react'
import { Sword, User, ChevronDown } from 'lucide-react'
import { CLASSES } from '../lib/classes'

interface Props {
  onSetPseudo: (pseudo: string, playerClass: string) => void
  currentPseudo?: string
  currentClass?: string
}

export function PseudoSetup({ onSetPseudo, currentPseudo, currentClass }: Props) {
  const [pseudo, setPseudo] = useState(currentPseudo || '')
  const [playerClass, setPlayerClass] = useState(currentClass || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pseudo.trim()) onSetPseudo(pseudo.trim(), playerClass)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="p-3 bg-amber-400/10 rounded-full">
            <Sword className="text-amber-400" size={28} />
          </div>
          <h2 className="text-xl font-bold text-white">
            {currentPseudo ? 'Modifier mon profil' : 'Bienvenue !'}
          </h2>
          <p className="text-gray-400 text-sm">
            {currentPseudo
              ? 'Mets à jour ton pseudo et ta classe.'
              : 'Saisis ton pseudo en jeu pour créer ou rejoindre des événements.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pseudo */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
              <User size={11} className="text-amber-400" />
              Pseudo en jeu <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Ton pseudo…"
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-400 rounded-lg pl-9 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors"
                maxLength={30}
                autoFocus
              />
            </div>
          </div>

          {/* Classe */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
              <Sword size={11} className="text-amber-400" />
              Classe <span className="text-gray-600 font-normal">(optionnel)</span>
            </label>
            <div className="relative">
              <select
                value={playerClass}
                onChange={(e) => setPlayerClass(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-400 rounded-lg pl-4 pr-9 py-3 text-white focus:outline-none transition-colors appearance-none text-sm"
              >
                <option value="">— Sélectionne ta classe —</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!pseudo.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-[#21262d] disabled:text-gray-600 text-black font-bold py-3 rounded-lg transition-colors"
          >
            Confirmer
          </button>
        </form>
      </div>
    </div>
  )
}
