import { getCategoryInfo } from '../../utils/categories'

const CategoryBadge = ({ category, type = 'expense', showIcon = true, size = 'md' }) => {
  const info = getCategoryInfo(category, type)

  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size]

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg font-medium ${sizeClass} ${info.bg} ${info.text}`}>
      {showIcon && <span className="text-sm leading-none">{info.icon}</span>}
      {info.label}
    </span>
  )
}

export default CategoryBadge
