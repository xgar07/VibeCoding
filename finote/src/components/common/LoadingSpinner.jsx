const LoadingSpinner = ({ fullscreen = false, size = 'md' }) => {
  const sizeClass = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  }[size]

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-dark-200 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className={`${sizeClass} border-primary/30 border-t-primary rounded-full animate-spin`} />
          <span className="text-slate-400 text-sm font-medium">Memuat...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizeClass} border-primary/30 border-t-primary rounded-full animate-spin`} />
    </div>
  )
}

export default LoadingSpinner
