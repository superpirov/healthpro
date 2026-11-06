import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

type Accent = 'energy' | 'nutri' | 'ignite' | 'neutral'

const ACCENT_ICON: Record<Accent, string> = {
  energy: 'bg-energy/12 text-energy',
  nutri: 'bg-nutri/12 text-nutri',
  ignite: 'bg-ignite/12 text-ignite',
  neutral: 'bg-white/6 text-muted-foreground',
}

interface StatCardProps extends React.ComponentProps<'div'> {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
  accent?: Accent
  /** 0..100 thin progress under the value */
  progress?: number
  progressColor?: string
}

/** KPI card: big expressive number + optional hairline progress */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'neutral',
  progress,
  progressColor,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn('p-4 sm:p-5', className)} {...props}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span className={cn('flex size-8 items-center justify-center rounded-lg', ACCENT_ICON[accent])}>
            <Icon className="size-4" strokeWidth={2.2} />
          </span>
        )}
      </div>
      <p className="mt-3 text-[26px] font-bold tracking-tight tabular leading-none sm:text-[34px]">
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-muted-foreground tabular">{sub}</p>}
      {progress !== undefined && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={cn('h-full rounded-full transition-[width] duration-700', !progressColor && 'bg-primary')}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: progressColor }}
          />
        </div>
      )}
    </Card>
  )
}
