import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Plus, Trash2, GripVertical, ImageIcon, X, ChevronRight, ChevronDown, Video, Clock, FileVideo, ArrowRight, Loader2, Pencil, FileText, Download } from 'lucide-react'
import { AppLayout } from '../../components/Layout/AppLayout'
import { supabase } from '../../lib/supabase'

const DEFAULT_CATEGORIES = ['Vendas', 'Atendimento', 'Produto', 'Gestão', 'Compliance', 'Operações']
const LEVELS = ['INICIANTE', 'INTERMEDIÁRIO', 'AVANÇADO']

const LEVEL_STYLE = {
  INICIANTE:       { bg: 'rgba(34,197,94,0.2)',  color: '#22C55E' },
  'INTERMEDIÁRIO': { bg: 'rgba(234,179,8,0.2)',  color: '#EAB308' },
  AVANÇADO:        { bg: 'rgba(239,68,68,0.2)',   color: '#EF4444' },
}

function fmtMin(s) {
  const total = Math.round(s / 60)
  if (total < 60) return `${total} min`
  return `${Math.floor(total / 60)}h ${total % 60}min`
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

  const inputStyle = { background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-xl shadow-2xl my-auto"
        style={{ background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Adicionar Vídeo ao Curso</h3>
              <p className="text-xs mt-0.5" style={{ color: '#5A5A5A' }}>
                Faça{' '}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="underline" style={{ color: '#FF6600' }}>
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
            {previewSrc ? (
              <div className="rounded-lg overflow-hidden relative" style={{ background: '#000' }}>
                {previewType === 'embed' ? (
                  <iframe src={previewSrc} className="w-full" style={{ height: '300px' }} allowFullScreen allow="autoplay; encrypted-media" />
                ) : (
                  <video src={previewSrc} controls className="w-full" style={{ maxHeight: '300px' }} />
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
            <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-xs font-semibold tracking-widest" style={{ color: '#3A3A3A' }}>OU LINK</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: '#A0A0A0' }}>Título *</label>
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
                <label className="text-xs font-semibold" style={{ color: '#A0A0A0' }}>Duração (minutos)</label>
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

            <div className="flex items-center gap-3">
              <Toggle value={form.is_mandatory} onChange={v => setForm(f => ({ ...f, is_mandatory: v }))} />
              <span className="text-sm" style={{ color: '#A0A0A0' }}>Vídeo obrigatório</span>
            </div>

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

const DOC_TYPES = {
  pdf:  { label: 'PDF',   color: '#EF4444' },
  doc:  { label: 'Word',  color: '#3B82F6' },
  docx: { label: 'Word',  color: '#3B82F6' },
  xls:  { label: 'Excel', color: '#22C55E' },
  xlsx: { label: 'Excel', color: '#22C55E' },
  ppt:  { label: 'PPT',   color: '#F59E0B' },
  pptx: { label: 'PPT',   color: '#F59E0B' },
}

function fmtBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DocumentModal({ onClose, onAdd }) {
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [fileInfo, setFileInfo] = useState(null) // { name, size, ext, url }

  async function handleFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    setTitle(prev => prev || file.name.replace(/\.[^.]+$/, ''))
    setUploading(true)
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('documents').upload(path, file, { upsert: true })
    if (!error) {
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
      setFileInfo({ name: file.name, size: file.size, ext, url: urlData.publicUrl })
    }
    setUploading(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title || !fileInfo) return
    onAdd({
      id: `d${Date.now()}`,
      title,
      file_url: fileInfo.url,
      file_type: fileInfo.ext,
      file_size: fileInfo.size,
      order_index: 0,
    })
  }

  const inputStyle = { background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.1)' }
  const typeInfo = fileInfo ? (DOC_TYPES[fileInfo.ext] || { label: fileInfo.ext.toUpperCase(), color: '#A0A0A0' }) : null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-xl shadow-2xl my-auto"
        style={{ background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Adicionar Material de Apoio</h3>
              <p className="text-xs mt-0.5" style={{ color: '#5A5A5A' }}>PDF, Word, Excel, PowerPoint • até 50 MB</p>
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors mt-0.5">
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-6 space-y-4">
            {fileInfo ? (
              <div
                className="flex items-center gap-3 p-4 rounded-lg"
                style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: `${typeInfo.color}22`, color: typeInfo.color }}
                >
                  {typeInfo.label}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{fileInfo.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5A5A5A' }}>{fmtBytes(fileInfo.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setFileInfo(null); setTitle('') }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div
                className="rounded-lg flex flex-col items-center justify-center gap-2 py-10 cursor-pointer transition-colors"
                style={{
                  border: `1px dashed ${dragOver ? '#FF6600' : 'rgba(255,255,255,0.12)'}`,
                  background: dragOver ? 'rgba(255,102,0,0.04)' : '#0D0D0D',
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 size={28} className="animate-spin" style={{ color: '#FF6600' }} />
                ) : (
                  <>
                    <FileText size={28} style={{ color: '#3A3A3A' }} />
                    <p className="text-sm font-medium text-white">Clique ou arraste o arquivo aqui</p>
                    <p className="text-xs" style={{ color: '#5A5A5A' }}>PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX</p>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: '#A0A0A0' }}>Título do material *</label>
              <input
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-btn text-sm text-white outline-none transition-colors"
                style={inputStyle}
                placeholder="Ex: Manual de Operações"
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-btn text-sm font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading || !fileInfo}
                className="flex-1 py-2.5 rounded-btn text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: '#FF6600', color: '#fff' }}
              >
                {uploading && <Loader2 size={14} className="animate-spin" />}
                {uploading ? 'Enviando...' : 'Salvar Material'}
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
    targetRoles: ['gerente-credenciado'],
  })
  const [sections, setSections] = useState([])
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [videoModalSection, setVideoModalSection] = useState(null)
  const [documents, setDocuments] = useState([])
  const [showDocModal, setShowDocModal] = useState(false)
  const [videoDocs, setVideoDocs] = useState({}) // { [localVideoId]: [doc,...] }
  const [docModalVideoId, setDocModalVideoId] = useState(null) // null=course, id=video
  const [saving, setSaving] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(isEdit)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [categoryModal, setCategoryModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', value: string }
  const [categoryInput, setCategoryInput] = useState('')

  // Carrega categorias existentes dos cursos no banco
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('trails').select('category').not('category', 'is', null)
      if (data?.length) {
        const fromDb = [...new Set(data.map(t => t.category).filter(Boolean))]
        setCategories(prev => [...new Set([...prev, ...fromDb])])
      }
    }
    loadCategories()
  }, [])

  function openAddCategory() {
    setCategoryInput('')
    setCategoryModal({ mode: 'add' })
  }

  function openEditCategory(cat) {
    setCategoryInput(cat)
    setCategoryModal({ mode: 'edit', value: cat })
  }

  function confirmCategoryModal() {
    const val = categoryInput.trim()
    if (!val) return
    if (categoryModal.mode === 'add') {
      setCategories(prev => [...new Set([...prev, val])])
      setForm(f => ({ ...f, category: val }))
    } else {
      const old = categoryModal.value
      setCategories(prev => prev.map(c => c === old ? val : c))
      if (form.category === old) setForm(f => ({ ...f, category: val }))
    }
    setCategoryModal(null)
  }

  useEffect(() => {
    if (!isEdit) return
    async function loadTrail() {
      const { data: trail } = await supabase.from('trails').select('*').eq('id', id).single()
      if (trail) {
        setForm({
          title: trail.title || '',
          description: trail.description || '',
          category: trail.category || 'Vendas',
          order: trail.order_index?.toString() || '',
          targetRoles: trail.target_roles ?? ['gerente-credenciado'],
        })
        if (trail.thumbnail) setThumbnail(trail.thumbnail)
      }

      // Load sections with nested videos
      const { data: secs } = await supabase
        .from('sections')
        .select('*, videos(*)')
        .eq('trail_id', id)
        .order('order_index')

      if (secs && secs.length > 0) {
        setSections(secs.map(sec => ({
          localId: `s${sec.id}`,
          title: sec.title,
          collapsed: false,
          videos: (sec.videos || [])
            .sort((a, b) => a.order_index - b.order_index)
            .map(v => ({
              id: v.id,
              title: v.title,
              video_url: v.url || '',
              level: v.level || 'INICIANTE',
              duration_seconds: (v.duration_min || 0) * 60,
              is_mandatory: v.is_mandatory || false,
              order_index: v.order_index,
            })),
        })))
      } else {
        // Legacy: videos without sections — put in one section
        const { data: vids } = await supabase.from('videos').select('*').eq('trail_id', id).order('order_index')
        if (vids?.length > 0) {
          setSections([{
            localId: 's-legacy',
            title: 'Seção 1',
            collapsed: false,
            videos: vids.map(v => ({
              id: v.id,
              title: v.title,
              video_url: v.url || '',
              level: v.level || 'INICIANTE',
              duration_seconds: (v.duration_min || 0) * 60,
              is_mandatory: v.is_mandatory || false,
              order_index: v.order_index,
            })),
          }])
        }
      }
      // Load documents (course-level and video-level)
      const { data: docs } = await supabase.from('documents').select('*').eq('trail_id', id).order('order_index')
      if (docs?.length) {
        setDocuments(docs.filter(d => !d.video_id).map(d => ({ ...d, id: `d${d.id}`, _dbId: d.id })))
        const vdMap = {}
        docs.filter(d => d.video_id).forEach(d => {
          const key = String(d.video_id)
          if (!vdMap[key]) vdMap[key] = []
          vdMap[key].push({ ...d, id: `d${d.id}`, _dbId: d.id })
        })
        setVideoDocs(vdMap)
      }

      setLoadingEdit(false)
    }
    loadTrail()
  }, [id, isEdit])

  function handleAddSection() {
    setSections(s => [...s, {
      localId: `s${Date.now()}`,
      title: `Seção ${s.length + 1}`,
      collapsed: false,
      videos: [],
    }])
  }

  function handleSectionTitle(localId, title) {
    setSections(s => s.map(sec => sec.localId === localId ? { ...sec, title } : sec))
  }

  function handleToggleSection(localId) {
    setSections(s => s.map(sec => sec.localId === localId ? { ...sec, collapsed: !sec.collapsed } : sec))
  }

  function handleRemoveSection(localId) {
    setSections(s => s.filter(sec => sec.localId !== localId))
  }

  function handleOpenVideoModal(localId) {
    setVideoModalSection(localId)
    setShowVideoModal(true)
  }

  function handleAddVideo(video) {
    setSections(s => s.map(sec =>
      sec.localId === videoModalSection
        ? { ...sec, videos: [...sec.videos, { ...video, order_index: sec.videos.length + 1 }] }
        : sec
    ))
    setShowVideoModal(false)
    setVideoModalSection(null)
  }

  function handleRemoveVideo(sectionLocalId, videoId) {
    setSections(s => s.map(sec =>
      sec.localId === sectionLocalId
        ? { ...sec, videos: sec.videos.filter(v => v.id !== videoId) }
        : sec
    ))
  }

  function handleAddDocument(doc) {
    setDocuments(d => [...d, { ...doc, order_index: d.length + 1 }])
    setShowDocModal(false)
  }

  function handleRemoveDocument(docId) {
    setDocuments(d => d.filter(doc => doc.id !== docId))
  }

  function handleAddVideoDoc(doc) {
    setVideoDocs(prev => ({
      ...prev,
      [docModalVideoId]: [...(prev[docModalVideoId] || []), { ...doc, order_index: (prev[docModalVideoId]?.length || 0) + 1 }],
    }))
    setDocModalVideoId(null)
  }

  function handleRemoveVideoDoc(videoLocalId, docId) {
    setVideoDocs(prev => ({
      ...prev,
      [videoLocalId]: (prev[videoLocalId] || []).filter(d => d.id !== docId),
    }))
  }

  function handleThumbnail(e) {
    const file = e.target.files[0]
    if (file) {
      setThumbnailFile(file)
      setThumbnail(URL.createObjectURL(file))
    }
  }

  async function handleSave(publish) {
    if (!form.title.trim()) { setError('O título do curso é obrigatório.'); return }
    setError('')
    setSaving(true)
    try {
      // 1. Upload thumbnail
      let thumbnailUrl = null
      if (thumbnailFile) {
        const ext = thumbnailFile.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('images').upload(path, thumbnailFile, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
          thumbnailUrl = urlData.publicUrl
        }
      }

      // 2. Upsert trail
      const targetRoles = form.targetRoles
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
        const { error: trailErr } = await supabase.from('trails').update(trailPayload).eq('id', id)
        if (trailErr) throw new Error(trailErr.message)
        trailId = id
        // Delete existing sections (cascade will handle videos with section_id)
        await supabase.from('sections').delete().eq('trail_id', trailId)
        // Also delete any legacy videos without section
        await supabase.from('videos').delete().eq('trail_id', trailId)
      } else {
        const { data: trail, error: trailErr } = await supabase.from('trails').insert(trailPayload).select().single()
        if (trailErr) throw new Error(trailErr.message)
        trailId = trail.id
      }

      // 3. Insert sections + videos (collect video docs to insert later)
      const pendingVideoDocRows = []
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i]
        const { data: secRow, error: secErr } = await supabase
          .from('sections')
          .insert({ trail_id: trailId, title: sec.title || `Seção ${i + 1}`, order_index: i + 1 })
          .select('id')
          .single()
        if (secErr) throw new Error(secErr.message)

        if (sec.videos.length > 0) {
          const rows = sec.videos.map((v, j) => ({
            trail_id: trailId,
            section_id: secRow.id,
            title: v.title,
            url: v.video_url || null,
            level: v.level,
            duration_min: Math.round((v.duration_seconds || 0) / 60),
            is_mandatory: v.is_mandatory,
            order_index: j + 1,
          }))
          const { data: savedVids, error: vidErr } = await supabase.from('videos').insert(rows).select('id, order_index')
          if (vidErr) throw new Error(vidErr.message)

          if (savedVids) {
            for (let j = 0; j < sec.videos.length; j++) {
              const localVid = sec.videos[j]
              const dbVidId = savedVids.find(sv => sv.order_index === j + 1)?.id
              const vDocs = videoDocs[String(localVid.id)] || []
              if (dbVidId && vDocs.length > 0) {
                vDocs.forEach((d, k) => {
                  pendingVideoDocRows.push({
                    trail_id: trailId,
                    video_id: dbVidId,
                    title: d.title,
                    file_url: d.file_url,
                    file_type: d.file_type,
                    file_size: d.file_size,
                    order_index: k + 1,
                  })
                })
              }
            }
          }
        }
      }

      // 4. Save all documents (course-level + video-level) in one go
      await supabase.from('documents').delete().eq('trail_id', trailId)
      const allDocRows = [
        ...documents.map((d, i) => ({
          trail_id: trailId,
          title: d.title,
          file_url: d.file_url,
          file_type: d.file_type,
          file_size: d.file_size,
          order_index: i + 1,
        })),
        ...pendingVideoDocRows,
      ]
      if (allDocRows.length > 0) {
        await supabase.from('documents').insert(allDocRows)
      }

      navigate('/admin/trilhas')
    } catch (err) {
      setError(err.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const totalVideos = sections.reduce((a, s) => a + s.videos.length, 0)
  const totalSeconds = sections.reduce((a, s) => a + s.videos.reduce((b, v) => b + v.duration_seconds, 0), 0)

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
          <Link to="/admin/trilhas" className="hover:text-white transition-colors">Cursos</Link>
          <ChevronRight size={13} />
          <span style={{ color: '#A0A0A0' }}>{isEdit ? 'Editar Curso' : 'Novo Curso'}</span>
        </div>

        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold text-white">{isEdit ? 'Editar Curso' : 'Criar Novo Curso'}</h1>
          <p className="text-sm mt-1" style={{ color: '#A0A0A0' }}>
            Configure os detalhes, seções e vídeos do curso.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* LEFT — 2/3 */}
          <div className="lg:col-span-2 space-y-5">

            {/* Section 1 — Informações */}
            <div className="rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#FF6600' }}>1</div>
                <h2 className="text-sm font-semibold text-white">Informações do Curso</h2>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A5A' }}>Título do Curso *</label>
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A5A' }}>Descrição</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-btn text-sm text-white outline-none resize-none transition-colors"
                    style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="Descreva o objetivo deste curso..."
                    onFocus={e => e.target.style.borderColor = '#FF6600'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A5A' }}>Trilha *</label>
                      <button
                        type="button"
                        onClick={openAddCategory}
                        className="flex items-center gap-1 text-xs font-semibold transition-colors"
                        style={{ color: '#FF6600' }}
                      >
                        <Plus size={12} /> Nova
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(c => (
                        <div
                          key={c}
                          className="flex items-center gap-1 rounded-full text-xs font-semibold transition-all"
                          style={
                            form.category === c
                              ? { background: '#FF6600', color: '#fff', padding: '4px 10px 4px 12px' }
                              : { background: 'rgba(255,255,255,0.06)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px 4px 12px' }
                          }
                        >
                          <button type="button" onClick={() => setForm(f => ({ ...f, category: c }))}>
                            {c}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditCategory(c)}
                            className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                          >
                            <Pencil size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A5A' }}>Ordem de Exibição</label>
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

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A5A' }}>Público-Alvo</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'gerente-credenciado', label: 'Gerente Credenciado' },
                      { key: 'adm-credenciado', label: 'Adm Credenciado' },
                      { key: 'auditor-credenciado', label: 'Auditor Credenciado' },
                      { key: 'influencer', label: 'Influencer' },
                      { key: 'promotor', label: 'Promotor' },
                      { key: 'frente-de-caixa', label: 'Frente de Caixa' },
                      { key: 'buyhelp', label: 'Buyhelp' },
                    ].map(({ key, label }) => {
                      const active = form.targetRoles.includes(key)
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setForm(f => ({
                            ...f,
                            targetRoles: active
                              ? f.targetRoles.filter(r => r !== key)
                              : [...f.targetRoles, key]
                          }))}
                          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                          style={active
                            ? { background: '#FF6600', color: '#fff' }
                            : { background: 'rgba(255,255,255,0.06)', color: '#A0A0A0', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 — Conteúdo */}
            <div className="rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#FF6600' }}>2</div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">Conteúdo do Curso</h2>
                    {totalVideos > 0 && (
                      <p className="text-xs mt-0.5" style={{ color: '#5A5A5A' }}>
                        {sections.length} seção{sections.length !== 1 ? 'ões' : ''} • {totalVideos} aula{totalVideos !== 1 ? 's' : ''} • {fmtMin(totalSeconds)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleAddSection}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold transition-all"
                  style={{ background: 'rgba(255,102,0,0.12)', color: '#FF6600', border: '1px solid rgba(255,102,0,0.2)' }}
                >
                  <Plus size={12} />
                  Nova Seção
                </button>
              </div>

              <div className="p-4 space-y-3">
                {sections.length === 0 ? (
                  <button
                    onClick={handleAddSection}
                    className="w-full py-10 rounded-btn text-sm transition-colors flex flex-col items-center gap-2"
                    style={{ border: '1px dashed rgba(255,255,255,0.1)', color: '#5A5A5A' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,102,0,0.3)'; e.currentTarget.style.color = '#A0A0A0' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#5A5A5A' }}
                  >
                    <Plus size={22} />
                    <span>Clique para criar a primeira seção</span>
                    <span className="text-xs">Organize o conteúdo em seções e adicione vídeos a cada uma</span>
                  </button>
                ) : (
                  sections.map((sec, secIdx) => {
                    const secDuration = sec.videos.reduce((a, v) => a + v.duration_seconds, 0)
                    return (
                      <div
                        key={sec.localId}
                        className="rounded-lg overflow-hidden"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        {/* Section header */}
                        <div
                          className="flex items-center gap-2 px-4 py-3"
                          style={{ background: '#0D0D0D', borderBottom: sec.collapsed ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleSection(sec.localId)}
                            className="flex-shrink-0 transition-colors"
                            style={{ color: '#5A5A5A' }}
                          >
                            {sec.collapsed
                              ? <ChevronRight size={16} />
                              : <ChevronDown size={16} />
                            }
                          </button>
                          <GripVertical size={14} style={{ color: '#3A3A3A' }} className="flex-shrink-0 cursor-grab" />
                          <input
                            value={sec.title}
                            onChange={e => handleSectionTitle(sec.localId, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder-[#3A3A3A]"
                            placeholder={`Seção ${secIdx + 1}: Título da seção`}
                          />
                          {sec.videos.length > 0 && (
                            <span className="text-xs flex-shrink-0" style={{ color: '#5A5A5A' }}>
                              {sec.videos.length} aula{sec.videos.length !== 1 ? 's' : ''} • {fmtMin(secDuration)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sec.localId)}
                            className="flex-shrink-0 p-1 rounded transition-colors"
                            style={{ color: '#5A5A5A' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                            onMouseLeave={e => e.currentTarget.style.color = '#5A5A5A'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Videos list */}
                        {!sec.collapsed && (
                          <div className="p-3 space-y-2" style={{ background: '#0A0A0A' }}>
                            {sec.videos.map((v) => {
                              const lvl = LEVEL_STYLE[v.level] || LEVEL_STYLE.INICIANTE
                              return (
                                <div
                                  key={v.id}
                                  className="flex items-center gap-3 p-3 rounded-lg"
                                  style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}
                                >
                                  <GripVertical size={13} style={{ color: '#3A3A3A' }} className="cursor-grab flex-shrink-0" />
                                  <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,102,0,0.1)' }}>
                                    <Video size={13} style={{ color: '#FF6600' }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{v.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: lvl.bg, color: lvl.color }}>{v.level}</span>
                                      <span className="text-xs flex items-center gap-1" style={{ color: '#5A5A5A' }}>
                                        <Clock size={10} />{fmtMin(v.duration_seconds)}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setDocModalVideoId(String(v.id))}
                                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors flex-shrink-0"
                                    style={
                                      (videoDocs[String(v.id)]?.length || 0) > 0
                                        ? { background: 'rgba(139,92,246,0.2)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)' }
                                        : { background: 'rgba(255,255,255,0.05)', color: '#5A5A5A', border: '1px solid rgba(255,255,255,0.08)' }
                                    }
                                  >
                                    <FileText size={10} />
                                    {(videoDocs[String(v.id)]?.length || 0) > 0
                                      ? `${videoDocs[String(v.id)].length} rec.`
                                      : 'Recursos'}
                                  </button>
                                  <button
                                    onClick={() => handleRemoveVideo(sec.localId, v.id)}
                                    className="p-1.5 rounded-btn transition-colors flex-shrink-0"
                                    style={{ color: '#5A5A5A' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#5A5A5A'}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )
                            })}

                            {/* Add video to section */}
                            <button
                              onClick={() => handleOpenVideoModal(sec.localId)}
                              className="w-full py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                              style={{ border: '1px dashed rgba(255,255,255,0.08)', color: '#5A5A5A' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,102,0,0.3)'; e.currentTarget.style.color = '#FF6600' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#5A5A5A' }}
                            >
                              <Plus size={12} />
                              Adicionar vídeo à seção
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}

                {sections.length > 0 && (
                  <button
                    onClick={handleAddSection}
                    className="w-full py-3 rounded-btn text-xs transition-colors flex items-center justify-center gap-1.5"
                    style={{ border: '1px dashed rgba(255,255,255,0.08)', color: '#5A5A5A' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,102,0,0.3)'; e.currentTarget.style.color = '#FF6600' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#5A5A5A' }}
                  >
                    <Plus size={12} />
                    Adicionar nova seção
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT — 1/3 */}
          <div className="space-y-4">

            {/* Thumbnail */}
            <div className="rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5A5A5A' }}>Thumbnail do Curso</h3>
              </div>
              <div className="p-4 space-y-3">
                <label className="block cursor-pointer">
                  <div
                    className="rounded-lg overflow-hidden flex flex-col items-center justify-center gap-2 transition-colors"
                    style={{ height: thumbnail ? 'auto' : '120px', border: '1px dashed rgba(255,255,255,0.12)', background: '#0A0A0A' }}
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
                  onClick={() => document.querySelector('input[accept="image/*"]')?.click()}
                >
                  Selecionar Imagem
                </button>
              </div>
            </div>

            {/* Publicar */}
            {error && <p className="text-xs text-red-400 text-center px-1">{error}</p>}
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
                {saving ? 'Salvando...' : 'Publicar Curso'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showVideoModal && (
        <VideoModal onClose={() => { setShowVideoModal(false); setVideoModalSection(null) }} onAdd={handleAddVideo} />
      )}

      {docModalVideoId && (
        <DocumentModal onClose={() => setDocModalVideoId(null)} onAdd={handleAddVideoDoc} />
      )}

      {/* ── Modal Trilha ── */}
      {categoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setCategoryModal(null)}
        >
          <div
            className="rounded-2xl p-6 w-80 space-y-4"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">
              {categoryModal.mode === 'add' ? 'Nova Trilha' : 'Editar Trilha'}
            </h3>
            <input
              autoFocus
              value={categoryInput}
              onChange={e => setCategoryInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmCategoryModal(); if (e.key === 'Escape') setCategoryModal(null) }}
              placeholder="Nome da trilha..."
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
              style={{ background: '#0A0A0A', border: '1px solid rgba(255,102,0,0.4)' }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCategoryModal(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#A0A0A0' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!categoryInput.trim()}
                onClick={confirmCategoryModal}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold disabled:opacity-40"
                style={{ background: '#FF6600', color: '#fff' }}
              >
                {categoryModal.mode === 'add' ? 'Adicionar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
