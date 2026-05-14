import { Sword, User, Pencil, Search, X, BookOpen, CalendarDays, CalendarCheck } from 'lucide-react'

type Page = 'calendar' | 'guide' | 'availabilities'

interface Props {
  pseudo: string
  playerClass?: string
  onChangePseudo: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
  currentPage: Page
  onNavigate: (page: Page) => void
}

export function Navbar({
  pseudo,
  playerClass,
  onChangePseudo,
  searchQuery,
  onSearchChange,
  currentPage,
  onNavigate,
}: Props) {
  const showSearch = currentPage === 'calendar'

  return (
    <nav className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Sword className="text-amber-400" size={22} />
          <div className="hidden sm:block">
            <h1 className="text-white font-bold text-base leading-none">Ze Raclette</h1>
            <p className="text-gray-500 text-[11px] mt-0.5">Calendrier de guilde</p>
          </div>
        </div>

        {/* Barre de recherche — seulement sur le calendrier */}
        {showSearch ? (
          <div className="flex-1 max-w-xl mx-auto">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Chercher un événement, un membre…"
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-400 rounded-lg pl-9 pr-8 py-2 text-white placeholder-gray-600 text-sm focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  title="Effacer la recherche"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Bouton Mes dispos */}
        {pseudo && (
          <button
            onClick={() => onNavigate(currentPage === 'availabilities' ? 'calendar' : 'availabilities')}
            className={`flex-shrink-0 flex items-center gap-2 border rounded-lg px-3 py-2 transition-colors group ${
              currentPage === 'availabilities'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                : 'bg-[#0d1117] border-[#30363d] hover:border-amber-400/60'
            }`}
            title={currentPage === 'availabilities' ? 'Retour au calendrier' : 'Mes disponibilités'}
          >
            <CalendarCheck
              size={14}
              className={
                currentPage === 'availabilities'
                  ? 'text-amber-400'
                  : 'text-gray-400 group-hover:text-amber-400 transition-colors'
              }
            />
            <span
              className={`text-sm hidden sm:inline ${
                currentPage === 'availabilities' ? 'text-amber-400' : 'text-gray-300'
              }`}
            >
              Dispos
            </span>
          </button>
        )}

        {/* Bouton Guide / Calendrier */}
        <button
          onClick={() =>
            onNavigate(currentPage === 'guide' ? 'calendar' : 'guide')
          }
          className="flex-shrink-0 flex items-center gap-2 bg-[#0d1117] border border-[#30363d] hover:border-amber-400/60 rounded-lg px-3 py-2 transition-colors group"
          title={currentPage === 'guide' ? 'Retour au calendrier' : 'Voir le guide'}
        >
          {currentPage === 'guide' ? (
            <CalendarDays size={14} className="text-amber-400" />
          ) : (
            <BookOpen size={14} className="text-gray-400 group-hover:text-amber-400 transition-colors" />
          )}
          <span className="text-gray-300 text-sm hidden sm:inline">
            {currentPage === 'guide' ? 'Calendrier' : 'Guide'}
          </span>
        </button>

        {/* Pseudo */}
        <button
          onClick={onChangePseudo}
          className="flex-shrink-0 flex items-center gap-2 bg-[#0d1117] border border-[#30363d] hover:border-amber-400/60 rounded-lg px-3 py-2 transition-colors group"
          title="Modifier mon profil"
        >
          <User size={14} className="text-amber-400" />
          <span className="hidden sm:flex flex-col items-start leading-none">
            <span className="text-white text-sm font-medium max-w-[100px] truncate">
              {pseudo || 'Mon pseudo'}
            </span>
            {playerClass && (
              <span className="text-[10px] text-amber-400/60 mt-0.5">{playerClass}</span>
            )}
          </span>
          <Pencil size={12} className="text-gray-600 group-hover:text-amber-400 transition-colors" />
        </button>
      </div>
    </nav>
  )
}
