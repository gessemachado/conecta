import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { AUTH_FUNCTION_URL, SUPABASE_ANON_KEY_EXPORT } from '../lib/supabase'

// Decorative background symbols
const BG_SYMBOLS = [
  { char: '◇', x: '4%',  y: '18%', size: 28, rot: 15,  opacity: 0.18 },
  { char: '◇', x: '8%',  y: '60%', size: 20, rot: -10, opacity: 0.12 },
  { char: 'D', x: '2%',  y: '38%', size: 44, rot: 0,   opacity: 0.08 },
  { char: 'D', x: '88%', y: '22%', size: 48, rot: 5,   opacity: 0.10 },
  { char: '◇', x: '92%', y: '55%', size: 22, rot: 20,  opacity: 0.14 },
  { char: '◇', x: '85%', y: '75%', size: 18, rot: -15, opacity: 0.12 },
  { char: 'D', x: '14%', y: '80%', size: 36, rot: -5,  opacity: 0.09 },
  { char: '◇', x: '78%', y: '10%', size: 16, rot: 30,  opacity: 0.16 },
  { char: '✦', x: '55%', y: '5%',  size: 14, rot: 0,   opacity: 0.10 },
  { char: '✦', x: '20%', y: '92%', size: 12, rot: 0,   opacity: 0.10 },
  { char: '◇', x: '65%', y: '88%', size: 20, rot: 10,  opacity: 0.13 },
]

function BuyHelpLogo() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bag body */}
      <rect x="8" y="22" width="48" height="36" rx="6" fill="#FF6600"/>
      {/* Bag handle */}
      <path d="M22 22 C22 14 42 14 42 22" stroke="#FF6600" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* B letter */}
      <text x="32" y="47" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">B</text>
    </svg>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(AUTH_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY_EXPORT,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY_EXPORT}`,
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'E-mail ou senha inválidos')
      login(data.user, data.user.id.toString())
      navigate(data.user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.message || 'E-mail ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  function devLogin(role) {
    const creds = {
      admin: { email: 'admin@buyhelp.com', password: '123456' },
      user:  { email: 'joao.silva@techcenter.com', password: '123456' },
    }
    setEmail(creds[role].email)
    setPassword(creds[role].password)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-10 px-4 relative overflow-hidden" style={{ background: '#0e0e0e' }}>

      {/* Background decorative symbols */}
      {BG_SYMBOLS.map((s, i) => (
        <span
          key={i}
          className="absolute select-none pointer-events-none"
          style={{
            left: s.x,
            top: s.y,
            fontSize: s.size,
            opacity: s.opacity,
            color: '#FF6600',
            transform: `rotate(${s.rot}deg)`,
            fontWeight: 'bold',
            fontFamily: 'serif',
          }}
        >
          {s.char}
        </span>
      ))}

      {/* Top: Logo */}
      <div className="flex flex-col items-center gap-3 mt-6">
        <div className="flex items-center gap-3">
          <BuyHelpLogo />
          <span className="text-4xl font-extrabold text-white tracking-tight">BuyHelp</span>
        </div>
        <p className="text-sm" style={{ color: '#888' }}>Plataforma de Gestão BuyHelp</p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl p-7 space-y-5"
        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Card header */}
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} style={{ color: '#FF6600' }} />
          <h2 className="text-lg font-bold text-white">Acesso Seguro</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* E-mail */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white">E-mail</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#888' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-[#666] outline-none transition-all"
                style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-white">Senha</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#888' }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-[#666] outline-none transition-all"
                style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          </div>

          {/* Lembrar-me + Esqueceu */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-[#FF6600] cursor-pointer"
              />
              <span className="text-sm" style={{ color: '#A0A0A0' }}>Lembrar-me</span>
            </label>
            <button type="button" className="text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: '#FF6600' }}>
              Esqueceu a senha?
            </button>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50"
            style={{ background: '#FF6600' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#E55C00' }}
            onMouseLeave={e => e.currentTarget.style.background = '#FF6600'}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

      </div>

      {/* Footer */}
      <p className="text-xs" style={{ color: '#555' }}>
        © {new Date().getFullYear()} BuyHelp. Todos os direitos reservados.
      </p>
    </div>
  )
}
