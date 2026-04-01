import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Lock, CheckCircle, Clock, BookOpen, Award, ChevronLeft, AlertCircle, Star } from 'lucide-react'
import { AppLayout } from '../components/Layout/AppLayout'
import { Card } from '../components/ui/Card'
import { Badge, LevelBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatProgress } from '../lib/utils'

const MOCK_TRAIL = {
  id: 't1',
  title: 'Técnicas de Vendas',
  description: 'Aprenda as melhores técnicas para vender mais e melhor. Esta trilha aborda desde a abordagem inicial até o fechamento da venda e pós-venda.',
  category: 'Vendas',
  level: 'INTERMEDIÁRIO',
  thumbnail: null,
  total_videos: 12,
  completed_videos: 9,
  has_evaluation: true,
  evaluation_id: 'e1',
  evaluation_passed: false,
  certificate_id: null,
  videos: [
    { id: 'v1', order_index: 1, title: 'Introdução às Técnicas de Vendas', duration_seconds: 720, level: 'INICIANTE', is_mandatory: true, completed: true, locked: false },
    { id: 'v2', order_index: 2, title: 'Identificando o Perfil do Cliente', duration_seconds: 960, level: 'INICIANTE', is_mandatory: true, completed: true, locked: false },
    { id: 'v3', order_index: 3, title: 'Técnicas de Abordagem', duration_seconds: 1080, level: 'INTERMEDIÁRIO', is_mandatory: true, completed: true, locked: false },
    { id: 'v4', order_index: 4, title: 'Apresentação do Produto', duration_seconds: 1320, level: 'INTERMEDIÁRIO', is_mandatory: false, completed: true, locked: false },
    { id: 'v5', order_index: 5, title: 'Técnica SPIN de Vendas', duration_seconds: 1860, level: 'INTERMEDIÁRIO', is_mandatory: true, completed: true, locked: false },
    { id: 'v6', order_index: 6, title: 'Tratamento de Objeções', duration_seconds: 1440, level: 'INTERMEDIÁRIO', is_mandatory: true, completed: true, locked: false },
    { id: 'v7', order_index: 7, title: 'Técnicas de Fechamento', duration_seconds: 1200, level: 'INTERMEDIÁRIO', is_mandatory: true, completed: true, locked: false },
    { id: 'v8', order_index: 8, title: 'Upsell e Cross-sell', duration_seconds: 900, level: 'AVANÇADO', is_mandatory: false, completed: true, locked: false },
    { id: 'v9', order_index: 9, title: 'Pós-venda e Fidelização', duration_seconds: 1140, level: 'INTERMEDIÁRIO', is_mandatory: true, completed: true, locked: false },
    { id: 'v10', order_index: 10, title: 'Métricas e Indicadores', duration_seconds: 1560, level: 'AVANÇADO', is_mandatory: false, completed: false, locked: false },
    { id: 'v11', order_index: 11, title: 'Vendas Consultivas', duration_seconds: 2040, level: 'AVANÇADO', is_mandatory: false, completed: false, locked: false },
    { id: 'v12', order_index: 12, title: 'Construindo Relacionamentos', duration_seconds: 1680, level: 'AVANÇADO', is_mandatory: false, completed: false, locked: true },
  ],
}

function fmtMin(seconds) {
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h${m % 60 > 0 ? ` ${m % 60}min` : ''}`
  return `${m} min`
}

export default function TrailDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const trail = MOCK_TRAIL
  const pct = formatProgress(trail.completed_videos, trail.total_videos)

  const mandatoryDone = trail.videos
    .filter((v) => v.is_mandatory)
    .every((v) => v.completed)

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          Voltar às trilhas
        </button>

        {/* Header card */}
        <Card className="overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-0">
            {/* Thumbnail */}
            <div className="h-48 sm:h-auto sm:w-72 flex-shrink-0 bg-bg-elevated flex items-center justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,102,0,0.15)' }}
              >
                <BookOpen size={36} className="text-primary" />
              </div>
            </div>

            {/* Info */}
            <div className="p-6 flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">{trail.category}</Badge>
                <LevelBadge level={trail.level} />
              </div>
              <h1 className="text-xl font-bold text-white">{trail.title}</h1>
              <p className="text-text-secondary text-sm leading-relaxed">{trail.description}</p>

              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Play size={13} /> {trail.total_videos} vídeos
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {fmtMin(trail.videos.reduce((a, v) => a + v.duration_seconds, 0))}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-text-secondary">{trail.completed_videos}/{trail.total_videos} concluídos</span>
                  <span className="text-sm font-bold text-primary">{pct}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Videos list */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Conteúdo da trilha
          </h2>
          <div className="space-y-2">
            {trail.videos.map((video) => (
              <Card
                key={video.id}
                onClick={video.locked ? undefined : () => navigate(`/video/${video.id}`)}
                className={`flex items-center gap-4 p-4 transition-colors ${
                  video.locked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-primary/30 cursor-pointer group'
                }`}
              >
                {/* Status icon */}
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-text-secondary">Aula {video.order_index}</span>
                    {video.is_mandatory && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Obrigatório</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white truncate">{video.title}</p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <LevelBadge level={video.level} />
                  <span className="text-xs text-text-secondary hidden sm:block">{fmtMin(video.duration_seconds)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Evaluation section */}
        {trail.has_evaluation && (
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
              <Button
                disabled={!mandatoryDone}
                onClick={() => navigate(`/avaliacao/${trail.evaluation_id}`)}
              >
                {trail.evaluation_passed ? 'Refazer' : 'Iniciar'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
