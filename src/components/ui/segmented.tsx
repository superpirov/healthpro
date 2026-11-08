import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Segmented control — used for period switchers (7d / 30d / 90d),
 * filters and compact option groups. Pill style, hairline border,
 * with a spring-driven sliding highlight between options.
 */
interface SegmentedProps<T extends string>
  extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  value: T
  options: { value: T; label: React.ReactNode }[]
  onChange: (value: T) => void
  size?: 'sm' | 'default'
  /** Stretch the control and its options to fill the available width. */
  fullWidth?: boolean
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = 'default',
  fullWidth = false,
  className,
  ...props
}: SegmentedProps<T>) {
  const layoutId = React.useId()

  return (
    <div
      role="tablist"
      data-slot="segmented"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-xl border border-line bg-surface-2 p-1',
        fullWidth && 'flex w-full',
        className
      )}
      {...props}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative isolate flex cursor-pointer items-center justify-center rounded-lg font-semibold whitespace-nowrap outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring/50',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
              fullWidth && 'flex-1',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {active && (
              <motion.span
                layoutId={`segmented-indicator-${layoutId}`}
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-lg bg-card shadow-sm shadow-black/20"
                transition={{ type: 'spring', stiffness: 520, damping: 40, mass: 0.7 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1">
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
