import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Star } from 'lucide-react'
import { useAchievements } from '../../hooks/useAchievements'

const DISPLAY_MS = 2800  // auto-dismiss duration per toast
const FADE_MS    = 350   // CSS transition duration

/**
 * Global achievement notification system.
 * Mount once in App.jsx. Reads `newlyUnlocked` from useAchievements,
 * shows them one-at-a-time with a queue, hover-pause, close button.
 */
const AchievementToastSystem = () => {
  const { newlyUnlocked, markSeen } = useAchievements()

  // Internal queue of achievement objects waiting to be shown
  const [queue, setQueue]       = useState([])
  // The one currently visible
  const [current, setCurrent]   = useState(null)
  // Controls CSS fade-in / fade-out
  const [visible, setVisible]   = useState(false)
  // Whether timer is paused (hover / touch)
  const paused  = useRef(false)
  const timerRef = useRef(null)
  const elapsedRef = useRef(0)
  const startRef   = useRef(null)

  // ── Feed newlyUnlocked into the queue (deduplicate) ──────────────────────
  useEffect(() => {
    if (!newlyUnlocked.length) return
    setQueue(prev => {
      const existingIds = new Set([...prev.map(a => a.id), current?.id].filter(Boolean))
      const fresh = newlyUnlocked.filter(a => !existingIds.has(a.id))
      return fresh.length ? [...prev, ...fresh] : prev
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newlyUnlocked])

  // ── Dismiss current and advance to next ──────────────────────────────────
  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current)
    setVisible(false)
    setTimeout(() => {
      setCurrent(prev => {
        if (prev) markSeen(prev.id)
        return null
      })
      elapsedRef.current = 0
    }, FADE_MS)
  }, [markSeen])

  // ── Start timer (respects elapsed time for pause/resume) ─────────────────
  const startTimer = useCallback((remaining) => {
    startRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      dismiss()
    }, remaining)
  }, [dismiss])

  const pauseTimer = useCallback(() => {
    if (!paused.current) {
      paused.current = true
      clearTimeout(timerRef.current)
      elapsedRef.current += Date.now() - (startRef.current ?? Date.now())
    }
  }, [])

  const resumeTimer = useCallback(() => {
    if (paused.current) {
      paused.current = false
      const remaining = Math.max(0, DISPLAY_MS - elapsedRef.current)
      startTimer(remaining)
    }
  }, [startTimer])

  // ── When queue has items and nothing is showing, pop the next one ─────────
  useEffect(() => {
    if (current || !queue.length) return
    const [next, ...rest] = queue
    setQueue(rest)
    setCurrent(next)
    elapsedRef.current = 0
    paused.current = false
    // Tiny delay lets React mount the element before triggering fade-in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
  }, [queue, current])

  // ── Start auto-dismiss timer when a new current appears ──────────────────
  useEffect(() => {
    if (!current) return
    startTimer(DISPLAY_MS)
    return () => clearTimeout(timerRef.current)
  }, [current, startTimer])

  if (!current) return null

  const { icon, title, desc, xp, rarity, rarityMeta, categoryMeta } = current

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onTouchStart={pauseTimer}
      onTouchEnd={resumeTimer}
      style={{
        position: 'fixed',
        top: 'max(1rem, env(safe-area-inset-top, 1rem))',
        right: '1rem',
        width: 'min(320px, calc(100vw - 2rem))',
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-16px) scale(0.96)',
        transition: `opacity ${FADE_MS}ms cubic-bezier(.4,0,.2,1), transform ${FADE_MS}ms cubic-bezier(.4,0,.2,1)`,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Card */}
      <div
        style={{
          background: `linear-gradient(135deg, ${rarityMeta?.bg || 'rgba(245,158,11,0.12)'}, var(--bg-card, #1E293B))`,
          border: `1.5px solid ${rarityMeta?.color || '#F59E0B'}35`,
          borderRadius: 16,
          boxShadow: `0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px ${rarityMeta?.color || '#F59E0B'}18`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Rarity accent bar */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${rarityMeta?.color || '#F59E0B'}, ${rarityMeta?.color || '#F59E0B'}55)`,
        }} />

        {/* Progress bar (time remaining) */}
        <TimerBar
          durationMs={DISPLAY_MS}
          paused={paused}
          color={rarityMeta?.color || '#F59E0B'}
          visible={visible}
        />

        <div style={{ padding: '12px 14px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            {/* Icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: rarityMeta?.bg || 'rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>
              {icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badge row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.07em',
                  textTransform: 'uppercase', color: rarityMeta?.color || '#F59E0B',
                }}>
                  🏆 Achievement Terbuka!
                </span>
                {rarity === 'legendary' && (
                  <Star size={10} style={{ color: '#F59E0B' }} fill="#F59E0B" />
                )}
              </div>

              <p style={{
                fontSize: 13, fontWeight: 700, margin: '0 0 2px',
                color: 'var(--text-primary, #F1F5F9)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {title}
              </p>

              <p style={{
                fontSize: 11, margin: '0 0 6px',
                color: 'var(--text-muted, #94A3B8)',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {desc}
              </p>

              {/* XP + Category row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: rarityMeta?.color || '#F59E0B',
                  background: rarityMeta?.bg, borderRadius: 20,
                  padding: '2px 8px',
                }}>
                  +{xp} XP
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: rarityMeta?.color || '#F59E0B',
                  background: `${rarityMeta?.color || '#F59E0B'}15`,
                  borderRadius: 20, padding: '2px 7px',
                }}>
                  {rarityMeta?.label}
                </span>
                {categoryMeta && (
                  <span style={{ fontSize: 10, color: 'var(--text-muted, #94A3B8)' }}>
                    {categoryMeta.icon}
                  </span>
                )}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={dismiss}
              aria-label="Tutup notifikasi"
              style={{
                flexShrink: 0, width: 24, height: 24, borderRadius: 8,
                border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(148,163,184,0.12)',
                color: 'var(--text-muted, #94A3B8)',
                marginTop: -2,
                transition: 'background 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(148,163,184,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(148,163,184,0.12)'}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Queue badge */}
    </div>
  )
}

// ── Animated countdown bar ────────────────────────────────────────────────────
const TimerBar = ({ durationMs, paused, color, visible }) => {
  const [width, setWidth]   = useState(100)
  const rafRef   = useRef(null)
  const startRef = useRef(null)
  const frozenW  = useRef(100)

  useEffect(() => {
    if (!visible) return

    const tick = () => {
      if (paused.current) {
        frozenW.current = width
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      if (!startRef.current) startRef.current = Date.now()
      const elapsed = Date.now() - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100)
      setWidth(remaining)
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  return (
    <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', margin: '0' }}>
      <div style={{
        height: '100%',
        width: `${width}%`,
        background: color,
        transition: 'width 100ms linear',
        opacity: 0.6,
      }} />
    </div>
  )
}

export default AchievementToastSystem
