import { Sword, User, Pencil } from 'lucide-react'

interface Props {
  pseudo: string
  onChangePseudo: () => void
}

export function Navbar({ pseudo, onChangePseudo }: Props) {
  return (
    <nav className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sword className="text-amber-400" size={22} />
          <div>
            <h1 className="text-white font-bold text-base leading-none">Ze Raclette</h1>
            <p className="text-gray-500 text-[11px] mt-0.5">Calendrier de guilde</p>
          </div>
        </div>

        <button
          onClick={onChangePseudo}
          className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] hover:border-amber-400/60 rounded-lg px-3 py-2 transition-colors group"
          title="Changer de pseudo"
        >
          <User size={14} className="text-amber-400" />
          <span className="text-white text-sm font-medium max-w-[120px] truncate">
            {pseudo || 'Définir mon pseudo'}
          </span>
          <Pencil size={12} className="text-gray-600 group-hover:text-amber-400 transition-colors" />
        </button>
      </div>
    </nav>
  )
}
