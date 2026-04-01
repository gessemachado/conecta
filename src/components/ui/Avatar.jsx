import { getInitials } from '../../lib/utils'

export function Avatar({ name = '', size = 'md', src, className = '' }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover flex-shrink-0 ${sizes[size]} ${className}`}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white flex-shrink-0 ${sizes[size]} ${className}`}
      style={{ background: 'rgba(255,102,0,0.3)' }}
    >
      {getInitials(name)}
    </div>
  )
}
