import { useState } from 'react'
import { Waves, ChevronRight, ScrollText } from 'lucide-react'
import { GigalodonStrategy } from './strategy/GigalodonStrategy'

interface Guide {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
}

const GUIDES: Guide[] = [
  {
    id: 'gigalodon',
    title: 'Gouffre du Gigalodon',
    subtitle: 'Raid 8-16 joueurs · 6 étages + combat final',
    icon: <Waves className="text-violet-400" size={20} />,
  },
]

export function StrategiesPage() {
  const [selected, setSelected] = useState<string | null>(null)

  if (selected === 'gigalodon') {
    return <GigalodonStrategy onBack={() => setSelected(null)} />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <div className="text-center space-y-2 pb-2">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <ScrollText className="text-amber-400" size={22} />
          Stratégies
        </h1>
        <p className="text-gray-500 text-sm">Guides détaillés des donjons et raids de la guilde.</p>
      </div>

      <div className="space-y-3">
        {GUIDES.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelected(g.id)}
            className="w-full flex items-center gap-4 bg-[#161b22] border border-[#30363d] hover:border-amber-400/50 rounded-2xl px-5 py-4 transition-colors text-left group"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center">
              {g.icon}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{g.title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{g.subtitle}</p>
            </div>
            <ChevronRight size={16} className="text-gray-600 group-hover:text-amber-400 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
