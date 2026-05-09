import { useState } from 'react'
import { Sword, User } from 'lucide-react'

interface Props {
  onSetPseudo: (pseudo: string) => void
  currentPseudo?: string
}

export function PseudoSetup({ onSetPseudo, currentPseudo }: Props) {
  const [value, setValue] = useState(currentPseudo || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) onSetPseudo(value.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="p-3 bg-amber-400/10 rounded-full">
            <Sword className="text-amber-400" size={28} />
          </div>
          <h2 className="text-xl font-bold text-white">
            {currentPseudo ? 'Changer de pseudo' : 'Bienvenue !'}
          </h2>
          <p className="text-gray-400 text-sm">
            {currentPseudo
              ? 'Saisis ton nouveau pseudo en jeu.'
              : 'Saisis ton pseudo en jeu pour créer ou rejoindre des événements.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ton pseudo..."
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-400 rounded-lg pl-9 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors"
              maxLength={30}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!value.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-[#21262d] disabled:text-gray-600 text-black font-bold py-3 rounded-lg transition-colors"
          >
            Confirmer
          </button>
        </form>
      </div>
    </div>
  )
}
