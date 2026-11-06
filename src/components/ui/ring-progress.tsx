import * as React from 'react'
import { cn } from '@/lib/utils'

interface RingProgressProps {
  /** 0..∞ — clamped at 1 */
  value: number
  size?: number
  stroke?: number
  /** hex color of the progress arc */
  color?: string
  trackColor?: string
  className?: string
  children?: React.ReactNode
  glow?: boolean
}

/** SVG ring with rounded cap and optional glow — used on Nutrition & Dashboard */
export function RingProgress({
  value,
  size = 220,
  stroke = 14,
  color = '#B7F36B',
  trackColor = 'rgba(255,255,255,0.06)',
  className,
  children,
  glow = true,
}: RingProgressProps) {
  const pct = Math.max(0, Math.min(1, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = c * pct
  const id = React.useId()

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{
            transition: 'stroke-dasharray 0.7s cubic-bezier(0.21,0.47,0.32,0.98)',
            filter: glow ? `url(#${id}-glow)` : undefined,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
