import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.ComponentProps<'div'> {
  value: number // 0..100 (can exceed 100 — clamped visually)
  indicatorClassName?: string
}

/** Lightweight hairline progress bar styled for FORMA */
function Progress({
  value,
  className,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full bg-primary transition-[width] duration-500 ease-out',
          indicatorClassName
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export { Progress }
