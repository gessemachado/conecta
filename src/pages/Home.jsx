import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, Clock, CheckCircle2, Bookmark, TrendingUp, Award, Star, Lock } from 'lucide-react'
import { AppLayout } from '../components/Layout/AppLayout'
import { OnboardingSurvey } from '../components/OnboardingSurvey'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [showSurvey, setShowSurvey] = useState(false)
  const [currentTrail, setCurrentTrail] = useState(null)
  const [stats, setStats] = useState({ totalMinutes: 0, completedTrails: 0, remainingTrails: 0 })
  const [recommended, setRecommended] = useState([])
  const [weeklyData, setWeeklyData] = useState([])

  const firstName = user?.name?.split(' ')[0] || 'Colaborador'

  useEffect(() => {
    if (!user?.id) return
    async function load() {
      const [{ data: trailsData }, { data: allVids }, { data: prog }] = await Promise.all([
        supabase.from('trails').select('id, title, category, thumbnail, order_index').eq('is_published', true).order('order_index'),
        supabase.from('videos').select('id, trail_id, duration_min'),
        supabase.from('video_progress').select('video_id, completed_at').eq('user_id', Number(user.id)),
      ])

      const videoToTrail = {}
      const videoDuration = {}
      const trailVideoCount = {}
      const trailDuration = {}
      for (const v of allVids ?? []) {
        videoToTrail[v.id] = v.trail_id
        videoDuration[v.id] = v.duration_min || 0
        trailVideoCount[v.trail_id] = (trailVideoCount[v.trail_id] ?? 0) + 1
        trailDuration[v.trail_id] = (trailDuration[v.trail_id] ?? 0) + (v.duration_min || 0)
      }

      const progressMap = {}
      let totalMinutes = 0
      let latestAt = null
      let latestVideoId = null

      for (const p of prog ?? []) {
        const trailId = videoToTrail[p.video_id]
        if (trailId) progressMap[trailId] = (progressMap[trailId] ?? 0) + 1
        totalMinutes += videoDuration[p.video_id] || 0
        if (!latestAt || new Date(p.completed_at) > new Date(latestAt)) {
          latestAt = p.completed_at
          latestVideoId = p.video_id
        }
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

      const completedTrails = withLock.filter(t => t.progress === 100)
      const inProgress = withLock.filter(t => !t.locked && t.progress > 0 && t.progress < 100)
      const notStarted = withLock.filter(t => !t.locked && t.progress === 0)

      let currentT = null
      if (latestVideoId) {
        const lastTrailId = videoToTrail[latestVideoId]
        currentT = withLock.find(t => t.id === lastTrailId && !t.locked)
      }
      if (!currentT) currentT = inProgress[0] ?? notStarted[0] ?? withLock[0]

      // Weekly chart: last 7 days (Mon→Sun order)
      const DAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']
      const today = new Date()
      // Build last 7 days
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (6 - i))
        return d
      })
      const weekCounts = new Array(7).fill(0)
      for (const p of prog ?? []) {
        if (!p.completed_at) continue
        const d = new Date(p.completed_at)
        const idx = last7.findIndex(ld =>
          ld.getDate() === d.getDate() && ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear()
        )
        if (idx !== -1) weekCounts[idx]++
      }

      setCurrentTrail(currentT)
      setStats({
        totalMinutes,
        completedTrails: completedTrails.length,
        remainingTrails: withLock.length - completedTrails.length,
      })
      // Recommended: desbloqueados em progresso, não iniciados, concluídos e por último bloqueados
      const locked = withLock.filter(t => t.locked)
      setRecommended([...inProgress, ...notStarted, ...completedTrails, ...locked].slice(0, 4))
      setWeeklyData(last7.map((d, i) => ({
        day: DAYS[i],
        count: weekCounts[i],
        isToday: i === 6,
      })))
      setLoading(false)

      const { data: survey } = await supabase.from('onboarding_surveys').select('id').eq('user_id', user.id).maybeSingle()
      if (!survey) setShowSurvey(true)
    }
    load()
  }, [user?.id])

  async function handleContinue(trail) {
    if (trail.locked) return
    const { data } = await supabase.from('videos').select('id').eq('trail_id', trail.id).order('order_index').limit(1).single()
    if (data) navigate(`/video/${data.id}`)
  }

  function formatTime(minutes) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}min`
  }

  const maxWeekly = Math.max(...weeklyData.map(d => d.count), 1)

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-40">
          <Loader2 size={28} className="animate-spin" style={{ color: '#FF6600' }} />
        </div>
      </AppLayout>
    )
  }

  return (
    <>
      {showSurvey && user?.id && (
        <OnboardingSurvey userId={user.id} onDone={() => setShowSurvey(false)} />
      )}
      <AppLayout>
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

          {/* ── Hero ── */}
          <section
            className="relative rounded-xl overflow-hidden flex items-end"
            style={{ minHeight: '400px' }}
          >
            {/* Background — imagem fixa do Stitch */}
            <div className="absolute inset-0">
              <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0a0a0a, rgba(10,10,10,0.6) 50%, transparent)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,10,10,0.8), transparent)' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-2xl p-8 lg:p-12 space-y-6">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">Olá, {user?.name || firstName}</h1>
                <p className="text-lg" style={{ color: '#d8b0a0' }}>Continue de onde parou sua jornada de excelência.</p>
              </div>

              {currentTrail && (
                <div
                  className="p-6 rounded-xl max-w-md space-y-4"
                  style={{
                    background: 'rgba(17,17,17,0.7)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 0 20px rgba(255,102,0,0.3)',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold tracking-widest uppercase block mb-1" style={{ color: '#FF6600' }}>
                        CURSO ATUAL
                      </span>
                      <h3 className="text-xl font-bold text-white leading-tight">{currentTrail.title}</h3>
                    </div>
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'rgba(255,102,0,0.2)' }}>
                      <TrendingUp size={20} style={{ color: '#FF6600' }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs" style={{ color: '#acabaa' }}>
                      <span>{currentTrail.progress}% Concluído</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${currentTrail.progress}%`, background: '#FF6600', boxShadow: '0 0 8px rgba(255,102,0,0.5)' }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleContinue(currentTrail)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-sm text-white transition-all active:scale-95"
                    style={{ background: '#FF6600' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#E55C00'}
                    onMouseLeave={e => e.currentTarget.style.background = '#FF6600'}
                  >
                    CONTINUAR AGORA
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ── Stats ── */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Tempo Total */}
            <div
              className="p-6 rounded-xl flex items-center gap-4"
              style={{ background: '#111111', border: '1px solid rgba(72,72,72,0.3)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,102,0,0.1)' }}>
                <Clock size={20} style={{ color: '#FF6600' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#acabaa' }}>Tempo Total</p>
                <h4 className="text-xl font-bold text-white">{formatTime(stats.totalMinutes)}</h4>
              </div>
            </div>

            {/* Trilhas Concluídas */}
            <div
              className="p-6 rounded-xl flex items-center gap-4"
              style={{ background: '#111111', border: '1px solid rgba(72,72,72,0.3)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }}>
                <CheckCircle2 size={20} style={{ color: '#22C55E' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#acabaa' }}>Cursos Finais</p>
                <h4 className="text-xl font-bold text-white">{stats.completedTrails}</h4>
              </div>
            </div>

            {/* Meu Progresso — col-span-2 */}
            <div
              className="md:col-span-2 p-6 rounded-xl"
              style={{ background: '#111111', border: '1px solid rgba(72,72,72,0.3)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#acabaa' }}>Meu Progresso</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <CheckCircle2 size={18} style={{ color: '#22C55E' }} />
                  </div>
                  <div>
                    <p className="text-[10px] leading-none mb-1" style={{ color: '#acabaa' }}>Cursos Concluídos</p>
                    <h4 className="text-xl font-bold text-white">{stats.completedTrails}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,102,0,0.1)' }}>
                    <Bookmark size={18} style={{ color: '#FF6600' }} />
                  </div>
                  <div>
                    <p className="text-[10px] leading-none mb-1" style={{ color: '#acabaa' }}>Cursos Restantes</p>
                    <h4 className="text-xl font-bold text-white">{stats.remainingTrails}</h4>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Trilhas Recomendadas ── */}
          {recommended.length > 0 && (
            <section className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Cursos Recomendados</h2>
                  <p className="text-sm" style={{ color: '#acabaa' }}>Baseado no seu perfil de crescimento</p>
                </div>
                <button
                  onClick={() => navigate('/trilhas')}
                  className="text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: '#FF6600' }}
                >
                  Ver tudo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommended.map((trail) => (
                  <div
                    key={trail.id}
                    className={`group relative rounded-lg overflow-hidden flex flex-col transition-all duration-300 ${trail.locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-1'}`}
                    style={{
                      background: '#1a1919',
                      border: '1px solid rgba(72,72,72,0.2)',
                    }}
                    onClick={() => handleContinue(trail)}
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
                    <div className="w-full h-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full" style={{ width: `${trail.progress}%`, background: '#FF6600' }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Evolução da Semana ── */}
          <section>
            <div
              className="p-8 rounded-xl"
              style={{
                background: 'rgba(17,17,17,0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp size={20} style={{ color: '#FF6600' }} />
                Evolução da Semana
              </h3>

              <div className="flex items-end justify-between gap-2" style={{ height: '192px' }}>
                {weeklyData.map((d, i) => {
                  const pct = d.count / maxWeekly
                  const barH = d.count > 0 ? Math.max(pct * 100, 10) : 10
                  return (
                    <div key={i} className="w-full flex flex-col items-center group relative">
                      {/* Tooltip */}
                      {d.isToday && d.count > 0 && (
                        <div
                          className="absolute text-[10px] px-2 py-1 rounded font-bold text-black whitespace-nowrap"
                          style={{ background: '#fff', top: `calc(${100 - barH}% - 28px)` }}
                        >
                          {d.count} vídeo{d.count !== 1 ? 's' : ''}
                        </div>
                      )}
                      <div className="w-full flex items-end" style={{ height: '160px' }}>
                        <div
                          className="w-full rounded-t transition-all"
                          style={{
                            height: `${barH}%`,
                            background: d.isToday ? '#FF6600' : '#262626',
                            boxShadow: d.isToday ? '0 0 20px rgba(255,102,0,0.3)' : 'none',
                            minHeight: '4px',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between text-[10px] font-bold mt-4 px-1" style={{ color: '#767575' }}>
                {weeklyData.map((d, i) => (
                  <span key={i} style={{ color: d.isToday ? '#fff' : '#767575' }}>{d.day}</span>
                ))}
              </div>
            </div>
          </section>

        </div>
      </AppLayout>
    </>
  )
}
