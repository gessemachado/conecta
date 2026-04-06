import { useState, useEffect } from 'react'
import { Plus, Trash2, Video, Search, Loader2, Filter, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/Layout/AppLayout'
import { AdminSectionHeader } from '../../components/Layout/AdminSectionHeader'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['Todas']

export default function AdminTrails() {
  const navigate = useNavigate()
  const [trails, setTrails] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('trails')
        .select('*, videos(count), is_published')
        .order('order_index')
      if (!error && data) {
        setTrails(data.map(t => ({
          ...t,
          total_videos: t.videos?.[0]?.count ?? 0,
          total_evaluations: 0,
          enrolled: 0,
          is_published: t.is_published ?? false,
          is_new: false,
        })))
      }
      setLoading(false)
    }
    load()
  }, [])

  const allCategories = ['Todas', ...new Set(trails.map(t => t.category).filter(Boolean))]

  const filtered = trails.filter((t) => {
    const matchCat = category === 'Todas' || t.category === category
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  async function handleDelete(id) {
    if (confirm('Remover este curso?')) {
      await supabase.from('trails').delete().eq('id', id)
      setTrails((ts) => ts.filter((t) => t.id !== id))
    }
  }

  return (
    <AppLayout>
      <AdminSectionHeader subtitle="Gestão de cursos de aprendizado" />

      <div className="max-w-6xl mx-auto px-6 py-7 space-y-6">

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: '#FF6600' }} />
          </div>
        )}


        {/* ── Filters ── */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,102,0,0.15)' }}>
              <Filter size={13} style={{ color: '#FF6600' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Filtros</p>
              <p className="text-xs" style={{ color: '#A0A0A0' }}>Pesquise e filtre os cursos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#5A5A5A' }} />
              <input
                type="text"
                placeholder="Buscar por nome do curso..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-[#5A5A5A] focus:outline-none transition-colors"
                style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm text-white focus:outline-none cursor-pointer"
              style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {allCategories.map(c => <option key={c} value={c}>{c === 'Todas' ? 'Trilha' : c}</option>)}
            </select>

            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: '#FF6600', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.background = '#E55C00'}
              onMouseLeave={e => e.currentTarget.style.background = '#FF6600'}
            >
              <Search size={14} />
              Pesquisar
            </button>

            <button
              onClick={() => { setSearch(''); setCategory('Todas') }}
              className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
              style={{ color: '#A0A0A0' }}
            >
              <X size={13} /> Limpar
            </button>

            <span className="text-sm font-medium whitespace-nowrap" style={{ color: '#A0A0A0' }}>
              {filtered.length} resultados
            </span>
          </div>
        </div>

        {/* Trail cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((trail) => (
            <div
              key={trail.id}
              className="rounded-xl overflow-hidden flex flex-col"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Thumbnail */}
              <div className="relative h-44 overflow-hidden bg-bg-elevated">
                {trail.thumbnail ? (
                  <img
                    src={trail.thumbnail}
                    alt={trail.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #1a1a1a, #222)' }} />
                )}
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)' }}
                />

                {/* Category / NEW badge */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {trail.is_new ? (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                      style={{ background: '#22C55E', color: '#fff' }}
                    >
                      NOVO
                    </span>
                  ) : (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                      style={{ background: 'rgba(255,102,0,0.85)', color: '#fff' }}
                    >
                      {trail.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Title */}
                <h3 className="font-semibold text-white text-sm leading-snug">{trail.title}</h3>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs" style={{ color: '#A0A0A0' }}>
                  <span className="flex items-center gap-1">
                    <Video size={11} />
                    {trail.total_videos} vídeos
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={
                      trail.is_published
                        ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E' }
                        : { background: 'rgba(255,255,255,0.06)', color: '#A0A0A0' }
                    }
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: trail.is_published ? '#22C55E' : '#5A5A5A' }}
                    />
                    {trail.is_published ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center gap-4 pt-2 mt-auto"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <button
                    onClick={() => navigate(`/admin/trilhas/editar/${trail.id}`)}
                    className="text-xs font-semibold uppercase tracking-wider transition-colors hover:text-white"
                    style={{ color: '#A0A0A0' }}
                  >
                    Editar
                  </button>
                  <button
                    className="text-xs font-semibold uppercase tracking-wider transition-colors hover:text-white"
                    style={{ color: '#A0A0A0' }}
                  >
                    Detalhes
                  </button>
                  <button
                    onClick={() => handleDelete(trail.id)}
                    className="ml-auto p-1.5 rounded-btn transition-colors hover:bg-red-500/10"
                    style={{ color: '#5A5A5A' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#5A5A5A'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Create new trail card */}
          <div
            className="rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[280px] transition-colors"
            style={{ background: '#111111', border: '1px dashed rgba(255,255,255,0.12)' }}
            onClick={() => navigate('/admin/trilhas/criar')}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,102,0,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ border: '2px dashed rgba(255,255,255,0.15)' }}
            >
              <Plus size={20} style={{ color: '#5A5A5A' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: '#A0A0A0' }}>Criar novo curso</p>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-semibold"
              style={{ background: '#FF6600', color: '#fff' }}
            >
              <Plus size={14} />
              Adicionar
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
