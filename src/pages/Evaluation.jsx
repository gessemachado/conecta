import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Award, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { AppLayout } from '../components/Layout/AppLayout'
import { Button } from '../components/ui/Button'

const MOCK_EVAL = {
  id: 'e1',
  title: 'Avaliação — Técnicas de Vendas',
  trail_title: 'Técnicas de Vendas',
  trail_id: 't1',
  pass_score: 70,
  questions: [
    {
      id: 'q1',
      text: 'O que significa a sigla SPIN na técnica SPIN Selling?',
      options: [
        { id: 'a', text: 'Situação, Problema, Impacto, Negociação' },
        { id: 'b', text: 'Situação, Problema, Implicação, Necessidade de solução' },
        { id: 'c', text: 'Solução, Processo, Investigação, Negócio' },
        { id: 'd', text: 'Sistema, Produto, Identificação, Necessidade' },
      ],
      correct: 'b',
    },
    {
      id: 'q2',
      text: 'Qual é o principal objetivo da fase de "Situação" no SPIN Selling?',
      options: [
        { id: 'a', text: 'Criar urgência de compra no cliente' },
        { id: 'b', text: 'Apresentar o produto imediatamente' },
        { id: 'c', text: 'Coletar informações sobre o contexto atual do cliente' },
        { id: 'd', text: 'Fechar o negócio diretamente' },
      ],
      correct: 'c',
    },
    {
      id: 'q3',
      text: 'Na metodologia SPIN, as perguntas de "Implicação" servem para:',
      options: [
        { id: 'a', text: 'Descobrir se o cliente tem orçamento disponível' },
        { id: 'b', text: 'Ampliar a percepção do cliente sobre as consequências do problema' },
        { id: 'c', text: 'Apresentar as características do produto' },
        { id: 'd', text: 'Identificar o tomador de decisão' },
      ],
      correct: 'b',
    },
    {
      id: 'q4',
      text: 'O que é "upsell" em vendas?',
      options: [
        { id: 'a', text: 'Oferecer um produto complementar ao que o cliente já decidiu comprar' },
        { id: 'b', text: 'Convencer o cliente a adquirir uma versão superior ou mais cara do produto' },
        { id: 'c', text: 'Fazer desconto para fechar a venda mais rapidamente' },
        { id: 'd', text: 'Vender o mesmo produto para um novo cliente' },
      ],
      correct: 'b',
    },
    {
      id: 'q5',
      text: 'Qual das alternativas representa uma boa técnica de tratamento de objeções?',
      options: [
        { id: 'a', text: 'Ignorar a objeção e continuar apresentando o produto' },
        { id: 'b', text: 'Discordar firmemente do cliente para mostrar conhecimento' },
        { id: 'c', text: 'Reconhecer a objeção, validar o sentimento e esclarecer com dados' },
        { id: 'd', text: 'Oferecer desconto imediatamente para superar qualquer objeção' },
      ],
      correct: 'c',
    },
  ],
}

export default function Evaluation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const eval_ = MOCK_EVAL
  const total = eval_.questions.length

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const question = eval_.questions[current]
  const selected = answers[question.id]
  const progress = Math.round(((current + 1) / total) * 100)

  function selectAnswer(optId) {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [question.id]: optId }))
  }

  function next() {
    if (current < total - 1) setCurrent((c) => c + 1)
  }
  function prev() {
    if (current > 0) setCurrent((c) => c - 1)
  }

  function submit() {
    let correct = 0
    eval_.questions.forEach((q) => {
      if (answers[q.id] === q.correct) correct++
    })
    const s = Math.round((correct / total) * 100)
    setScore(s)
    setSubmitted(true)
  }

  const passed = score >= eval_.pass_score

  if (submitted) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto px-6 py-16 text-center space-y-6">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${
              passed ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}
          >
            {passed ? (
              <CheckCircle size={44} className="text-green-400" />
            ) : (
              <XCircle size={44} className="text-red-400" />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">{score}%</h1>
            <p className={`text-lg font-semibold mt-1 ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {passed ? 'Aprovado!' : 'Reprovado'}
            </p>
            <p className="text-text-secondary text-sm mt-2">
              Nota mínima: {eval_.pass_score}% · Você acertou{' '}
              {Math.round((score / 100) * total)}/{total} questões
            </p>
          </div>

          {passed ? (
            <div className="space-y-3">
              <p className="text-text-secondary text-sm">
                Parabéns! Você passou na avaliação e pode agora receber seu certificado.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={() => navigate(`/trilha/${eval_.trail_id}`)}>
                  Voltar ao curso
                </Button>
                <Button onClick={() => navigate(`/certificado/cert-${id}`)}>
                  <Award size={15} />
                  Ver certificado
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-text-secondary text-sm">
                Você não atingiu a nota mínima. Revise o conteúdo e tente novamente.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={() => navigate(`/trilha/${eval_.trail_id}`)}>
                  Revisar curso
                </Button>
                <Button onClick={() => { setSubmitted(false); setCurrent(0); setAnswers({}) }}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate(`/trilha/${eval_.trail_id}`)}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={16} />
            Voltar ao curso
          </button>
          <h1 className="text-xl font-bold text-white">{eval_.title}</h1>
          <p className="text-text-secondary text-sm mt-1">Nota mínima: {eval_.pass_score}%</p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2 text-xs text-text-secondary">
            <span>Questão {current + 1} de {total}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-bg-surface border border-white/[0.08] rounded-card p-6 space-y-5">
          <p className="text-white font-medium leading-relaxed">{question.text}</p>

          <div className="space-y-2.5">
            {question.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => selectAnswer(opt.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-btn border text-left transition-all ${
                  selected === opt.id
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-white/10 bg-bg-elevated text-white/80 hover:border-white/20 hover:text-white'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    selected === opt.id ? 'border-primary' : 'border-white/30'
                  }`}
                >
                  {selected === opt.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-sm">{opt.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={prev} disabled={current === 0}>
            <ChevronLeft size={15} />
            Anterior
          </Button>

          <div className="flex gap-1">
            {eval_.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current
                    ? 'bg-primary'
                    : answers[eval_.questions[i].id]
                    ? 'bg-primary/40'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {current < total - 1 ? (
            <Button onClick={next} disabled={!selected}>
              Próxima
              <ChevronRight size={15} />
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={Object.keys(answers).length < total}
            >
              Finalizar
              <CheckCircle size={15} />
            </Button>
          )}
        </div>

        {Object.keys(answers).length < total && current === total - 1 && (
          <div className="flex items-center gap-2 text-xs text-yellow-400 justify-center">
            <AlertCircle size={12} />
            Responda todas as questões para finalizar
          </div>
        )}
      </div>
    </AppLayout>
  )
}
