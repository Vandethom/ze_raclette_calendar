import type { ReactNode } from 'react'

export function StrategySection({ title, icon, children, accent = 'amber' }: {
  title: string
  icon?: ReactNode
  children: ReactNode
  accent?: 'amber' | 'violet' | 'red'
}) {
  const accentCls = {
    amber: 'text-amber-400',
    violet: 'text-violet-400',
    red: 'text-red-400',
  }[accent]
  return (
    <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4">
      <h2 className={`flex items-center gap-2.5 text-white font-bold text-lg`}>
        {icon && <span className={accentCls}>{icon}</span>}
        {title}
      </h2>
      {children}
    </section>
  )
}

export function MonsterBlock({ name, hp, tags, children }: {
  name: string
  hp?: string
  tags?: string[]
  children: ReactNode
}) {
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-white font-semibold text-sm">{name}</span>
        <div className="flex items-center gap-1.5">
          {hp && (
            <span className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-full">
              {hp} PV
            </span>
          )}
          {tags?.map((t) => (
            <span key={t} className="text-[11px] text-gray-400 bg-[#161b22] border border-[#30363d] px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}

export function SpellRow({ name, effect, zone, cooldown }: {
  name: string
  effect: string
  zone?: string
  cooldown?: string
}) {
  return (
    <div className="border border-[#30363d]/60 rounded-lg px-3 py-2 bg-[#161b22]/60">
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <span className="text-sm font-medium text-amber-300">{name}</span>
        {cooldown && <span className="text-[10px] text-gray-500 flex-shrink-0">{cooldown}</span>}
      </div>
      <p className="text-xs text-gray-400">{effect}</p>
      {zone && <p className="text-[11px] text-violet-400/80 mt-1">📐 {zone}</p>}
    </div>
  )
}

export function TacticList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2 text-sm text-gray-300">
          <span className="text-amber-400 flex-shrink-0">▸</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

export function StratTip({ children, color = 'amber' }: { children: ReactNode; color?: 'amber' | 'red' | 'violet' }) {
  const cls = {
    amber: 'bg-amber-500/5 border-amber-500/20 text-amber-300/80',
    red: 'bg-red-500/5 border-red-500/20 text-red-300/80',
    violet: 'bg-violet-500/5 border-violet-500/20 text-violet-300/80',
  }[color]
  return (
    <div className={`flex gap-2 border rounded-lg px-4 py-3 text-sm ${cls}`}>
      <span className="flex-shrink-0">💡</span>
      <span>{children}</span>
    </div>
  )
}

export function RewardBox({ items }: { items: string[] }) {
  return (
    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3 space-y-1">
      <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Récompenses</p>
      <ul className="space-y-0.5">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-emerald-300/80">• {it}</li>
        ))}
      </ul>
    </div>
  )
}

export function SimpleTable({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#30363d]">
      <table className="w-full">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[#30363d] first:border-t-0">
              <td className="py-2 px-3 text-sm text-white font-medium">{r[0]}</td>
              <td className="py-2 px-3 text-sm text-gray-400">{r[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
