'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface CountdownProps {
  /**
   * Seconds remaining at the moment the countdown is created, anchored to
   * the server clock — NEVER derived from the browser clock.
   */
  initialRemainingSeconds: number
  className?: string
  /** Called once when the countdown reaches zero. */
  onEnd?: () => void
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/**
 * HH:MM:SS countdown that drifts only locally (interval-based) and can be
 * re-anchored externally on server resync via the `initialRemainingSeconds`
 * prop (remount / new key recomputes from scratch).
 */
export function Countdown({
  initialRemainingSeconds,
  className,
  onEnd,
}: CountdownProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor(initialRemainingSeconds)),
  )
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd

  useEffect(() => {
    setRemaining(Math.max(0, Math.floor(initialRemainingSeconds)))
  }, [initialRemainingSeconds])

  const done = remaining <= 0

  useEffect(() => {
    if (remaining <= 0) return
    const timer = setInterval(
      () => setRemaining((s) => Math.max(0, s - 1)),
      1000,
    )
    return () => clearInterval(timer)
  }, [done])

  useEffect(() => {
    if (remaining === 0) onEndRef.current?.()
  }, [remaining])

  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60

  return (
    <span
      role="timer"
      aria-label="Hitung mundur"
      className={cn('font-mono tabular-nums font-semibold', className)}
    >
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  )
}
