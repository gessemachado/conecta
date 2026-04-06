import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronDown, ChevronRight, Check, Play, Pause, Volume2, Maximize,
  Settings, Lock, CheckCircle, ThumbsUp, Award, Loader2,
} from 'lucide-react'
import { AppLayout } from '../components/Layout/AppLayout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const LEVEL_STYLE = {
  INICIANTE:       { bg: '#22C55E22', color: '#22C55E' },
  'INTERMEDIÁRIO': { bg: '#EAB30822', color: '#EAB308' },
  AVANÇADO:        { bg: '#EF444422', color: '#EF4444' },
}

function getVideoEmbed(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const vid = u.searchParams.get('v') || u.pathname.split('/').pop()
      return { type: 'iframe', src: `https://www.youtube.com/embed/${vid}?autoplay=1&rel=0` }
    }
    if (u.hostname.includes('vimeo.com')) {
      const vid = u.pathname.split('/').filter(Boolean).pop()
      return { type: 'iframe', src: `https://player.vimeo.com/video/${vid}?autoplay=1` }
    }
    return { type: 'video', src: url }
  } catch {
    return { type: 'video', src: url }
  }
}

function StatusIcon({ status }) {
  if (status === 'current')
    return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FF660033', border: '1.5px solid #FF6600' }}>
        <Play size={9} style={{ color: '#FF6600' }} fill="#FF6600" />
      </div>
    )
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <Play size={9} style={{ color: '#5A5A5A' }} />
    </div>
  )
}

export default function VideoPlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [video, setVideo] = useState(null)
  const [trail, setTrail] = useState(null)
  const [sections, setSections] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState({})
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [playing, setPlaying] = useState(false)
  const [likedMap, setLikedMap] = useState({})

  useEffect(() => {
    setCompleted(false)
    async function load() {
      setLoading(true)
      // Fetch current video
      const { data: vid } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single()
      if (!vid) { setLoading(false); return }
      setVideo(vid)

      // Fetch trail
      const { data: tr } = await supabase
        .from('trails')
        .select('id, title, thumbnail')
        .eq('id', vid.trail_id)
        .single()
      setTrail(tr)

      // Fetch sections with videos
      const { data: secs } = await supabase
        .from('sections')
        .select('id, title, order_index, videos(id, title, duration_min, order_index)')
        .eq('trail_id', vid.trail_id)
        .order('order_index')

      if (secs && secs.length > 0) {
        setSections(secs.map(s => ({
          ...s,
          videos: (s.videos || []).sort((a, b) => a.order_index - b.order_index),
        })))
      } else {
        // Legacy: flat list
        const { data: vids } = await supabase
          .from('videos')
          .select('id, title, duration_min, order_index')
          .eq('trail_id', vid.trail_id)
          .order('order_index')
        if (vids?.length) setSections([{ id: 'legacy', title: null, videos: vids }])
      }

      // Check completed videos
      if (user?.id) {
        const { data: prog } = await supabase
          .from('video_progress')
          .select('video_id')
          .eq('user_id', Number(user.id))
        if (prog) {
          const ids = new Set(prog.map(p => p.video_id))
          setCompletedIds(ids)
          if (ids.has(Number(id))) setCompleted(true)
        }
      }
      setLoading(false)
    }
    load()
  }, [id])

  const lvl = LEVEL_STYLE[video?.level] || LEVEL_STYLE['INICIANTE']
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

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

  if (!video) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32 text-text-secondary">
          Vídeo não encontrado.
        </div>
      </AppLayout>
    )
  }

  function handlePostComment(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setComments(prev => [
      ...prev,
      { id: Date.now().toString(), user: user?.name || 'Você', initials, time: 'agora', text: comment.trim(), likes: 0 },
    ])
    setComment('')
  }

  function toggleLike(cid) {
    setLikedMap(m => ({ ...m, [cid]: !m[cid] }))
  }

  return (
    <AppLayout>
      {/* ── Breadcrumb + progress ── */}
      <div className="border-b border-white/[0.06]" style={{ background: '#0e0e0e' }}>
        <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary min-w-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 hover:text-white transition-colors flex-shrink-0"
            >
              <ChevronLeft size={13} />
              Voltar
            </button>
            <span className="opacity-30">/</span>
            <span className="hover:text-white cursor-pointer transition-colors truncate">{trail?.title}</span>
            <span className="opacity-30">/</span>
            <span className="text-white truncate">{video.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex gap-6">
          {/* ── Left: player + info + comments ── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Video player */}
            {(() => {
              const embed = getVideoEmbed(video.url)
              return (
                <div
                  className="relative w-full rounded-xl overflow-hidden"
                  style={{ background: '#000', aspectRatio: '16/9' }}
                >
                  {embed?.type === 'iframe' ? (
                    <iframe
                      key={video.url}
                      src={embed.src}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; fullscreen; encrypted-media"
                      allowFullScreen
                    />
                  ) : embed?.type === 'video' ? (
                    <video
                      key={video.url}
                      src={embed.src}
                      controls
                      autoPlay
                      className="absolute inset-0 w-full h-full"
                      style={{ background: '#000' }}
                    />
                  ) : (
                    <>
                      {trail?.thumbnail && (
                        <img
                          src={trail.thumbnail}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ filter: 'brightness(0.45)' }}
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background: '#FF6600', boxShadow: '0 0 0 8px rgba(255,102,0,0.2)' }}
                        >
                          <Play size={24} fill="white" className="text-white ml-1" />
                        </div>
                      </div>
                      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/40">
                        Nenhum vídeo cadastrado
                      </p>
                    </>
                  )}
                </div>
              )
            })()}

            {/* Title row + complete button */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-white">{video.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: lvl.bg, color: lvl.color }}
                  >
                    {video.level || 'INICIANTE'}
                  </span>
                  {video.duration_min > 0 && (
                    <span className="text-xs text-text-secondary px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {video.duration_min} min
                    </span>
                  )}
                  {video.is_mandatory && (
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ border: '1px solid #FF6600', color: '#FF6600' }}
                    >
                      OBRIGATÓRIO
                    </span>
                  )}
                </div>
              </div>

              {completed ? (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-btn flex-shrink-0" style={{ background: '#22C55E22', color: '#22C55E' }}>
                  <CheckCircle size={15} />
                  <span className="text-sm font-semibold">Concluído</span>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    setCompleted(true)
                    if (user?.id) {
                      await supabase.from('video_progress').upsert(
                        { user_id: user.id, video_id: Number(id), completed_at: new Date().toISOString() },
                        { onConflict: 'user_id,video_id' }
                      )
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-semibold flex-shrink-0 transition-all"
                  style={{ background: '#FF6600', color: '#fff' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#E55C00'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FF6600'}
                >
                  <Check size={15} />
                  Marcar como concluído
                </button>
              )}
            </div>

            {/* Description */}
            {video.description && (
              <p className="text-text-secondary text-sm leading-relaxed">{video.description}</p>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

            {/* Comments */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">
                Comentários ({comments.length})
              </h3>

              {/* Input */}
              <form onSubmit={handlePostComment} className="flex gap-3 items-start">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ background: 'rgba(255,102,0,0.3)' }}
                >
                  {initials}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="flex-1 px-4 py-2 rounded-btn text-sm text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                    style={{ background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim()}
                    className="px-4 py-2 rounded-btn text-sm font-semibold transition-all disabled:opacity-40"
                    style={{ background: '#FF6600', color: '#fff' }}
                  >
                    Enviar
                  </button>
                </div>
              </form>

              {/* Comment list */}
              <div className="space-y-5">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                      style={{ background: 'rgba(255,102,0,0.25)' }}
                    >
                      {c.initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{c.user}</span>
                        <span className="text-xs text-text-secondary">{c.time}</span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">{c.text}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          onClick={() => toggleLike(c.id)}
                          className="flex items-center gap-1.5 text-xs transition-colors"
                          style={{ color: likedMap[c.id] ? '#FF6600' : '#5A5A5A' }}
                        >
                          <ThumbsUp size={12} />
                          {c.likes + (likedMap[c.id] ? 1 : 0)}
                        </button>
                        <button className="text-xs text-text-secondary hover:text-white transition-colors">
                          Responder
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: sidebar ── */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div
              className="sticky top-[88px] rounded-xl overflow-hidden"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-semibold text-white">Conteúdo do Curso</p>
              </div>

              <div>
                {sections.map((sec, si) => {
                  const isLegacy = sec.id === 'legacy'
                  const isCollapsed = collapsedSections[sec.id]
                  const secHasCurrent = sec.videos.some(v => String(v.id) === String(id))

                  return (
                    <div key={sec.id}>
                      {/* Section header — only show if has title */}
                      {!isLegacy && (
                        <button
                          onClick={() => toggleSection(sec.id)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors"
                          style={{
                            background: secHasCurrent ? 'rgba(255,102,0,0.05)' : '#0D0D0D',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = secHasCurrent ? 'rgba(255,102,0,0.05)' : '#0D0D0D'}
                        >
                          {isCollapsed
                            ? <ChevronRight size={13} style={{ color: '#5A5A5A', flexShrink: 0 }} />
                            : <ChevronDown size={13} style={{ color: '#5A5A5A', flexShrink: 0 }} />
                          }
                          <span className="flex-1 text-[11px] font-semibold leading-tight truncate" style={{ color: '#A0A0A0' }}>
                            Seção {si + 1}: {sec.title}
                          </span>
                          <span className="text-[10px] flex-shrink-0" style={{ color: '#5A5A5A' }}>
                            {sec.videos.length} aulas
                          </span>
                        </button>
                      )}

                      {/* Videos */}
                      {!isCollapsed && sec.videos.map(v => {
                        const isCurrent = String(v.id) === String(id)
                        const isDone = completedIds.has(v.id)
                        return (
                          <button
                            key={v.id}
                            onClick={() => navigate(`/video/${v.id}`)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                            style={{
                              background: isCurrent ? 'rgba(255,102,0,0.08)' : 'transparent',
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = isCurrent ? 'rgba(255,102,0,0.12)' : 'rgba(255,255,255,0.03)'}
                            onMouseLeave={e => e.currentTarget.style.background = isCurrent ? 'rgba(255,102,0,0.08)' : 'transparent'}
                          >
                            {isDone && !isCurrent ? (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#22C55E22' }}>
                                <CheckCircle size={12} style={{ color: '#22C55E' }} />
                              </div>
                            ) : (
                              <StatusIcon status={isCurrent ? 'current' : 'unlocked'} />
                            )}
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-xs leading-snug truncate"
                                style={{ color: isCurrent ? '#FF6600' : '#E0E0E0', fontWeight: isCurrent ? 600 : 400 }}
                              >
                                {v.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {isCurrent && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#FF660022', color: '#FF6600' }}>
                                    Assistindo
                                  </span>
                                )}
                                {v.duration_min > 0 && (
                                  <span className="text-[10px] text-text-secondary">{v.duration_min} min</span>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
