import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { AUTH_FUNCTION_URL, SUPABASE_ANON_KEY_EXPORT } from '../lib/supabase'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="min-h-screen bg-bg-base flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1a0f00 50%, #0A0A0A 100%)',
        }}
      >
        {/* BG decoration */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(circle at 30% 50%, #FF6600 0%, transparent 60%)',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <div>
              <p className="font-bold text-white text-lg leading-tight">BuyHelp</p>
              <p className="text-primary text-xs font-semibold tracking-widest">CONECTA</p>
            </div>
          </div>
        </div>

        <div className="relative space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Sua plataforma<br />
            de <span className="text-primary">treinamento</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-sm">
            Capacite sua equipe, acompanhe o progresso e emita certificados — tudo em um só lugar.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: '312', label: 'Colaboradores' },
              { value: '87', label: 'Vídeos' },
              { value: '1.248', label: 'Certificados' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-card p-4">
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-text-secondary mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-text-secondary">
          © {new Date().getFullYear()} BuyHelp Conecta
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:max-w-md lg:mx-auto w-full">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">BuyHelp</p>
              <p className="text-primary text-[10px] font-semibold tracking-widest">CONECTA</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Entrar</h2>
            <p className="text-text-secondary text-sm mt-1">
              Acesse sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-btn bg-bg-elevated border border-white/10 text-white placeholder-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-10 rounded-btn bg-bg-elevated border border-white/10 text-white placeholder-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs text-primary hover:text-primary-hover transition-colors">
                Esqueci minha senha
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-btn px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-btn transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-xs text-text-secondary">
            Não tem uma conta?{' '}
            <span className="text-white/60">Contate sua rede</span>
          </p>

          {/* Dev shortcuts */}
          {import.meta.env.DEV && (
            <div className="border-t border-white/10 pt-4 space-y-2">
              <p className="text-xs text-text-secondary text-center">Dev: entrar como</p>
              <div className="flex gap-2">
                <button onClick={() => devLogin('user')} className="flex-1 text-xs py-2 bg-white/5 hover:bg-white/10 rounded-btn text-white/60 transition-colors">
                  Colaborador
                </button>
                <button onClick={() => devLogin('admin')} className="flex-1 text-xs py-2 bg-primary/10 hover:bg-primary/20 rounded-btn text-primary transition-colors">
                  Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
