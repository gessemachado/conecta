import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Lock, CheckCircle, Clock, BookOpen, Award, ChevronLeft, ChevronDown, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { AppLayout } from '../components/Layout/AppLayout'
import { Card } from '../components/ui/Card'
import { Badge, LevelBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatProgress } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function fmtMin(seconds) {
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h${m % 60 > 0 ? ` ${m % 60}min` : ''}`
  return `${m} min`
}

function VideoRow({ video, onPlay }) {
  return (
    <div
      onClick={video.locked ? undefined : onPlay}
      className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
        video.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group hover:bg-white/5'
      }`}
      style={{ border: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div className="flex-shrink-0">
        {video.completed ? (
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle size={16} className="text-green-400" />
          </div>
        ) : video.locked ? (
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <Lock size={16} className="text-text-secondary" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Play size={14} className="text-primary ml-0.5" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs text-text-secondary">Aula {video.order_index}</span>
          {video.is_mandatory && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Obrigatório</span>
          )}
        </div>
        <p className="text-sm font-medium text-white truncate">{video.title}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <LevelBadge level={video.level} />
        <span className="text-xs text-text-secondary hidden sm:block">{fmtMin(video.duration_seconds)}</span>
      </div>
    </div>
  )
}

export default function TrailDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [trail, setTrail] = useState(null)
  const [sections, setSections] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())
  const [evaluation, setEvaluation] = useState(null)
  const [evalPassed, setEvalPassed] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Trail
      const { data: trailData } = await supabase.from('trails').select('*').eq('id', id).single()
      if (!trailData) { setLoading(false); return }
      setTrail(trailData)

      // Sections + videos
      const { data: secs } = await supabase
        .from('sections')
        .select('*, videos(*)')
        .eq('trail_id', id)
        .order('order_index')

      let allVideos = []
      if (secs && secs.length > 0) {
        const parsed = secs.map(sec => ({
          ...sec,
          videos: (sec.videos || []).sort((a, b) => a.order_index - b.order_index).map(v => ({
            ...v,
            duration_seconds: (v.duration_min || 0) * 60,
          })),
        }))
        setSections(parsed)
        allVideos = parsed.flatMap(s => s.videos)
      } else {
        // Legacy: flat videos without sections
        const { data: vids } = await supabase.from('videos').select('*').eq('trail_id', id).order('order_index')
        if (vids?.length) {
          const mapped = vids.map(v => ({ ...v, duration_seconds: (v.duration_min || 0) * 60 }))
          setSections([{ id: 'legacy', title: null, videos: mapped }])
          allVideos = mapped
        }
      }

      // Video progress
      if (user?.id && allVideos.length > 0) {
        const videoIds = allVideos.map(v => v.id)
        const { data: progress } = await supabase
          .from('video_progress')
          .select('video_id')
          .eq('user_id', user.id)
          .in('video_id', videoIds)
        if (progress) setCompletedIds(new Set(progress.map(p => p.video_id)))
      }

      // Evaluation
      const { data: eval_ } = await supabase.from('evaluations').select('*').eq('trail_id', id).maybeSingle()
      if (eval_) {
        setEvaluation(eval_)
        if (user?.id) {
          const { data: result } = await supabase
            .from('evaluation_results')
            .select('passed')
            .eq('evaluation_id', eval_.id)
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          if (result?.passed) setEvalPassed(true)
        }
      }

      setLoading(false)
    }
    load()
  }, [id, user?.id])

  function toggleSection(secId) {
    setCollapsedSections(s => ({ ...s, [secId]: !s[secId] }))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin" style={{ color: '#FF6600' }} />
        </div>
      </AppLayout>
    )
  }

  if (!trail) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32 text-text-secondary text-sm">Curso não encontrado.</div>
      </AppLayout>
    )
  }

  const allVideos = sections.flatMap(s => s.videos)
  const totalVideos = allVideos.length
  const completedCount = allVideos.filter(v => completedIds.has(v.id)).length
  const totalSeconds = allVideos.reduce((a, v) => a + v.duration_seconds, 0)
  const pct = formatProgress(completedCount, totalVideos)
  const mandatoryDone = allVideos.filter(v => v.is_mandatory).every(v => completedIds.has(v.id))

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          Voltar aos cursos
        </button>

        {/* Header card */}
        <Card className="overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-0">
            <div className="h-48 sm:h-auto sm:w-72 flex-shrink-0 bg-bg-elevated flex items-center justify-center overflow-hidden">
              {trail.thumbnail ? (
                <img src={trail.thumbnail} alt={trail.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,102,0,0.15)' }}>
                  <BookOpen size={36} className="text-primary" />
                </div>
              )}
            </div>
            <div className="p-6 flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                {trail.category && <Badge variant="primary">{trail.category}</Badge>}
              </div>
              <h1 className="text-xl font-bold text-white">{trail.title}</h1>
              {trail.description && <p className="text-text-secondary text-sm leading-relaxed">{trail.description}</p>}
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5"><Play size={13} /> {totalVideos} vídeos</span>
                <span className="flex items-center gap-1.5"><Clock size={13} />{fmtMin(totalSeconds)}</span>
                {sections.length > 1 && sections[0].title && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} /> {sections.length} seções
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-text-secondary">{completedCount}/{totalVideos} concluídos</span>
                  <span className="text-sm font-bold text-primary">{pct}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Content */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Conteúdo do curso
          </h2>

          {sections.length === 1 && !sections[0].title ? (
            // Legacy: flat list
            <div className="space-y-2">
              {sections[0].videos.map(video => (
                <VideoRow
                  key={video.id}
                  video={{ ...video, completed: completedIds.has(video.id), locked: false }}
                  onPlay={() => navigate(`/video/${video.id}`)}
                />
              ))}
            </div>
          ) : (
            // Sections
            <div className="space-y-3">
              {sections.map((sec, si) => {
                const secCompleted = sec.videos.filter(v => completedIds.has(v.id)).length
                const secDuration = sec.videos.reduce((a, v) => a + v.duration_seconds, 0)
                const isCollapsed = collapsedSections[sec.id]
                return (
                  <div key={sec.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    {/* Section header */}
                    <button
                      onClick={() => toggleSection(sec.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                      style={{ background: '#111111' }}
                    >
                      {isCollapsed ? <ChevronRight size={16} className="text-text-secondary flex-shrink-0" /> : <ChevronDown size={16} className="text-text-secondary flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">
                          Seção {si + 1}: {sec.title}
                        </p>
                      </div>
                      <span className="text-xs text-text-secondary flex-shrink-0">
                        {secCompleted}/{sec.videos.length} • {fmtMin(secDuration)}
                      </span>
                    </button>

                    {/* Videos */}
                    {!isCollapsed && (
                      <div className="px-2 py-2 space-y-1" style={{ background: '#0D0D0D' }}>
                        {sec.videos.map(video => (
                          <VideoRow
                            key={video.id}
                            video={{ ...video, completed: completedIds.has(video.id), locked: false }}
                            onPlay={() => navigate(`/video/${video.id}`)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Evaluation */}
        {evaluation && (
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Avaliação Final</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {mandatoryDone
                      ? 'Você concluiu todos os vídeos obrigatórios. Realize a avaliação para receber seu certificado.'
                      : 'Complete todos os vídeos obrigatórios para liberar a avaliação.'}
                  </p>
                  {!mandatoryDone && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-yellow-400">
                      <AlertCircle size={12} />
                      Conclua os vídeos obrigatórios primeiro
                    </div>
                  )}
                </div>
              </div>
              <Button disabled={!mandatoryDone} onClick={() => navigate(`/avaliacao/${evaluation.id}`)}>
                {evalPassed ? 'Refazer' : 'Iniciar'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
