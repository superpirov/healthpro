import { NavLink, useLocation } from 'react-router-dom'
import { Activity, Apple, LayoutDashboard, Settings, Timer, TrendingUp, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { t } from '@/lib/i18n'
import { useAppStore } from '@/store/appStore'
import { ThemeToggle } from './ThemeToggle'
import { toast } from '@/components/ui/toast'

export const NAV_ITEMS = [
  { to: '/', label: t('dashboard'), icon: LayoutDashboard, end: true },
  { to: '/workouts', label: t('workouts'), icon: Activity, end: false },
  { to: '/nutrition', label: t('nutrition'), icon: Apple, end: false },
  { to: '/timer', label: t('timer'), icon: Timer, end: false },
  { to: '/progress', label: t('progress'), icon: TrendingUp, end: false },
] as const

export function Sidebar() {
  const name = useAppStore((s) => s.user.name)
  const resetDemoData = useAppStore((s) => s.resetDemoData)
  const { pathname } = useLocation()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-card/60 backdrop-blur-xl lg:flex">
      {/* Brand */}
      <div className="flex items-center justify-between gap-2.5 px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground glow-energy">
            <Zap className="size-5" strokeWidth={2.5} />
          </div>
          <div>
          <p className="text-base font-bold tracking-tight leading-none">PULSE</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t('fitness_os')}
          </p>
        </div>
        </div>
        <ThemeToggle className="size-9 shrink-0 border-transparent bg-transparent" />
      </div>

      {/* Nav */}
      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary glow-energy" />
                )}
                <Icon className="size-[18px] shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Demo user + settings */}
      <div className="m-3 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-line bg-surface-2/60 p-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-nutri/25 text-sm font-bold text-primary">
            {name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{name}</p>
            <p className="text-[11px] text-muted-foreground">{t('demo_account')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            resetDemoData()
            toast.success(t('toast_demo_reset'), t('toast_demo_reset_desc'))
          }}
          aria-label={t('reset_demo')}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2/60 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Settings className="size-4" />
        </button>
      </div>
      <p
        className={cn(
          'px-6 pb-4 text-[10px] text-muted-foreground/60',
          pathname === '/timer' && 'text-muted-foreground/40'
        )}
      >
        {t('v1_local')}
      </p>
    </aside>
  )
}
