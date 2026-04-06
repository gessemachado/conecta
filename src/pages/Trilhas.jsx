import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Award, Loader2, ChevronDown, Clock, Star, Lock } from 'lucide-react'
import { AppLayout } from '../components/Layout/AppLayout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const STATUS_FILTERS = ['Todos', 'Em Progresso', 'Concluídas', 'Não Iniciadas']

function formatTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}min`
}

export default function Trilhas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [trails, setTrails] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [status, setStatus] = useState('Todos')
  const [visibleCount, setVisibleCount] = useState(8)

  useEffect(() => {
    if (!user?.id) return
    async function load() {
      let trailsQuery = supabase.from('trails').select('id, title, category, thumbnail, order_index').eq('is_published', true).order('order_index')
      if (user.target_role) trailsQuery = trailsQuery.contains('target_roles', [user.target_role])

      const [{ data: trailsData }, { data: allVids }, { data: prog }] = await Promise.all([
        trailsQuery,
        supabase.from('videos').select('id, trail_id, duration_min'),
        supabase.from('video_progress').select('video_id').eq('user_id', Number(user.id)),
      ])

      const videoToTrail = {}
      const trailVideoCount = {}
      const trailDuration = {}
      for (const v of allVids ?? []) {
        videoToTrail[v.id] = v.trail_id
        trailVideoCount[v.trail_id] = (trailVideoCount[v.trail_id] ?? 0) + 1
        trailDuration[v.trail_id] = (trailDuration[v.trail_id] ?? 0) + (v.duration_min || 0)
      }

      const progressMap = {}
      for (const p of prog ?? []) {
        const trailId = videoToTrail[p.video_id]
        if (trailId) progressMap[trailId] = (progressMap[trailId] ?? 0) + 1
      }

      const enriched = (trailsData ?? []).map(t => {
        const total = trailVideoCount[t.id] ?? 0
        const completed = progressMap[t.id] ?? 0
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0
        return { ...t, total_videos: total, completed_videos: completed, progress: pct, duration_min: trailDuration[t.id] ?? 0 }
      })

      // Desbloqueia sequencialmente: curso N só libera se o N-1 estiver 100% concluído
      const ordered = [...enriched].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      const withLock = ordered.map((t, i) => {
        if (t.order_index == null) return { ...t, locked: false }
        const locked = i > 0 && ordered[i - 1].order_index != null && ordered[i - 1].progress < 100
        return { ...t, locked }
      })
      setTrails(withLock)
      setLoading(false)
    }
    load()
  }, [user?.id])

  const allCategories = ['Todos', ...new Set(trails.map(t => t.category).filter(Boolean))]

  const filtered = trails.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'Todos' || t.category === category
    const matchStatus =
      status === 'Todos' ||
      (status === 'Em Progresso' && t.progress > 0 && t.progress < 100) ||
      (status === 'Concluídas' && t.progress === 100) ||
      (status === 'Não Iniciadas' && t.progress === 0)
    return matchSearch && matchCat && matchStatus
  })

  const visible = filtered.slice(0, visibleCount)

  async function handleTrailClick(trail) {
    if (trail.locked) return
    const { data } = await supabase
      .from('videos').select('id').eq('trail_id', trail.id).order('order_index').limit(1).single()
    if (data) navigate(`/video/${data.id}`)
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Todos os Cursos</h1>
            <p className="text-sm mt-1" style={{ color: '#A0A0A0' }}>
              Explore o catálogo completo de treinamentos e acelere seu crescimento profissional na BuyHelp.
            </p>
          </div>
          <div className="relative flex-shrink-0 w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#5A5A5A' }} />
            <input
              type="text"
              placeholder="Buscar curso ou módulo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-[#5A5A5A] focus:outline-none"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => e.target.style.borderColor = '#FF6600'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#5A5A5A' }}>
              Filtrar por trilha
            </p>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={
                    category === c
                      ? { background: '#FF6600', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#5A5A5A' }}>
              Filtrar por status
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={
                    status === s
                      ? { background: '#FF6600', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: '#FF6600' }} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visible.map(trail => (
                <div
                  key={trail.id}
                  className={`group relative rounded-lg overflow-hidden flex flex-col transition-all duration-300 ${trail.locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-1'}`}
                  style={{ background: '#1a1919', border: '1px solid rgba(72,72,72,0.2)' }}
                  onClick={() => handleTrailClick(trail)}
                  onMouseEnter={e => { if (!trail.locked) e.currentTarget.style.borderColor = 'rgba(255,102,0,0.5)' }}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(72,72,72,0.2)'}
                >
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    {trail.thumbnail ? (
                      <img
                        src={trail.thumbnail}
                        alt={trail.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #1a1a1a, #222)' }} />
                    )}
                    {/* Overlay de bloqueio */}
                    {trail.locked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <Lock size={28} style={{ color: '#A0A0A0' }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-center px-2" style={{ color: '#A0A0A0' }}>
                          Conclua o curso anterior
                        </span>
                      </div>
                    )}
                    {/* Badges */}
                    {!trail.locked && (
                      <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                          style={{ background: '#22C55E' }}
                        >
                          Iniciante
                        </span>
                        {trail.category && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                            style={{ background: 'rgba(255,102,0,0.85)', backdropFilter: 'blur(4px)' }}
                          >
                            {trail.category}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <h4
                      className="font-bold text-white leading-snug transition-colors group-hover:text-orange-500"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {trail.title}
                    </h4>

                    <div
                      className="flex items-center text-xs gap-3"
                      style={{
                        color: '#acabaa',
                        justifyContent: trail.progress === 100 ? 'space-between' : 'flex-start',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {trail.duration_min > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {formatTime(trail.duration_min)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star size={12} fill="#acabaa" /> 4.9
                        </span>
                      </div>
                      {trail.progress === 100 && (
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/certificado/${trail.id}`) }}
                          className="flex items-center gap-1 rounded-md transition-all active:scale-95 flex-shrink-0"
                          style={{
                            background: '#0a0a0a',
                            border: '1px solid #FF6600',
                            color: '#FF6600',
                            height: '20px',
                            padding: '0 6px',
                          }}
                        >
                          <div className="relative flex items-center">
                            <Award size={12} style={{ color: '#FF6600' }} />
                            <span
                              className="absolute rounded-full"
                              style={{
                                top: '-2px', right: '-2px',
                                width: '4px', height: '4px',
                                background: '#FF6600',
                                border: '1px solid #0a0a0a',
                              }}
                            />
                          </div>
                          <span className="font-bold uppercase tracking-wider" style={{ fontSize: '8px' }}>
                            CERTIFICADO
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar at bottom */}
                  <div className="w-full h-1 mt-auto" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full" style={{ width: `${trail.progress}%`, background: '#FF6600' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Load more */}
            {visibleCount < filtered.length && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <button
                  onClick={() => setVisibleCount(v => v + 8)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#A0A0A0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                >
                  Carregar mais cursos
                  <ChevronDown size={14} />
                </button>
                <p className="text-xs" style={{ color: '#5A5A5A' }}>
                  Mostrando {visible.length} de {filtered.length} cursos disponíveis
                </p>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-sm" style={{ color: '#5A5A5A' }}>
                Nenhum curso encontrado para os filtros selecionados.
              </div>
            )}
          </>
        )}

      </div>
    </AppLayout>
  )
}
