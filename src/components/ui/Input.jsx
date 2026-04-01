export function Input({
  label,
  error,
  className = '',
  type = 'text',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-white/80">{label}</label>
      )}
      <input
        type={type}
        className={`w-full px-4 py-2.5 rounded-btn bg-bg-elevated border border-white/10 text-white placeholder-text-secondary text-sm
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          transition-all ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-white/80">{label}</label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 rounded-btn bg-bg-elevated border border-white/10 text-white placeholder-text-secondary text-sm
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          transition-all resize-none ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-white/80">{label}</label>
      )}
      <select
        className={`w-full px-4 py-2.5 rounded-btn bg-bg-elevated border border-white/10 text-white text-sm
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          transition-all cursor-pointer ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
