import { useState, useEffect } from 'react'
import { ArrowLeft, BarChart2, Trash2, Download, Loader2, Lock, Users, Sword, Calendar, TrendingUp, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useStats } from '../hooks/useStats'
import type { GuildEventWithParticipants } from '../types'

const STATS_PASSWORD = 'Camembert'

interface Props {
  onBack: () => void
}

type StatsTab = 'stats' | 'export'

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function MiniBar({ value, max, amber }: { value: number; max: number; amber?: boolean }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-[#30363d] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${amber ? 'bg-amber-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-6 text-right">{value}</span>
    </div>
  )
}

export function StatsPage({ onBack }: Props) {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState(false)
  const [activeTab, setActiveTab] = useState<StatsTab>('stats')

  // Export/delete state
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toLocaleDateString('sv')
  })
  const [toDate, setToDate] = useState(() => new Date().toLocaleDateString('sv'))
  const [rangeEvents, setRangeEvents] = useState<GuildEventWithParticipants[] | null>(null)
  const [rangeLoading, setRangeLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { stats, loading, fetchStats, fetchEventsInRange, deleteEvents } = useStats()

  useEffect(() => {
    if (unlocked) fetchStats()
  }, [unlocked, fetchStats])

  const handleUnlock = () => {
    if (password === STATS_PASSWORD) {
      setUnlocked(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  const handleFetchRange = async () => {
    setRangeLoading(true)
    setRangeEvents(null)
    setConfirmDelete(false)
    const events = await fetchEventsInRange(fromDate, toDate)
    setRangeEvents(events)
    setRangeLoading(false)
  }

  const handleExport = () => {
    if (!rangeEvents?.length) return
    const payload = {
      export_date: new Date().toISOString(),
      period: { from: fromDate, to: toDate },
      events_count: rangeEvents.length,
      events: rangeEvents,
    }
    const filename = `zeraclette_${fromDate}_${toDate}.json`
    downloadJson(payload, filename)
  }

  const handleDelete = async () => {
    if (!rangeEvents?.length) return
    setDeleting(true)
    const ok = await deleteEvents(rangeEvents.map(e => e.id))
    if (ok) {
      setRangeEvents([])
      setConfirmDelete(false)
      fetchStats()
    }
    setDeleting(false)
  }

  const inputClass = 'bg-[#0d1117] border border-[#30363d] focus:border-amber-400 rounded-lg px-3 py-2 text-white text-sm focus:outline-none transition-colors'

  // ── Écran de mot de passe ──
  if (!unlocked) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors mb-8">
          <ArrowLeft size={16} /> Retour
        </button>
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={20} className="text-amber-400" />
            <h1 className="text-white font-bold text-lg">Tableau de bord BlueCheese</h1>
          </div>
          <p className="text-gray-500 text-sm mb-6">Mot de passe requis pour accéder aux statistiques.</p>
          <div className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPwError(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Mot de passe…"
              className={`w-full ${inputClass} ${pwError ? 'border-red-500/60' : ''}`}
              autoFocus
            />
            {pwError && <p className="text-red-400 text-xs">Mot de passe incorrect.</p>}
            <button
              onClick={handleUnlock}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-lg transition-colors text-sm"
            >
              Accéder
            </button>
          </div>
        </div>
      </div>
    )
  }

  const maxTotal = stats ? Math.max(...stats.member_activity.map(m => m.total), 1) : 1
  const maxMonth = stats ? Math.max(...stats.months.map(m => m.count), 1) : 1
  const maxDungeon = stats ? Math.max(...stats.popular_dungeons.map(d => d.count), 1) : 1

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
          <ArrowLeft size={16} /> Retour
        </button>
        <div className="w-px h-5 bg-[#30363d]" />
        <BarChart2 size={18} className="text-amber-400" />
        <h1 className="text-white font-bold text-lg">Tableau de bord</h1>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-[#0d1117] border border-[#30363d] rounded-xl p-1">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'stats' ? 'bg-[#161b22] text-amber-400 border border-[#30363d]' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <TrendingUp size={14} /> Statistiques
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'export' ? 'bg-[#161b22] text-amber-400 border border-[#30363d]' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Trash2 size={14} /> Export & Ménage
        </button>
      </div>

      {/* ── Onglet Statistiques ── */}
      {activeTab === 'stats' && (
        loading || !stats ? (
          <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Calcul des statistiques…</span>
          </div>
        ) : (
          <div className="space-y-5">

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Événements', value: stats.total_events, icon: <Sword size={15} className="text-amber-400" /> },
                { label: 'Participations', value: stats.total_participations, icon: <Users size={15} className="text-blue-400" /> },
                { label: 'Membres', value: stats.unique_members, icon: <Users size={15} className="text-violet-400" /> },
                { label: 'Mois le + actif', value: stats.most_active_month, icon: <Calendar size={15} className="text-emerald-400" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
                  <p className="text-white font-bold text-xl leading-none">{value}</p>
                </div>
              ))}
            </div>

            {/* Activité par mois */}
            {stats.months.length > 0 && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={14} className="text-amber-400" /> Événements par mois
                </h2>
                <div className="space-y-2">
                  {stats.months.map(m => (
                    <div key={m.month} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-20 text-right">{m.label}</span>
                      <MiniBar value={m.count} max={maxMonth} amber />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deux colonnes : membres + donjons */}
            <div className="grid sm:grid-cols-2 gap-5">

              {/* Activité des membres */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={14} className="text-amber-400" /> Activité des membres
                </h2>
                <div className="space-y-3">
                  {stats.member_activity.slice(0, 12).map(m => (
                    <div key={m.pseudo}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white font-medium">{m.pseudo}</span>
                        <span className="text-[11px] text-gray-600">
                          {m.events_created > 0 && `${m.events_created} créé${m.events_created > 1 ? 's' : ''}`}
                          {m.events_created > 0 && m.events_joined > 0 && ' · '}
                          {m.events_joined > 0 && `${m.events_joined} rejoint${m.events_joined > 1 ? 's' : ''}`}
                        </span>
                      </div>
                      <MiniBar value={m.total} max={maxTotal} amber />
                      {m.last_activity && (
                        <p className="text-[10px] text-gray-700 mt-0.5">
                          Dernière activité : {format(new Date(m.last_activity), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Donjons populaires */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Sword size={14} className="text-amber-400" /> Activités les plus jouées
                </h2>
                <div className="space-y-2">
                  {stats.popular_dungeons.map(d => (
                    <div key={d.name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-300 flex-1 truncate">{d.name}</span>
                      <MiniBar value={d.count} max={maxDungeon} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* ── Onglet Export & Ménage ── */}
      {activeTab === 'export' && (
        <div className="space-y-5">

          {/* Sélection de période */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar size={14} className="text-amber-400" /> Sélectionner une période
            </h2>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Du</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Au</label>
                <input type="date" value={toDate} min={fromDate} onChange={e => setToDate(e.target.value)} className={inputClass} />
              </div>
              <button
                onClick={handleFetchRange}
                disabled={rangeLoading}
                className="flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {rangeLoading ? <Loader2 size={13} className="animate-spin" /> : <Calendar size={13} />}
                Rechercher
              </button>
            </div>
          </div>

          {/* Résultats */}
          {rangeEvents !== null && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">
                  {rangeEvents.length === 0
                    ? 'Aucun événement sur cette période'
                    : `${rangeEvents.length} événement${rangeEvents.length > 1 ? 's' : ''} trouvé${rangeEvents.length > 1 ? 's' : ''}`}
                </h2>
                {rangeEvents.length > 0 && (
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Download size={12} /> Exporter .json
                  </button>
                )}
              </div>

              {rangeEvents.length > 0 && (
                <>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto mb-5">
                    {rangeEvents.map(e => (
                      <div key={e.id} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-[#0d1117]">
                        <Sword size={12} className="text-amber-400 flex-shrink-0" />
                        <span className="text-white flex-1 truncate">{e.dungeon_name}</span>
                        <span className="text-gray-600 text-xs flex-shrink-0">
                          {format(new Date(e.date_start), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        <span className="text-gray-600 text-xs flex-shrink-0">
                          {e.participants.length + 1} joueur{e.participants.length > 0 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Zone de suppression */}
                  <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-4">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-400">
                        La suppression est <strong>irréversible</strong>. Les {rangeEvents.length} événement{rangeEvents.length > 1 ? 's' : ''} et leurs participants seront définitivement effacés. Exporte d'abord le JSON si tu veux garder une archive.
                      </p>
                    </div>
                    {!confirmDelete ? (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex items-center gap-1.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 size={12} /> Supprimer du calendrier
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                          Confirmer la suppression
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="border border-[#30363d] text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
