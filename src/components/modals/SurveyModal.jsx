import { useState } from 'react'
import { X, Star, ChevronRight, Check } from 'lucide-react'
import { Button } from '../ui/Button'

const STEPS = [
  {
    id: 'training',
    title: 'Avaliação do treinamento',
    subtitle: 'Como você avalia o conteúdo deste curso?',
    type: 'scale_10',
  },
  {
    id: 'platform',
    title: 'Avaliação da plataforma',
    subtitle: 'Como você avalia a experiência de uso da plataforma?',
    type: 'scale_10',
  },
  {
    id: 'nps',
    title: 'Indicação',
    subtitle: 'Em uma escala de 0 a 10, qual a probabilidade de você recomendar esta plataforma para um colega?',
    type: 'nps',
  },
]

function npsLabel(score) {
  if (score === null) return ''
  if (score <= 6) return 'Detrator'
  if (score <= 8) return 'Neutro'
  return 'Promotor'
}

function npsColor(score) {
  if (score === null) return 'text-text-secondary'
  if (score <= 6) return 'text-red-400'
  if (score <= 8) return 'text-yellow-400'
  return 'text-green-400'
}

export function SurveyModal({ trailTitle = 'Técnicas de Vendas', onClose, onSubmit }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ training: null, platform: null, nps: null })
  const [comments, setComments] = useState({ training: '', platform: '', nps: '' })
  const [done, setDone] = useState(false)

  const current = STEPS[step]

  function setScore(value) {
    setAnswers((a) => ({ ...a, [current.id]: value }))
  }

  function nextStep() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      setDone(true)
      onSubmit?.({ answers, comments })
    }
  }

  const currentScore = answers[current?.id]
  const isNPS = current?.type === 'nps'

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative bg-bg-elevated border border-white/10 rounded-card w-full max-w-sm p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <Check size={32} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Obrigado pelo feedback!</h3>
            <p className="text-text-secondary text-sm mt-1">Sua avaliação é muito importante para melhorarmos a plataforma.</p>
          </div>
          <Button onClick={onClose} className="w-full">Fechar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-bg-elevated border border-white/10 rounded-card w-full max-w-md p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">
              Pesquisa de satisfação
            </p>
            <p className="text-xs text-text-secondary mt-0.5">{trailTitle}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-white/10'}`}
            />
          ))}
        </div>

        {/* Question */}
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-semibold text-white">{current.title}</h3>
            <p className="text-sm text-text-secondary mt-1">{current.subtitle}</p>
          </div>

          {isNPS ? (
            <div className="space-y-3">
              <div className="flex gap-1.5 flex-wrap justify-center">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setScore(i)}
                    className={`nps-btn ${currentScore === i ? 'selected' : ''}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-text-secondary">
                <span>Improvável</span>
                <span>Muito provável</span>
              </div>
              {currentScore !== null && (
                <p className={`text-center text-sm font-semibold ${npsColor(currentScore)}`}>
                  {npsLabel(currentScore)}
                </p>
              )}
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setScore(n)}
                  className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all ${
                    currentScore === n
                      ? 'bg-primary border-primary text-white'
                      : 'bg-bg-base border-white/10 text-text-secondary hover:border-primary/50 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary">Comentário (opcional)</label>
            <textarea
              rows={2}
              value={comments[current.id]}
              onChange={(e) => setComments((c) => ({ ...c, [current.id]: e.target.value }))}
              placeholder="Deixe seu comentário..."
              className="w-full px-4 py-2.5 rounded-btn bg-bg-base border border-white/10 text-white text-sm focus:outline-none focus:border-primary resize-none placeholder-text-secondary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">{step + 1} / {STEPS.length}</span>
          <Button onClick={nextStep} disabled={currentScore === null}>
            {step < STEPS.length - 1 ? (
              <>Próxima <ChevronRight size={14} /></>
            ) : (
              <>Enviar <Check size={14} /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
