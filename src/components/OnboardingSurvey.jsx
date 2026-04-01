import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

function ScoreRow({ values, selected, onClick }) {
  return (
    <div className="flex gap-2">
      {values.map(n => {
        const isSelected = selected === n
        return (
          <button
            key={n}
            onClick={() => onClick(n)}
            className="flex-1 h-10 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: isSelected ? '#FF6600' : 'rgba(255,255,255,0.07)',
              color: isSelected ? '#fff' : '#A0A0A0',
            }}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

function Step1({ data, onChange, onNext, onSkip }) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-bold text-white">Como foi a implantação da BuyHelp?</h2>
        <p className="text-xs mt-1" style={{ color: '#A0A0A0' }}>
          De 1 a 10, como você avalia o processo de implantação?
        </p>
      </div>

      <div className="space-y-2">
        <ScoreRow values={[1,2,3,4,5,6,7,8,9,10]} selected={data.implantation_score} onClick={v => onChange('implantation_score', v)} />
        <div className="flex justify-between text-[11px]" style={{ color: '#5A5A5A' }}>
          <span>Muito ruim</span>
          <span>Excelente</span>
        </div>
      </div>

      <div>
        <label className="block text-xs mb-1.5" style={{ color: '#A0A0A0' }}>Comentários adicionais (opcional)</label>
        <textarea
          value={data.implantation_comment}
          onChange={e => onChange('implantation_comment', e.target.value)}
          placeholder="Compartilhe sua experiência com a implantação..."
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-[#5A5A5A] focus:outline-none resize-none"
          style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onSkip}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#A0A0A0' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
        >
          Pular
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: '#FF6600', color: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.background = '#E55C00'}
          onMouseLeave={e => e.currentTarget.style.background = '#FF6600'}
        >
          Próxima
        </button>
      </div>
    </div>
  )
}

function Step2({ data, onChange, onNext, onBack }) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-bold text-white">Como foi o treinamento?</h2>
        <p className="text-xs mt-1" style={{ color: '#A0A0A0' }}>
          De 1 a 10, como você avalia o conteúdo dos vídeos de treinamento?
        </p>
      </div>

      <div className="space-y-2">
        <ScoreRow values={[1,2,3,4,5,6,7,8,9,10]} selected={data.training_score} onClick={v => onChange('training_score', v)} />
        <div className="flex justify-between text-[11px]" style={{ color: '#5A5A5A' }}>
          <span>Muito ruim</span>
          <span>Excelente</span>
        </div>
      </div>

      <div>
        <label className="block text-xs mb-1.5" style={{ color: '#A0A0A0' }}>Comentários adicionais (opcional)</label>
        <textarea
          value={data.training_comment}
          onChange={e => onChange('training_comment', e.target.value)}
          placeholder="Compartilhe sua opinião sobre o treinamento..."
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-[#5A5A5A] focus:outline-none resize-none"
          style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#A0A0A0' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
        >
          <ChevronLeft size={14} /> Voltar
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: '#FF6600', color: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.background = '#E55C00'}
          onMouseLeave={e => e.currentTarget.style.background = '#FF6600'}
        >
          Próxima
        </button>
      </div>
    </div>
  )
}

const NPS_CLASSES = [
  { label: 'Detrator', range: '0-6', min: 0, max: 6, color: '#EF4444', bg: '#3a1a1a' },
  { label: 'Neutro',   range: '7-8', min: 7, max: 8, color: '#C8A800', bg: '#2e2a10' },
  { label: 'Promotor', range: '9-10', min: 9, max: 10, color: '#22C55E', bg: '#0f2a1a' },
]

function Step3({ data, onChange, onBack, onSubmit, submitting }) {
  const score = data.nps_score
  const activeClass = score !== null && score !== undefined
    ? NPS_CLASSES.find(c => score >= c.min && score <= c.max)
    : null

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-bold text-white">Net Promoter Score (NPS)</h2>
        <p className="text-xs mt-1" style={{ color: '#A0A0A0' }}>
          De 0 a 10, qual a probabilidade de você recomendar a BuyHelp para um colega?
        </p>
      </div>

      <div className="space-y-2">
        <ScoreRow values={[0,1,2,3,4,5,6,7,8,9]} selected={data.nps_score} onClick={v => onChange('nps_score', v)} />
        <div className="flex gap-2">
          <button
            onClick={() => onChange('nps_score', 10)}
            className="h-10 px-5 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: data.nps_score === 10 ? '#FF6600' : 'rgba(255,255,255,0.07)',
              color: data.nps_score === 10 ? '#fff' : '#A0A0A0',
            }}
          >
            10
          </button>
        </div>
        <div className="flex justify-between text-[11px]" style={{ color: '#5A5A5A' }}>
          <span>Nada provável</span>
          <span>Muito provável</span>
        </div>

        {/* Classification boxes */}
        <div className="flex gap-2 pt-1">
          {NPS_CLASSES.map(c => {
            const isActive = activeClass?.label === c.label
            return (
              <div
                key={c.label}
                className="flex-1 rounded-lg py-2 text-center transition-all"
                style={{
                  background: isActive ? c.bg : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? c.color + '55' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <p className="text-xs font-bold" style={{ color: isActive ? c.color : '#5A5A5A' }}>{c.range}</p>
                <p className="text-[11px] mt-0.5" style={{ color: isActive ? c.color : '#5A5A5A' }}>{c.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs mb-1.5" style={{ color: '#A0A0A0' }}>Por que você deu esta nota? (opcional)</label>
        <textarea
          value={data.nps_reason}
          onChange={e => onChange('nps_reason', e.target.value)}
          placeholder="Conte-nos o motivo da sua avaliação..."
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-[#5A5A5A] focus:outline-none resize-none"
          style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#A0A0A0' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
        >
          <ChevronLeft size={14} /> Voltar
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
          style={{ background: '#FF6600', color: '#fff' }}
          onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#E55C00' }}
          onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = '#FF6600' }}
        >
          <Check size={14} /> Enviar Avaliação
        </button>
      </div>
    </div>
  )
}

export function OnboardingSurvey({ userId, onDone }) {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState({
    implantation_score: null,
    implantation_comment: '',
    training_score: null,
    training_comment: '',
    nps_score: null,
    nps_reason: '',
  })

  function onChange(field, value) {
    setData(d => ({ ...d, [field]: value }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    const { supabase } = await import('../lib/supabase')
    await supabase.from('onboarding_surveys').upsert(
      { user_id: userId, ...data },
      { onConflict: 'user_id' }
    )
    setSubmitting(false)
    onDone()
  }

  async function handleSkip() {
    const { supabase } = await import('../lib/supabase')
    await supabase.from('onboarding_surveys').upsert(
      { user_id: userId },
      { onConflict: 'user_id' }
    )
    onDone()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-6">
          {[1,2,3].map(s => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-all"
              style={{ background: s <= step ? '#FF6600' : 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>

        {step === 1 && <Step1 data={data} onChange={onChange} onNext={() => setStep(2)} onSkip={handleSkip} />}
        {step === 2 && <Step2 data={data} onChange={onChange} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step3 data={data} onChange={onChange} onBack={() => setStep(2)} onSubmit={handleSubmit} submitting={submitting} />}
      </div>
    </div>
  )
}
