import { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, X, Loader2, ClipboardList, Store, Users, Video, GraduationCap, Monitor, ThumbsUp, Filter } from 'lucide-react'
import { AppLayout } from '../../components/Layout/AppLayout'
import { AdminSectionHeader } from '../../components/Layout/AdminSectionHeader'
import { supabase } from '../../lib/supabase'

const PER_PAGE = 7

const NPS_CLASS = score =>
  score === null || score === undefined ? null
  : score <= 6 ? { label: 'Detrator', color: '#EF4444', bg: '#EF444420' }
  : score <= 8 ? { label: 'Neutro',   color: '#EAB308', bg: '#EAB30820' }
  :              { label: 'Promotor', color: '#22C55E', bg: '#22C55E20' }

/* ─── Survey modal ──────────────────────────────────────────────── */
function SurveyModal({ user, onClose }) {
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('onboarding_surveys')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      setSurvey(data)
      setLoading(false)
    }
    load()
  }, [user.id])

  const nps = NPS_CLASS(survey?.nps_score)

  function ScoreDisplay({ score, max = 10 }) {
    if (score === null || score === undefined)
      return <span className="text-sm" style={{ color: '#5A5A5A' }}>Não respondido</span>
    return (
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: max === 10 ? 10 : 11 }, (_, i) => {
            const val = max === 10 ? i + 1 : i
            const isSelected = val === score
            return (
              <div
                key={val}
                className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold"
                style={{
                  background: isSelected ? '#FF6600' : 'rgba(255,255,255,0.06)',
                  color: isSelected ? '#fff' : '#5A5A5A',
                }}
              >
                {val}
              </div>
            )
          })}
        </div>
        <span className="text-sm font-bold" style={{ color: '#FF6600' }}>{score}/{max}</span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'rgba(255,102,0,0.25)' }}>
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
              <p className="text-xs" style={{ color: '#5A5A5A' }}>Avaliação de onboarding</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin" style={{ color: '#FF6600' }} />
            </div>
          ) : !survey ? (
            <div className="py-10 text-center space-y-2">
              <ClipboardList size={32} className="mx-auto opacity-30" style={{ color: '#A0A0A0' }} />
              <p className="text-sm" style={{ color: '#5A5A5A' }}>Este colaborador ainda não respondeu a avaliação.</p>
            </div>
          ) : (
            <>
              {/* Implantação */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FF6600' }}>Como foi a implantação da BuyHelp?</p>
                <ScoreDisplay score={survey.implantation_score} max={10} />
                {survey.implantation_comment && (
                  <div className="rounded-lg px-4 py-3 text-sm leading-relaxed" style={{ background: 'rgba(255,255,255,0.04)', color: '#A0A0A0' }}>
                    {survey.implantation_comment}
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              {/* Treinamento */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FF6600' }}>Como foi o treinamento?</p>
                <ScoreDisplay score={survey.training_score} max={10} />
                {survey.training_comment && (
                  <div className="rounded-lg px-4 py-3 text-sm leading-relaxed" style={{ background: 'rgba(255,255,255,0.04)', color: '#A0A0A0' }}>
                    {survey.training_comment}
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              {/* NPS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FF6600' }}>Net Promoter Score (NPS)</p>
                  {nps && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: nps.bg, color: nps.color }}>
                      {nps.label}
                    </span>
                  )}
                </div>
                <ScoreDisplay score={survey.nps_score} max={10} />
                {survey.nps_reason && (
                  <div className="rounded-lg px-4 py-3 text-sm leading-relaxed" style={{ background: 'rgba(255,255,255,0.04)', color: '#A0A0A0' }}>
                    {survey.nps_reason}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────────── */
export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [storeFilter, setStoreFilter] = useState('Todas as Lojas')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [page, setPage] = useState(1)
  const [surveyUser, setSurveyUser] = useState(null)
  const [metrics, setMetrics] = useState({ totalStores: 0, activeUsers: 0, totalActiveRate: 0, publishedVideos: 0 })
  const [surveyMetrics, setSurveyMetrics] = useState({ training: null, platform: null, nps: null, count: 0 })

  useEffect(() => {
    async function load() {
      const [{ data: usersData, error }, { data: videosData }, { data: progressData }, { data: storesData }, { data: pubVideosData }, { data: surveyData }] = await Promise.all([
        supabase.from('users').select('id, name, email, role, is_active, stores(name)').order('id'),
        supabase.from('videos').select('id', { count: 'exact', head: false }),
        supabase.from('video_progress').select('user_id, video_id'),
        supabase.from('stores').select('id'),
        supabase.from('videos').select('id, trails!inner(is_published)').eq('trails.is_published', true),
        supabase.from('onboarding_surveys').select('training_score, implantation_score, nps_score'),
      ])

      if (!error && usersData) {
        const totalVideos = videosData?.length ?? 0

        // Count completed videos per user
        const completedByUser = {}
        for (const p of progressData ?? []) {
          completedByUser[p.user_id] = (completedByUser[p.user_id] ?? 0) + 1
        }

        const mapped = usersData.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role === 'employee' ? 'colaborador' : u.role,
          store: u.stores?.name ?? '—',
          status: u.is_active ? 'ativo' : 'inativo',
          progress: u.role === 'admin' ? null
            : totalVideos > 0 ? Math.round(((completedByUser[u.id] ?? 0) / totalVideos) * 100)
            : 0,
        }))
        setUsers(mapped)

        const activeCount = usersData.filter(u => u.is_active).length
        const activeRate = usersData.length ? Math.round((activeCount / usersData.length) * 100) : 0
        setMetrics({
          totalStores: storesData?.length ?? 0,
          activeUsers: activeCount,
          totalActiveRate: activeRate,
          publishedVideos: pubVideosData?.length ?? 0,
        })

        // Survey averages
        const answered = (surveyData ?? []).filter(s => s.training_score || s.implantation_score || s.nps_score)
        const avg = (field) => {
          const vals = answered.map(s => s[field]).filter(v => v !== null && v !== undefined)
          if (!vals.length) return null
          return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
        }
        setSurveyMetrics({
          training: avg('training_score'),
          platform: avg('implantation_score'),
          nps: avg('nps_score'),
          count: answered.length,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const allStores = ['Todas as Lojas', ...new Set(users.map(u => u.store).filter(s => s !== '—'))]

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchStore  = storeFilter === 'Todas as Lojas' || u.store === storeFilter
    const matchStatus = statusFilter === 'Todos' || u.status === statusFilter
    return matchSearch && matchStore && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)


  return (
    <AppLayout hideTabs>
      <AdminSectionHeader subtitle="Gestão de usuários e colaboradores" />
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: '#FF6600' }} />
          </div>
        )}

        {/* ── All metric cards — single row ── */}
        <div className="grid grid-cols-5 gap-3">
          {/* Total de Lojas */}
          <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,102,0,0.18)' }}>
                <Store size={16} style={{ color: '#FF6600' }} />
              </div>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#A0A0A0' }}>Total de Lojas</p>
              <p className="text-2xl font-bold text-white mt-0.5">{metrics.totalStores}</p>
            </div>
          </div>

          {/* Usuários Ativos */}
          <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.18)' }}>
                <Users size={16} style={{ color: '#3B82F6' }} />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                {metrics.totalActiveRate}% ativos
              </span>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#A0A0A0' }}>Usuários Ativos</p>
              <p className="text-2xl font-bold text-white mt-0.5">{metrics.activeUsers}</p>
            </div>
          </div>

          {/* Survey cards */}
          {[
            { icon: GraduationCap, iconColor: '#FF6600', iconBg: 'rgba(255,102,0,0.18)', label: 'MÉDIA — TREINAMENTO', value: surveyMetrics.training, barColor: '#FF6600' },
            { icon: Monitor,       iconColor: '#3B82F6', iconBg: 'rgba(59,130,246,0.18)', label: 'MÉDIA — PLATAFORMA',  value: surveyMetrics.platform, barColor: '#FF6600' },
            { icon: ThumbsUp,      iconColor: '#EAB308', iconBg: 'rgba(234,179,8,0.18)',  label: 'MÉDIA — NPS',         value: surveyMetrics.nps,      barColor: '#EAB308' },
          ].map(m => {
            const pct = m.value !== null ? (m.value / 10) * 100 : 0
            return (
              <div key={m.label} className="rounded-xl p-4 space-y-3" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: m.iconBg }}>
                    <m.icon size={16} style={{ color: m.iconColor }} />
                  </div>
                  <span className="text-[10px]" style={{ color: '#5A5A5A' }}>
                    {surveyMetrics.count} {surveyMetrics.count === 1 ? 'resposta' : 'respostas'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-wider mb-1" style={{ color: '#5A5A5A' }}>{m.label}</p>
                  {m.value !== null ? (
                    <p className="text-2xl font-bold text-white">
                      {m.value}<span className="text-sm font-normal" style={{ color: '#5A5A5A' }}>/10</span>
                    </p>
                  ) : (
                    <p className="text-xs" style={{ color: '#5A5A5A' }}>Sem dados</p>
                  )}
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.barColor }} />
                </div>
              </div>
            )
          })}
        </div>


        {/* ── Search + filters ── */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,102,0,0.15)' }}>
              <Filter size={13} style={{ color: '#FF6600' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Filtros</p>
              <p className="text-xs" style={{ color: '#A0A0A0' }}>Pesquise e filtre os usuários</p>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#5A5A5A' }} />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Buscar por nome, e-mail ou loja..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-text-secondary focus:outline-none transition-colors"
                style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {/* Status dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                className="px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none appearance-none pr-8 cursor-pointer"
                style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <option value="Todos">Status do Usuário</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            {/* Search button */}
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: '#FF6600', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#E55C00'}
              onMouseLeave={e => e.currentTarget.style.background = '#FF6600'}
            >
              <Search size={14} />
              Pesquisar
            </button>

            {/* Clear */}
            <button
              onClick={() => { setSearch(''); setStatusFilter('Todos'); setStoreFilter('Todas as Lojas'); setPage(1) }}
              className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
              style={{ color: '#A0A0A0' }}
            >
              <X size={13} /> Limpar
            </button>

            {/* Count */}
            <span className="text-sm font-medium whitespace-nowrap" style={{ color: '#A0A0A0' }}>
              {filtered.length} resultados
            </span>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['USUÁRIO', 'UNIDADE', 'NÍVEL', 'STATUS', 'PROGRESSO TREINAMENTO', 'AÇÕES'].map(col => (
                  <th key={col} className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider" style={{ color: '#5A5A5A' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="transition-colors hover:bg-white/[0.02]">

                  {/* Usuário */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'rgba(255,102,0,0.25)' }}
                      >
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white leading-tight">{u.name}</p>
                        <p className="text-xs" style={{ color: '#5A5A5A' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Unidade */}
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#A0A0A0' }}>{u.store}</td>

                  {/* Nível */}
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded"
                      style={
                        u.role === 'admin'
                          ? { background: 'rgba(255,102,0,0.15)', color: '#FF6600' }
                          : { background: 'rgba(255,255,255,0.07)', color: '#A0A0A0' }
                      }
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: u.status === 'ativo' ? '#22C55E' : '#EF4444' }} />
                      <span className="text-sm" style={{ color: u.status === 'ativo' ? '#22C55E' : '#EF4444' }}>
                        {u.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </td>

                  {/* Progresso */}
                  <td className="px-5 py-3.5">
                    {u.progress === null ? (
                      <span className="text-xs" style={{ color: '#5A5A5A' }}>N/A (Admin)</span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-28 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div className="h-full rounded-full" style={{ width: `${u.progress}%`, background: '#FF6600' }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: '#FF6600' }}>{u.progress}%</span>
                      </div>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-5 py-3.5">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => setSurveyUser(u)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.08)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,102,0,0.12)'; e.currentTarget.style.color = '#FF6600'; e.currentTarget.style.borderColor = 'rgba(255,102,0,0.3)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#A0A0A0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                      >
                        <ClipboardList size={12} />
                        Ver avaliação
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginated.length === 0 && (
            <div className="py-12 text-center" style={{ color: '#5A5A5A' }}>
              <Search size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum usuário encontrado</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <ChevronLeft size={14} /> Anterior
              </button>

              <div className="flex items-center gap-1">
                {(() => {
                  const pages = []
                  const show = (n) => pages.push(n)
                  show(1)
                  if (page > 3) pages.push('...')
                  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) show(i)
                  if (page < totalPages - 2) pages.push('...')
                  if (totalPages > 1) show(totalPages)
                  return pages.map((p, i) =>
                    p === '...' ? (
                      <span key={`e${i}`} className="px-1 text-sm" style={{ color: '#5A5A5A' }}>…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                        style={p === page ? { background: '#FF6600', color: '#fff' } : { color: '#A0A0A0' }}
                        onMouseEnter={e => { if (p !== page) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                        onMouseLeave={e => { if (p !== page) e.currentTarget.style.background = 'transparent' }}
                      >
                        {p}
                      </button>
                    )
                  )
                })()}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Próxima <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>



      </div>

      {surveyUser && <SurveyModal user={surveyUser} onClose={() => setSurveyUser(null)} />}
    </AppLayout>
  )
}
