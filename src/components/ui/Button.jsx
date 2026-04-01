export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-btn transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white',
    secondary: 'border border-white/20 text-white hover:bg-white/5',
    ghost: 'text-text-secondary hover:text-white hover:bg-white/5',
    destructive: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
