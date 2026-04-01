export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white/10 text-white/70',
    primary: 'bg-primary/20 text-primary',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    red: 'bg-red-500/10 text-red-400',
    active: 'bg-green-500/10 text-green-400',
    inactive: 'bg-red-500/10 text-red-400',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export function LevelBadge({ level }) {
  if (!level) return null
  const l = level.toUpperCase()
  let variant = 'default'
  if (l === 'INICIANTE') variant = 'green'
  else if (l.startsWith('INTERM')) variant = 'yellow'
  else if (l.startsWith('AVAN')) variant = 'red'

  return <Badge variant={variant}>{level}</Badge>
}
