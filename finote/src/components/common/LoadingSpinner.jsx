const LoadingSpinner = ({ fullscreen = false, size = 'md' }) => {
  const sizeClass = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  }[size]

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className={`${sizeClass} border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin`} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Memuat...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizeClass} border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin`} />
    </div>
  )
}

export default LoadingSpinner
