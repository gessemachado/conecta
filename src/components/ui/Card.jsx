export function Card({ children, className = '', onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-bg-surface rounded-card border border-white/[0.08] ${onClick ? 'cursor-pointer hover:border-white/20 transition-colors' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
