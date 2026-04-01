import { useState, useEffect } from 'react'
import { Store, Users, Video, TrendingUp, MapPin, Loader2 } from 'lucide-react'
import { AppLayout } from '../../components/Layout/AppLayout'
import { AdminSectionHeader } from '../../components/Layout/AdminSectionHeader'
import { supabase } from '../../lib/supabase'

const TODAY = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
})
const todayFormatted = TODAY.charAt(0).toUpperCase() + TODAY.slice(1)

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({ totalStores: 0, activeUsers: 0, activeRate: 0, publishedVideos: 0, avgProgress: 0 })
  const [ranking, setRanking] = useState([])

  useEffect(() => {
    async function load() {
      const [
        { data: stores },
        { data: allUsers },
        { data: allVideos },
        { data: progressRows },
        { data: trailsPublished },
      ] = await Promise.all([
        supabase.from('stores').select('id, name, city'),
        supabase.from('users').select('id, is_active, store_id, role'),
        supabase.from('videos').select('id, trail_id'),
        supabase.from('video_progress').select('user_id, video_id'),
        supabase.from('trails').select('id').eq('is_published', true),
      ])

      const publishedTrailIds = new Set((trailsPublished ?? []).map(t => t.id))
      const publishedVideoIds = new Set((allVideos ?? []).filter(v => publishedTrailIds.has(v.trail_id)).map(v => v.id))
      const totalPublishedVideos = publishedVideoIds.size

      const employees = (allUsers ?? []).filter(u => u.role !== 'admin')
      const activeEmployees = employees.filter(u => u.is_active).length
      const activeRate = employees.length ? Math.round((activeEmployees / employees.length) * 100) : 0

      // Avg progress across all employees
      const completedByUser = {}
      for (const p of progressRows ?? []) {
        completedByUser[p.user_id] = (completedByUser[p.user_id] ?? 0) + 1
      }
      const totalVids = allVideos?.length ?? 0
      const avgProgress = employees.length && totalVids
        ? Math.round(employees.reduce((sum, u) => sum + (completedByUser[u.id] ?? 0), 0) / employees.length / totalVids * 100)
        : 0

      setKpis({
        totalStores: stores?.length ?? 0,
        activeUsers: activeEmployees,
        activeRate,
        publishedVideos: totalPublishedVideos,
        avgProgress,
      })

      // Ranking: stores with user count and engagement (% of users with ≥1 completed video)
      const storeList = (stores ?? []).map((s, idx) => {
        const storeUsers = employees.filter(u => u.store_id === s.id)
        const engaged = storeUsers.filter(u => (completedByUser[u.id] ?? 0) > 0).length
        const engagement = storeUsers.length ? Math.round((engaged / storeUsers.length) * 100) : 0
        return { pos: idx + 1, name: s.name, engagement, users: storeUsers.length }
      })
      storeList.sort((a, b) => b.engagement - a.engagement)
      storeList.forEach((s, i) => s.pos = i + 1)
      setRanking(storeList)

      setLoading(false)
    }
    load()
  }, [])

  const KPI_CARDS = [
    {
      icon: Store, iconColor: '#FF6600', iconBg: 'rgba(255,102,0,0.15)',
      badge: null,
      label: 'Total de Lojas', value: kpis.totalStores,
    },
    {
      icon: Users, iconColor: '#3B82F6', iconBg: 'rgba(59,130,246,0.15)',
      badge: `${kpis.activeRate}% ativos`, badgeColor: '#22C55E', badgeBg: 'rgba(34,197,94,0.12)',
      label: 'Usuários Ativos', value: kpis.activeUsers,
    },
    {
      icon: Video, iconColor: '#A855F7', iconBg: 'rgba(168,85,247,0.15)',
      badge: null,
      label: 'Vídeos Publicados', value: kpis.publishedVideos,
    },
    {
      icon: TrendingUp, iconColor: '#FF6600', iconBg: 'rgba(255,102,0,0.15)',
      badge: 'Meta: 75%', badgeColor: '#FF6600', badgeBg: 'transparent',
      label: 'Progresso Médio', value: `${kpis.avgProgress}%`, extra: { pct: kpis.avgProgress },
    },
  ]

  return (
    <AppLayout>
      <AdminSectionHeader subtitle="Gestão e acompanhamento das trilhas" />

      <div className="max-w-6xl mx-auto px-6 py-7 space-y-6">

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: '#FF6600' }} />
          </div>
        ) : (
          <>
            {/* ── KPI cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {KPI_CARDS.map((k) => {
                const Icon = k.icon
                return (
                  <div
                    key={k.label}
                    className="rounded-xl p-5 space-y-3"
                    style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: k.iconBg }}>
                        <Icon size={18} style={{ color: k.iconColor }} />
                      </div>
                      {k.badge && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: k.badgeBg, color: k.badgeColor, border: k.badgeBg === 'transparent' ? `1px solid ${k.badgeColor}30` : 'none' }}
                        >
                          {k.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">{k.label}</p>
                      <p className="text-2xl font-bold text-white mt-0.5">{k.value}</p>
                    </div>
                    {k.extra && (
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${k.extra.pct}%`, background: '#FF6600' }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── Ranking de Lojas ── */}
            <div className="rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-5 py-4 flex items-start justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div>
                  <h2 className="text-base font-semibold text-white">Ranking de Lojas</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Desempenho e progresso por unidade</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['POSIÇÃO', 'UNIDADE', 'ENGAJAMENTO', 'USUÁRIOS'].map((col, i) => (
                        <th key={i} className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider" style={{ color: '#5A5A5A' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: '#5A5A5A' }}>
                          Nenhuma loja cadastrada
                        </td>
                      </tr>
                    )}
                    {ranking.map((row) => (
                      <tr key={row.pos} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-5 py-4">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{
                              background: row.pos <= 3 ? 'rgba(255,102,0,0.2)' : 'rgba(255,255,255,0.06)',
                              color: row.pos <= 3 ? '#FF6600' : '#A0A0A0',
                            }}
                          >
                            #{row.pos}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,102,0,0.1)' }}>
                              <MapPin size={12} style={{ color: '#FF6600' }} />
                            </div>
                            <span className="text-sm font-medium text-white">{row.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-28 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>
                              <div className="h-full rounded-full" style={{ width: `${row.engagement}%`, background: '#FF6600' }} />
                            </div>
                            <span className="text-sm font-semibold" style={{ color: '#FF6600' }}>{row.engagement}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-text-secondary">{row.users} usuários</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}

      </div>
    </AppLayout>
  )
}
