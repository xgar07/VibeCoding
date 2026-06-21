// Stat card skeleton
export const StatCardSkeleton = () => (
  <div className="card p-4 sm:p-5 space-y-3">
    <div className="flex items-start justify-between">
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="skeleton w-14 h-5 rounded-lg" />
    </div>
    <div className="skeleton w-28 h-7 rounded-lg" />
    <div className="skeleton w-20 h-4 rounded" />
  </div>
)

// Transaction list item skeleton
export const TransactionSkeleton = ({ count = 5 }) => (
  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 sm:p-4">
        <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/5 rounded" />
          <div className="skeleton h-3 w-2/5 rounded" />
        </div>
        <div className="skeleton h-5 w-20 rounded" />
      </div>
    ))}
  </div>
)

// Chart area skeleton
export const ChartSkeleton = ({ height = 220 }) => (
  <div className="card p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="skeleton h-5 w-36 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
      <div className="skeleton h-6 w-32 rounded-lg" />
    </div>
    <div className="skeleton rounded-xl" style={{ height }} />
  </div>
)

// Goal card skeleton
export const GoalCardSkeleton = () => (
  <div className="card p-5 space-y-4">
    <div className="flex justify-between">
      <div className="skeleton h-5 w-32 rounded" />
      <div className="skeleton h-7 w-14 rounded-lg" />
    </div>
    <div className="space-y-2">
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-2 w-full rounded-full" />
      <div className="flex justify-between">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    </div>
    <div className="skeleton h-9 w-32 rounded-xl" />
  </div>
)

// Generic card skeleton
export const CardSkeleton = ({ lines = 3 }) => (
  <div className="card p-4 space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="skeleton rounded" style={{ height: 16, width: `${[70, 90, 55][i % 3]}%` }} />
    ))}
  </div>
)

// Dashboard header skeleton
export const DashboardHeaderSkeleton = () => (
  <div className="space-y-2">
    <div className="skeleton h-7 w-56 rounded-lg" />
    <div className="skeleton h-4 w-48 rounded" />
  </div>
)
