import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Trophy, Share2, Download, Loader2 } from 'lucide-react'
import { AppLayout } from '../components/Layout/AppLayout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function generateCode() {
  return `BH-${new Date().getFullYear()}-${Math.random().toString(36).toUpperCase().slice(2, 6)}-CERT`
}

export default function Certificate() {
  const { id: trailId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [cert, setCert] = useState(null)
  const [trail, setTrail] = useState(null)
  const [stats, setStats] = useState({ progress: 100, videos: 0, minutes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    async function load() {
      // Load trail info + videos
      const [{ data: trailData }, { data: vids }] = await Promise.all([
        supabase.from('trails').select('id, title').eq('id', Number(trailId)).single(),
        supabase.from('videos').select('id, duration_min').eq('trail_id', Number(trailId)),
      ])
      setTrail(trailData)

      const totalVideos = vids?.length ?? 0
      const totalMinutes = vids?.reduce((s, v) => s + (v.duration_min || 0), 0) ?? 0

      // Compute progress
      const { data: prog } = await supabase
        .from('video_progress')
        .select('video_id')
        .eq('user_id', Number(user.id))
      const completedInTrail = (prog ?? []).filter(p => vids?.some(v => v.id === p.video_id)).length
      const pct = totalVideos > 0 ? Math.round((completedInTrail / totalVideos) * 100) : 100

      setStats({ progress: pct, videos: totalVideos, minutes: totalMinutes })

      // Get or create certificate
      let { data: existing } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', Number(user.id))
        .eq('trail_id', Number(trailId))
        .maybeSingle()

      if (!existing) {
        const { data: created } = await supabase
          .from('certificates')
          .insert({ user_id: Number(user.id), trail_id: Number(trailId), verification_code: generateCode() })
          .select('*')
          .single()
        existing = created
      }

      setCert(existing)
      setLoading(false)
    }
    load()
  }, [trailId, user?.id])

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'Meu Certificado — BuyHelp Conecta',
        text: `Concluí o curso "${trail?.title}" pela BuyHelp Conecta!`,
      })
    } else {
      navigator.clipboard.writeText(cert?.verification_code ?? '')
      alert('Código de verificação copiado!')
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-40">
          <Loader2 size={28} className="animate-spin" style={{ color: '#FF6600' }} />
        </div>
      </AppLayout>
    )
  }

  if (!cert || !trail) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-40 text-text-secondary text-sm">
          Certificado não encontrado.
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
          style={{ color: '#A0A0A0' }}
        >
          <ChevronLeft size={15} />
          Voltar para Início
        </button>

        {/* Congrats banner */}
        <div className="text-center space-y-3 py-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(255,102,0,0.15)', border: '2px solid rgba(255,102,0,0.3)' }}
          >
            <Trophy size={24} style={{ color: '#FF6600' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Parabéns! 🎉</h1>
            <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#A0A0A0' }}>
              Você concluiu com sucesso o treinamento{' '}
              <span className="font-semibold text-white">{trail.title}</span>{' '}
              na plataforma BuyHelp Conecta.
            </p>
          </div>
        </div>

        {/* Certificate card */}
        <div
          className="relative rounded-2xl overflow-hidden p-8"
          style={{
            background: '#FAFAFA',
            border: '2px solid #FF6600',
          }}
        >
          {/* Watermark top-left */}
          <Trophy
            size={100}
            className="absolute -top-2 -left-2 opacity-[0.06]"
            style={{ color: '#FF6600' }}
          />
          {/* Watermark bottom-right */}
          <Trophy
            size={100}
            className="absolute -bottom-2 -right-2 opacity-[0.06]"
            style={{ color: '#FF6600' }}
          />

          <div className="relative text-center space-y-5">
            {/* Trophy icon */}
            <Trophy size={36} style={{ color: '#FF6600' }} className="mx-auto" />

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#111111' }}>Certificado de Conclusão</h2>
              <p className="text-sm mt-3" style={{ color: '#888' }}>Certificamos que</p>
            </div>

            {/* Name */}
            <p className="text-4xl font-black" style={{ color: '#111111', fontFamily: 'Georgia, serif' }}>
              {user?.name || 'Colaborador'}
            </p>

            {/* Description */}
            <p className="text-sm leading-relaxed mx-auto max-w-xs" style={{ color: '#555' }}>
              concluiu com êxito o programa de treinamento{' '}
              <span className="font-bold" style={{ color: '#111' }}>BuyHelp Conecta</span>,{' '}
              demonstrando dedicação e comprometimento no desenvolvimento de suas habilidades profissionais no curso{' '}
              <span className="font-bold" style={{ color: '#FF6600' }}>{trail.title}</span>.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 py-2">
              {[
                { value: `${stats.progress}%`, label: 'PROGRESSO' },
                { value: stats.videos, label: 'VÍDEOS' },
                { value: stats.minutes, label: 'MINUTOS' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-black" style={{ color: '#FF6600' }}>{s.value}</p>
                  <p className="text-[10px] font-semibold tracking-widest mt-0.5" style={{ color: '#AAA' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />

            {/* Footer */}
            <div className="flex items-center justify-between text-xs" style={{ color: '#AAA' }}>
              <span>Emitido em: <span style={{ color: '#555' }}>{formatDate(cert.issued_at)}</span></span>
              <span className="font-bold tracking-widest" style={{ color: '#555' }}>BUYHELP</span>
              <span>
                Código:{' '}
                <span className="font-mono" style={{ color: '#FF6600', fontSize: 9 }}>{cert.verification_code}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#FF6600', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.background = '#E55C00'}
            onMouseLeave={e => e.currentTarget.style.background = '#FF6600'}
          >
            <Download size={15} />
            Baixar Certificado (PDF)
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#A0A0A0'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
          >
            <Share2 size={15} />
            Compartilhar
          </button>
        </div>

      </div>
    </AppLayout>
  )
}
