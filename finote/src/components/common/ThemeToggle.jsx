import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const ThemeToggle = ({ size = 'md' }) => {
  const { isDark, toggleTheme } = useTheme()

  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
  }[size]

  return (
    <button
      onClick={toggleTheme}
      className={`${sizeClass} rounded-xl btn-icon flex items-center justify-center`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      <div className="transition-all duration-300">
        {isDark ? (
          <Sun size={16} className="text-amber-400" />
        ) : (
          <Moon size={16} className="text-indigo-400" />
        )}
      </div>
    </button>
  )
}

export default ThemeToggle
