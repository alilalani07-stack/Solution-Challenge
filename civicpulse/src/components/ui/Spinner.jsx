export default function Spinner({ size = 'md', color = 'primary', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const colors = {
    primary: 'border-primary',
    white: 'border-white',
    gray: 'border-text-tertiary',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizes[size]} border-2 rounded-full animate-spin
          border-t-transparent ${colors[color]}
        `}
      />
    </div>
  )
}
