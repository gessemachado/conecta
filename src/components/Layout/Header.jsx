import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, ChevronDown, LogOut, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Avatar } from '../ui/Avatar'

const COLABORADOR_NAV = [
  { label: 'Home', to: '/' },
  { label: 'Trilhas', to: '/trilhas' },
  { label: 'Certificados', to: '/certificados' },
]

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const isAdmin = user?.role === 'admin'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0e0e0e] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-1.5 flex-shrink-0 mr-1">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <div className="leading-none">
            <span className="font-bold text-white text-sm">BuyHelp</span>
            <span className="text-sm font-normal" style={{ color: '#FF6600' }}> Conecta</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-btn text-xs font-semibold transition-all"
                style={location.pathname === '/admin' ? { color: '#FF6600' } : { color: '#A0A0A0' }}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/usuarios"
                className="px-3 py-1.5 rounded-btn text-xs font-semibold transition-all"
                style={location.pathname === '/admin/usuarios' ? { color: '#FF6600' } : { color: '#A0A0A0' }}
              >
                Usuários
              </Link>
              <Link
                to="/admin/trilhas"
                className="px-3 py-1.5 rounded-btn text-xs font-semibold transition-all"
                style={location.pathname.startsWith('/admin/trilhas') ? { color: '#FF6600' } : { color: '#A0A0A0' }}
              >
                Trilhas
              </Link>
            </>
          ) : (
            COLABORADOR_NAV.map(({ label, to }) => {
              const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
              return (
                <Link
                  key={to}
                  to={to}
                  className="px-3 py-1.5 rounded-btn text-xs font-semibold transition-all"
                  style={active
                    ? { background: 'rgba(255,102,0,0.12)', color: '#FF6600', border: '1px solid rgba(255,102,0,0.2)' }
                    : { color: '#A0A0A0' }
                  }
                >
                  {label}
                </Link>
              )
            })
          )}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-btn text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
            <Search size={15} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-btn text-text-secondary hover:text-white hover:bg-white/5 transition-colors relative">
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
          </button>

          {/* User */}
          <div className="relative ml-1">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1 rounded-btn hover:bg-white/5 transition-colors"
            >
              <Avatar name={user?.name || ''} size="sm" />
              <span className="hidden sm:block text-sm font-medium text-white max-w-[100px] truncate">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown size={12} className="text-text-secondary" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-bg-elevated border border-white/10 rounded-card shadow-xl z-50 py-1">
                  <div className="px-3 py-2.5 border-b border-white/10">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-text-secondary truncate capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={13} />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
