import { useState } from 'react'
import { Swords, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import type { Wish, WishAvailability } from '../types'

interface WishCardProps {
  wish: Wish
  availabilities: WishAvailability[]
  onClick: () => void
}

function WishCard({ wish, availabilities, onClick }: WishCardProps) {
  const interested = new Set(
    availabilities.filter((a) => a.wish_id === wish.id).map((a) => a.pseudo)
  ).size

  const formatDeadline = (d: string) =>
    new Date(`${d}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  const fillPct = wish.required_players > 0
    ? Math.min(100, Math.round((interested / wish.required_players) * 100))
    : 0

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-60 bg-[#161b22] border border-[#30363d] hover:border-amber-400/50 rounded-xl p-4 text-left transition-all hover:bg-[#1c2129] group"
    >
      {/* Titre + deadline */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
          {wish.activity_name}
        </h3>
        {wish.deadline && (
          <span className="flex-shrink-0 text-xs text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
            ↯ {formatDeadline(wish.deadline)}
          </span>
        )}
      </div>

      {/* Créateur */}
      <p className="text-xs text-gray-500 mb-3">
        par <span className="text-gray-400">{wish.creator_pseudo}</span>
        {wish.creator_class && (
          <span className="ml-1 text-amber-500/70">{wish.creator_class}</span>
        )}
      </p>

      {/* Barre de progression */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className={fillPct >= 100 ? 'text-amber-400 font-medium' : 'text-gray-500'}>
            {interested}/{wish.required_players} intéressés
          </span>
          {fillPct >= 100 && <span className="text-amber-400">⭐ Prêt !</span>}
        </div>
        <div className="h-1.5 bg-[#30363d] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${fillPct >= 100 ? 'bg-amber-500' : 'bg-amber-500/40'}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-600 group-hover:text-amber-400/70 transition-colors">
        Voter sur les créneaux →
      </p>
    </button>
  )
}

interface Props {
  wishes: Wish[]
  wishAvailabilities: WishAvailability[]
  currentPseudo: string
  isAdmin?: boolean
  onOpenWish: (wishId: string) => void
  onCreateWish: () => void
}

export function WishesPanel({
  wishes,
  wishAvailabilities,
  currentPseudo,
  isAdmin,
  onOpenWish,
  onCreateWish,
}: Props) {
  const [collapsed, setCollapsed] = useState(wishes.length === 0)

  return (
    <div className="mb-6 bg-[#0d1117]/40 border border-[#30363d] rounded-2xl overflow-hidden">
      {/* En-tête */}
      <div className="flex items-center justify-between px-5 py-3">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <Swords size={15} className="text-amber-400" />
          <span className="font-semibold text-sm">Activités sans date</span>
          {wishes.length > 0 && (
            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-medium">
              {wishes.length}
            </span>
          )}
          {collapsed ? (
            <ChevronDown size={14} className="text-gray-500" />
          ) : (
            <ChevronUp size={14} className="text-gray-500" />
          )}
        </button>

        {currentPseudo && !isAdmin && (
          <button
            onClick={onCreateWish}
            className="flex items-center gap-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-500/60 px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus size={12} />
            Proposer
          </button>
        )}
      </div>

      {/* Contenu */}
      {!collapsed && (
        <div className="border-t border-[#30363d] px-5 py-4">
          {wishes.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-4">
              Aucune activité en attente de date.{' '}
              {currentPseudo && !isAdmin && (
                <button
                  onClick={onCreateWish}
                  className="text-amber-400 hover:underline"
                >
                  Proposer une activité ?
                </button>
              )}
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {wishes.map((wish) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  availabilities={wishAvailabilities}
                  onClick={() => onOpenWish(wish.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
