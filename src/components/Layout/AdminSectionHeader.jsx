import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, BookOpen } from 'lucide-react'

const TABS = [
  { to: '/admin',          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/usuarios', label: 'Usuários',  icon: Users },
  { to: '/admin/trilhas',  label: 'Cursos',   icon: BookOpen },
]

export function AdminSectionHeader({ subtitle = 'Gestão e acompanhamento dos cursos' }) {
  const location = useLocation()

  function isActive(path) {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <div
      className="border-b"
      style={{ background: '#0D0D0D', borderColor: '#292929' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4">
        {/* Title row */}
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">BuyHelp Conecta</h1>
          <p className="text-sm mt-0.5" style={{ color: '#999999' }}>{subtitle}</p>
        </div>

        {/* Nav pills */}
        <div className="flex items-center gap-3">
          {TABS.map(({ to, label, icon: Icon }) => {
            const active = isActive(to)
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all"
                style={
                  active
                    ? {
                        background: '#FF6600',
                        color: '#fff',
                        boxShadow: '0px 4px 6px -4px rgba(249,115,22,0.2), 0px 10px 15px -3px rgba(249,115,22,0.2)',
                      }
                    : {
                        background: '#1A1919',
                        color: '#A1A1AA',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }
                }
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
