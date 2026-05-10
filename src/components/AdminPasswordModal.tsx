import { useState } from 'react'
import { ShieldCheck, X, Eye, EyeOff } from 'lucide-react'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

export function AdminPasswordModal({ onSuccess, onCancel }: Props) {
  const [value, setValue] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ADMIN_PASSWORD) { setError(true); return }
    if (value === ADMIN_PASSWORD) {
      onSuccess()
    } else {
      setError(true)
      setValue('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-[#161b22] border border-amber-500/40 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="p-3 bg-amber-400/10 rounded-full">
            <ShieldCheck className="text-amber-400" size={28} />
          </div>
          <h2 className="text-xl font-bold text-white">Accès administrateur</h2>
          <p className="text-gray-400 text-sm">
            Le pseudo <span className="text-amber-400 font-medium">BlueCheese</span> est réservé à l'administrateur.
            Saisis le mot de passe pour continuer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(false) }}
              placeholder="Mot de passe…"
              autoFocus
              className={`w-full bg-[#0d1117] border rounded-lg px-4 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${
                error ? 'border-red-500/70 focus:border-red-500' : 'border-[#30363d] focus:border-amber-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">
              {!ADMIN_PASSWORD
                ? "Le mode admin n'est pas configuré (VITE_ADMIN_PASSWORD manquant dans .env.local)."
                : 'Mot de passe incorrect.'}
            </p>
          )}

          <button
            type="submit"
            disabled={!value.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-[#21262d] disabled:text-gray-600 text-black font-bold py-3 rounded-lg transition-colors"
          >
            Se connecter
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white text-sm transition-colors py-1"
          >
            <X size={13} /> Annuler (choisir un autre pseudo)
          </button>
        </form>
      </div>
    </div>
  )
}
