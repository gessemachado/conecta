export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return `${d.getDate()} de ${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`
}

export function formatProgress(completed, total) {
  if (!total) return 0
  return Math.round((completed / total) * 100)
}

export function formatDuration(seconds) {
  if (!seconds) return '0 min'
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}min`
  return `${m} min`
}

export function levelColor(level) {
  if (!level) return 'text-gray-400'
  const l = level.toUpperCase()
  if (l === 'INICIANTE') return 'text-green-400'
  if (l === 'INTERMEDIÁRIO' || l === 'INTERMEDIARIO') return 'text-yellow-400'
  if (l === 'AVANÇADO' || l === 'AVANCADO') return 'text-red-400'
  return 'text-gray-400'
}

export function levelBg(level) {
  if (!level) return 'bg-gray-400/10 text-gray-400'
  const l = level.toUpperCase()
  if (l === 'INICIANTE') return 'bg-green-500/10 text-green-400'
  if (l === 'INTERMEDIÁRIO' || l === 'INTERMEDIARIO') return 'bg-yellow-500/10 text-yellow-400'
  if (l === 'AVANÇADO' || l === 'AVANCADO') return 'bg-red-500/10 text-red-400'
  return 'bg-gray-400/10 text-gray-400'
}
