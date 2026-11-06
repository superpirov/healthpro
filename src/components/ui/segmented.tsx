import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Segmented control — used for period switchers (7d / 30d / 90d)
 * and compact option groups. Pill style, hairline border.
 */
interface SegmentedProps<T extends string>
  extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  value: T
  options: { value: T; label: React.ReactNode }[]
  onChange: (value: T) => void
  size?: 'sm' | 'default'
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = 'default',
  className,
  ...props
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      data-slot="segmented"
      className={cn(
        'inline-flex items-center rounded-xl border border-line bg-surface-2 p-1',
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
              'rounded-lg font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 whitespace-nowrap cursor-pointer',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
              active
                ? 'bg-card text-foreground shadow-sm shadow-black/20'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
