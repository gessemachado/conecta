import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { AUTH_FUNCTION_URL, SUPABASE_ANON_KEY_EXPORT } from '../lib/supabase'

const BG_ICONS = [
  { top: '8%',  left: '3%',  size: 32, rotate: -20, color: '#00897B' },
  { top: '18%', left: '12%', size: 24, rotate: 15,  color: '#00897B' },
  { top: '35%', left: '5%',  size: 28, rotate: -10, color: '#FF6600', opacity: 0.15 },
  { top: '55%', left: '2%',  size: 22, rotate: 20,  color: '#00897B' },
  { top: '72%', left: '8%',  size: 30, rotate: -25, color: '#00897B' },
  { top: '85%', left: '15%', size: 20, rotate: 10,  color: '#00897B' },
  { top: '5%',  left: '78%', size: 26, rotate: 30,  color: '#00897B' },
  { top: '20%', left: '88%', size: 20, rotate: -15, color: '#00897B' },
  { top: '40%', left: '92%', size: 32, rotate: 10,  color: '#00897B' },
  { top: '60%', left: '85%', size: 24, rotate: -30, color: '#00897B' },
  { top: '75%', left: '90%', size: 28, rotate: 20,  color: '#FF6600', opacity: 0.15 },
  { top: '90%', left: '80%', size: 22, rotate: -10, color: '#00897B' },
  { top: '12%', left: '30%', size: 18, rotate: 25,  color: '#00897B' },
  { top: '88%', left: '45%', size: 20, rotate: -20, color: '#00897B' },
  { top: '92%', left: '62%', size: 16, rotate: 15,  color: '#00897B' },
]

function BuyHelpBagIcon({ size = 32, color = '#FF6600', rotate = 0, opacity = 0.25 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rotate}deg)`, opacity }}
    >
      <path
        d="M8 12h24l-3 20H11L8 12z"
        fill={color}
        fillOpacity="0.6"
      />
      <path
        d="M15 12c0-2.76 2.24-5 5-5s5 2.24 5 5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fontSize="11"
        fontWeight="bold"
        fill="white"
        fontFamily="Arial, sans-serif"
      >
        B
      </text>
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
    <div
      className="min-h-screen flex flex-col items-center justify-between py-10 px-4 relative overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      {/* Background scattered icons */}
      {BG_ICONS.map((icon, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{ top: icon.top, left: icon.left }}
        >
          <BuyHelpBagIcon
            size={icon.size}
            color={icon.color}
            rotate={icon.rotate}
            opacity={icon.opacity ?? 0.25}
          />
        </div>
      ))}

      {/* Orange glow behind logo */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '0%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 400,
          height: 300,
          background: 'radial-gradient(ellipse at center, rgba(255,102,0,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <div className="relative flex flex-col items-center gap-2 mt-6">
        <div className="flex items-center gap-3">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="56" height="56" rx="14" fill="#FF6600" />
            <path
              d="M18 22h20l-2.5 18H20.5L18 22z"
              fill="rgba(0,0,0,0.35)"
            />
            <path
              d="M22 22c0-3.31 2.69-6 6-6s6 2.69 6 6"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <text
              x="28"
              y="37"
              textAnchor="middle"
              fontSize="13"
              fontWeight="bold"
              fill="white"
              fontFamily="Arial, sans-serif"
            >
              B
            </text>
          </svg>
          <span className="text-4xl font-bold text-white">BuyHelp</span>
        </div>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>Plataforma de Gestão BuyHelp</p>
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-2xl p-8"
        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
      >
        {/* Card title */}
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck size={20} color="#FF6600" />
          <h2 className="text-lg font-semibold text-white">Acesso Seguro</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* E-mail */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: '#111111',
                  border: '1px solid #2a2a2a',
                  focusRingColor: '#FF6600',
                }}
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                style={{ background: '#111111', border: '1px solid #2a2a2a' }}
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
            </div>
          </div>

          {/* Lembrar + Esqueceu */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#9CA3AF' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#FF6600' }}
              />
              Lembrar-me
            </label>
            <button type="button" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#FF6600' }}>
              Esqueceu a senha?
            </button>
          </div>

          {error && (
            <div className="rounded-lg px-4 py-3 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#FF6600' }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#e55a00' }}
            onMouseLeave={e => { if (!loading) e.target.style.background = '#FF6600' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Dev shortcuts */}
        {import.meta.env.DEV && (
          <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid #2a2a2a' }}>
            <p className="text-xs text-center" style={{ color: '#6B7280' }}>Dev: entrar como</p>
            <div className="flex gap-2">
              <button onClick={() => devLogin('user')} className="flex-1 text-xs py-2 rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}>
                Colaborador
              </button>
              <button onClick={() => devLogin('admin')} className="flex-1 text-xs py-2 rounded-lg transition-colors" style={{ background: 'rgba(255,102,0,0.1)', color: '#FF6600' }}>
                Admin
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="relative text-xs" style={{ color: '#6B7280' }}>
        © {new Date().getFullYear()} BuyHelp. Todos os direitos reservados.
      </p>
    </div>
  )
}
