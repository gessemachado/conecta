import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Plus, Trash2, GripVertical, ImageIcon, X, ChevronRight, Video, Clock, FileVideo, ArrowRight, Loader2 } from 'lucide-react'
import { AppLayout } from '../../components/Layout/AppLayout'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['Vendas', 'Atendimento', 'Produto', 'Gestão', 'Compliance', 'Operações']
const LEVELS = ['INICIANTE', 'INTERMEDIÁRIO', 'AVANÇADO']

const LEVEL_STYLE = {
  INICIANTE:     { bg: 'rgba(34,197,94,0.2)',  color: '#22C55E' },
  'INTERMEDIÁRIO': { bg: 'rgba(234,179,8,0.2)',  color: '#EAB308' },
  AVANÇADO:      { bg: 'rgba(239,68,68,0.2)',   color: '#EF4444' },
}

const MOCK_EVALUATIONS = [
  'Avaliação Final — Técnicas de Vendas',
  'Avaliação Final — Atendimento ao Cliente',
  'Avaliação Final — Conhecendo os Produtos',
]

const MOCK_VIDEOS_CATALOG = [
  { id: 'v1', title: 'Introdução às Técnicas de Vendas', level: 'INICIANTE', duration_seconds: 720 },
  { id: 'v5', title: 'Técnica SPIN de Vendas', level: 'INTERMEDIÁRIO', duration_seconds: 1860 },
  { id: 'v10', title: 'Fundamentos do Atendimento', level: 'INICIANTE', duration_seconds: 840 },
]

function fmtMin(s) {
  return Math.floor(s / 60) + ' min'
}

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0 w-10 h-5 rounded-full transition-colors"
      style={{ background: value ? '#FF6600' : 'rgba(255,255,255,0.12)' }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
        style={{ left: value ? '22px' : '2px' }}
      />
    </button>
  )
}

function getEmbedUrl(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const id = u.searchParams.get('v') || u.pathname.split('/').pop()
      return `https://www.youtube.com/embed/${id}`
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').pop()
      return `https://player.vimeo.com/video/${id}`
    }
    // direct MP4 or other — use as-is
    return url
  } catch { return null }
}

function VideoModal({ onClose, onAdd }) {
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [previewSrc, setPreviewSrc] = useState(null)
  const [previewType, setPreviewType] = useState(null)
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', video_url: '',
    duration: '', level: 'INICIANTE', is_mandatory: false,
  })

  async function handleFile(file) {
    if (!file) return
    const name = file.name.replace(/\.[^.]+$/, '')
    setForm(f => ({ ...f, title: f.title || name }))
    setPreviewSrc(URL.createObjectURL(file))
    setPreviewType('file')

    // Upload to Supabase Storage
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('videos').upload(path, file, { upsert: true })
    if (!error) {
      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(path)
      setForm(f => ({ ...f, video_url: urlData.publicUrl }))
    }
    setUploading(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  function handleLoadUrl() {
    if (!urlInput.trim()) return
    const embed = getEmbedUrl(urlInput.trim())
    const isEmbed = urlInput.includes('youtube') || urlInput.includes('youtu.be') || urlInput.includes('vimeo')
    setForm(f => ({ ...f, video_url: urlInput.trim() }))
    setPreviewSrc(embed)
    setPreviewType(isEmbed ? 'embed' : 'direct')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title) return
    const mins = parseInt(form.duration) || 0
    onAdd({
      id: `v${Date.now()}`,
      title: form.title,
      description: form.description,
      video_url: form.video_url,
      level: form.level,
      duration_seconds: mins * 60,
      is_mandatory: form.is_mandatory,
      order_index: 0,
    })
  }

  const inputStyle = {
    background: '#0D0D0D',
    border: '1px solid rgba(255,255,255,0.1)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-xl shadow-2xl my-auto"
        style={{ background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Adicionar Vídeo à Trilha</h3>
              <p className="text-xs mt-0.5" style={{ color: '#5A5A5A' }}>
                Faça{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="underline"
                  style={{ color: '#FF6600' }}
                >
                  upload
                </button>
                {' '}de um arquivo ou cole um{' '}
                <button type="button" className="underline" style={{ color: '#FF6600' }}>link</button>
              </p>
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors mt-0.5">
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-6 space-y-4">
            {/* Preview player OR drop zone */}
            {previewSrc ? (
              <div className="rounded-lg overflow-hidden relative" style={{ background: '#000' }}>
                {previewType === 'embed' ? (
                  <iframe
                    src={previewSrc}
                    className="w-full"
                    style={{ height: '300px' }}
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                  />
                ) : (
                  <video
                    src={previewSrc}
                    controls
                    className="w-full"
                    style={{ maxHeight: '300px' }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => { setPreviewSrc(null); setPreviewType(null); setUrlInput(''); setForm(f => ({ ...f, video_url: '' })) }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ background: 'rgba(0,0,0,0.7)' }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div
                className="rounded-lg flex flex-col items-center justify-center gap-2 py-8 cursor-pointer transition-colors"
                style={{
                  border: `1px dashed ${dragOver ? '#FF6600' : 'rgba(255,255,255,0.12)'}`,
                  background: dragOver ? 'rgba(255,102,0,0.04)' : '#0D0D0D',
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileVideo size={28} style={{ color: '#3A3A3A' }} />
                <p className="text-sm font-medium text-white">Clique ou arraste o vídeo aqui</p>
                <p className="text-xs" style={{ color: '#5A5A5A' }}>MP4, MOV, AVI, WebM • até 2 GB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />

            {/* OU LINK divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-xs font-semibold tracking-widest" style={{ color: '#3A3A3A' }}>OU LINK</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* URL field */}
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLoadUrl()}
                className="flex-1 px-3 py-2.5 rounded-btn text-sm text-white outline-none transition-colors"
                style={inputStyle}
                placeholder="URL do YouTube, Vimeo ou link direto de MP4"
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button
                type="button"
                onClick={handleLoadUrl}
                className="w-10 h-10 rounded-btn flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background: '#FF6600', color: '#fff' }}
                onMouseEnter={e => e.currentTarget.style.background = '#E55C00'}
                onMouseLeave={e => e.currentTarget.style.background = '#FF6600'}
              >
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Título */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: '#A0A0A0' }}>
                Título *
              </label>
              <input
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-btn text-sm text-white outline-none transition-colors"
                style={inputStyle}
                placeholder="Ex: Abertura de Caixa e Sangria"
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: '#A0A0A0' }}>Descrição</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-btn text-sm text-white outline-none resize-none transition-colors"
                style={inputStyle}
                placeholder="Descreva brevemente o conteúdo do vídeo..."
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Nível + Duração */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: '#A0A0A0' }}>Nível</label>
                <select
                  value={form.level}
                  onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-btn text-sm text-white outline-none"
                  style={inputStyle}
                >
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: '#A0A0A0' }}>Duração (m/s)</label>
                <input
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-btn text-sm text-white outline-none transition-colors"
                  style={inputStyle}
                  placeholder="Ex: 15"
                  onFocus={e => e.target.style.borderColor = '#FF6600'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {/* Vídeo obrigatório toggle */}
            <div className="flex items-center gap-3">
              <Toggle value={form.is_mandatory} onChange={v => setForm(f => ({ ...f, is_mandatory: v }))} />
              <span className="text-sm" style={{ color: '#A0A0A0' }}>Vídeo obrigatório</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-btn text-sm font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A0A0A0'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 py-2.5 rounded-btn text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: '#FF6600', color: '#fff' }}
                onMouseEnter={e => { if (!uploading) e.currentTarget.style.background = '#E55C00' }}
                onMouseLeave={e => e.currentTarget.style.background = '#FF6600'}
              >
                {uploading && <Loader2 size={14} className="animate-spin" />}
                {uploading ? 'Enviando...' : 'Salvar Vídeo'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CreateTrail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Vendas',
    order: '',
    targetColaborador: true,
    targetAdmin: false,
  })
  const [videos, setVideos] = useState([])
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(isEdit)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    async function loadTrail() {
      const { data: trail } = await supabase
        .from('trails')
        .select('*')
        .eq('id', id)
        .single()
      if (trail) {
        setForm({
          title: trail.title || '',
          description: trail.description || '',
          category: trail.category || 'Vendas',
          order: trail.order_index?.toString() || '',
          targetColaborador: trail.target_roles?.includes('employee') ?? true,
          targetAdmin: trail.target_roles?.includes('admin') ?? false,
        })
        if (trail.thumbnail) setThumbnail(trail.thumbnail)
      }
      const { data: vids } = await supabase
        .from('videos')
        .select('*')
        .eq('trail_id', id)
        .order('order_index')
      if (vids) {
        setVideos(vids.map(v => ({
          id: v.id,
          title: v.title,
          video_url: v.url || '',
          level: v.level || 'INICIANTE',
          duration_seconds: (v.duration_min || 0) * 60,
          is_mandatory: v.is_mandatory || false,
          order_index: v.order_index,
        })))
      }
      setLoadingEdit(false)
    }
    loadTrail()
  }, [id, isEdit])

  function handleAddVideo(video) {
    setVideos(vs => [...vs, { ...video, order_index: vs.length + 1 }])
    setShowVideoModal(false)
  }

  function handleRemoveVideo(vid) {
    setVideos(vs => vs.filter(v => v.id !== vid).map((v, i) => ({ ...v, order_index: i + 1 })))
  }

  function handleThumbnail(e) {
    const file = e.target.files[0]
    if (file) {
      setThumbnailFile(file)
      setThumbnail(URL.createObjectURL(file))
    }
  }

  async function handleSave(publish) {
    if (!form.title.trim()) { setError('O título da trilha é obrigatório.'); return }
    setError('')
    setSaving(true)
    try {
      // 1. Upload thumbnail if provided
      let thumbnailUrl = null
      if (thumbnailFile) {
        const ext = thumbnailFile.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('images')
          .upload(path, thumbnailFile, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
          thumbnailUrl = urlData.publicUrl
        }
      }

      // 2. Insert or update trail
      const targetRoles = [
        ...(form.targetColaborador ? ['employee'] : []),
        ...(form.targetAdmin ? ['admin'] : []),
      ]
      const trailPayload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        thumbnail: thumbnailUrl ?? (isEdit ? thumbnail : null),
        order_index: form.order ? parseInt(form.order) : null,
        target_roles: targetRoles,
        is_published: publish,
      }

      let trailId
      if (isEdit) {
        const { error: trailErr } = await supabase
          .from('trails')
          .update(trailPayload)
          .eq('id', id)
        if (trailErr) throw new Error(trailErr.message)
        trailId = id
      } else {
        const { data: trail, error: trailErr } = await supabase
          .from('trails')
          .insert(trailPayload)
          .select()
          .single()
        if (trailErr) throw new Error(trailErr.message)
        trailId = trail.id
      }

      // 3. Sync videos — delete existing then re-insert
      if (isEdit) {
        await supabase.from('videos').delete().eq('trail_id', trailId)
      }
      if (videos.length > 0) {
        const videoRows = videos.map((v, i) => ({
          trail_id: trailId,
          title: v.title,
          url: v.video_url || null,
          level: v.level,
          duration_min: Math.round((v.duration_seconds || 0) / 60),
          is_mandatory: v.is_mandatory,
          order_index: i + 1,
        }))
        const { error: vidErr } = await supabase.from('videos').insert(videoRows)
        if (vidErr) throw new Error(vidErr.message)
      }

      navigate('/admin/trilhas')
    } catch (err) {
      setError(err.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loadingEdit) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin" style={{ color: '#FF6600' }} />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-7 space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm" style={{ color: '#5A5A5A' }}>
          <Link to="/admin/trilhas" className="hover:text-white transition-colors">Trilhas</Link>
          <ChevronRight size={13} />
          <span style={{ color: '#A0A0A0' }}>{isEdit ? 'Editar Trilha' : 'Nova Trilha'}</span>
        </div>

        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold text-white">{isEdit ? 'Editar Trilha' : 'Criar Nova Trilha'}</h1>
          <p className="text-sm mt-1" style={{ color: '#A0A0A0' }}>
            Configure os detalhes, vídeos e avaliações para sua nova jornada de treinamento.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* LEFT — 2/3 */}
          <div className="lg:col-span-2 space-y-5">

            {/* Section 1 — Informações */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Section header */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: '#FF6600' }}
                >
                  1
                </div>
                <h2 className="text-sm font-semibold text-white">Informações da Trilha</h2>
              </div>

              <div className="p-5 space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A5A' }}>
                    Título da Trilha *
                  </label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-btn text-sm text-white outline-none transition-colors"
                    style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="Ex: Técnicas de Vendas Avançadas"
                    onFocus={e => e.target.style.borderColor = '#FF6600'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A5A' }}>
                    Descrição
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-btn text-sm text-white outline-none resize-none transition-colors"
                    style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="Descreva o objetivo desta trilha..."
                    onFocus={e => e.target.style.borderColor = '#FF6600'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {/* Categoria + Ordem */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A5A' }}>
                      Categoria *
                    </label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-btn text-sm text-white outline-none"
                      style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A5A' }}>
                      Ordem de Exibição
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.order}
                      onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-btn text-sm text-white outline-none"
                      style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}
                      placeholder="1"
                    />
                  </div>
                </div>

                {/* Público-alvo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A5A' }}>
                    Público-Alvo
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, targetColaborador: !f.targetColaborador }))}
                      className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                      style={
                        form.targetColaborador
                          ? { background: '#FF6600', color: '#fff' }
                          : { background: 'rgba(255,255,255,0.06)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.1)' }
                      }
                    >
                      Colaborador
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, targetAdmin: !f.targetAdmin }))}
                      className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                      style={
                        form.targetAdmin
                          ? { background: '#FF6600', color: '#fff' }
                          : { background: 'rgba(255,255,255,0.06)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.1)' }
                      }
                    >
                      Admin
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 — Vídeos */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Section header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: '#FF6600' }}
                  >
                    2
                  </div>
                  <h2 className="text-sm font-semibold text-white">Vídeos da Trilha</h2>
                </div>
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold transition-all"
                  style={{ background: 'rgba(255,102,0,0.12)', color: '#FF6600', border: '1px solid rgba(255,102,0,0.2)' }}
                >
                  <Plus size={12} />
                  Adicionar Vídeo
                </button>
              </div>

              <div className="p-5 space-y-2">
                {videos.length === 0 ? (
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="w-full py-8 rounded-btn text-sm transition-colors flex flex-col items-center gap-2"
                    style={{ border: '1px dashed rgba(255,255,255,0.1)', color: '#5A5A5A' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,102,0,0.3)'; e.currentTarget.style.color = '#A0A0A0' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#5A5A5A' }}
                  >
                    <Plus size={20} />
                    Arraste vídeos ou clique para adicionar
                  </button>
                ) : (
                  <>
                    {videos.map((v) => {
                      const lvl = LEVEL_STYLE[v.level] || LEVEL_STYLE.INICIANTE
                      return (
                        <div
                          key={v.id}
                          className="flex items-center gap-3 p-3 rounded-btn"
                          style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <GripVertical size={14} style={{ color: '#3A3A3A' }} className="cursor-grab flex-shrink-0" />
                          {/* Thumbnail placeholder */}
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(255,102,0,0.1)' }}
                          >
                            <Video size={14} style={{ color: '#FF6600' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{v.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                style={{ background: lvl.bg, color: lvl.color }}
                              >
                                {v.level}
                              </span>
                              <span className="text-xs flex items-center gap-1" style={{ color: '#5A5A5A' }}>
                                <Clock size={10} />
                                {fmtMin(v.duration_seconds)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveVideo(v.id)}
                            className="p-1.5 rounded-btn transition-colors flex-shrink-0"
                            style={{ color: '#5A5A5A' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                            onMouseLeave={e => e.currentTarget.style.color = '#5A5A5A'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })}
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="w-full py-3 rounded-btn text-xs transition-colors text-center"
                      style={{ border: '1px dashed rgba(255,255,255,0.08)', color: '#5A5A5A' }}
                    >
                      + Arraste vídeos ou clique para adicionar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — 1/3 */}
          <div className="space-y-4">

            {/* Thumbnail card */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A5A' }}>Thumbnail da Trilha</h3>
              </div>
              <div className="p-4 space-y-3">
                <label className="block cursor-pointer">
                  <div
                    className="rounded-lg overflow-hidden flex flex-col items-center justify-center gap-2 transition-colors"
                    style={{
                      height: thumbnail ? 'auto' : '120px',
                      border: '1px dashed rgba(255,255,255,0.12)',
                      background: '#0A0A0A',
                    }}
                  >
                    {thumbnail ? (
                      <img src={thumbnail} alt="thumbnail" className="w-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <ImageIcon size={28} style={{ color: '#3A3A3A' }} />
                        <span className="text-xs text-center px-4" style={{ color: '#5A5A5A' }}>Clique ou arraste a imagem</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnail} />
                </label>
                <button
                  className="w-full py-2 rounded-btn text-xs font-semibold transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => document.querySelector('input[type=file]')?.click()}
                >
                  Selecionar Imagem
                </button>
              </div>
            </div>

            {/* Publicar */}
            {error && (
              <p className="text-xs text-red-400 text-center px-1">{error}</p>
            )}
            <div className="space-y-2">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="w-full py-2.5 rounded-btn text-sm font-medium transition-colors disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { if (!saving) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' } }}
                onMouseLeave={e => { e.currentTarget.style.color = '#A0A0A0'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              >
                Salvar Rascunho
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="w-full py-2.5 rounded-btn text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: '#FF6600', color: '#fff' }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#E55C00' }}
                onMouseLeave={e => e.currentTarget.style.background = '#FF6600'}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Salvando...' : 'Publicar Trilha'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {showVideoModal && (
        <VideoModal onClose={() => setShowVideoModal(false)} onAdd={handleAddVideo} />
      )}
    </AppLayout>
  )
}
