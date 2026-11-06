import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Activity,
  Apple,
  Dumbbell,
  Flame,
  Play,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RingProgress } from '@/components/ui/ring-progress'
import { StatCard } from '@/components/ui/stat-card'
import { ActivityChart } from '@/components/charts'
import { useAppStore } from '@/store/appStore'
import {
  useDailyActivity,
  useLatestWorkout,
  useTodayMacros,
  useWeekWorkouts,
} from '@/hooks/useDerived'
import { fmt, fmtCompact, fmtDuration } from '@/lib/utils'
import { pct, workoutVolume } from '@/lib/calculations'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardPage() {
  const name = useAppStore((s) => s.user.name)
  const goals = useAppStore((s) => s.user.goals)
  const macros = useTodayMacros()
  const weekWorkouts = useWeekWorkouts()
  const latest = useLatestWorkout()
  const activity = useDailyActivity(7)

  const activeMinutes = activity.reduce((s, d) => s + d.minutes, 0)
  const kcalPct = pct(macros.calories, goals.calories)

  return (
    <div className="animate-page-in">
      {/* Greeting */}
      <header className="mb-6 flex flex-col gap-1 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting()}, {name}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-[15px]">
          Here's your fitness overview for today.
        </p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/70 lg:hidden">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </header>

      {/* KPI row */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Calories"
          accent="nutri"
          icon={Flame}
          value={
            <span className="whitespace-nowrap">
              {fmt(macros.calories)}
              <span className="text-base font-semibold text-muted-foreground">
                {' '}/ {fmt(goals.calories)}
              </span>
            </span>
          }
          sub="kcal today"
          progress={kcalPct}
          progressColor="var(--nutri)"
        />
        <StatCard
          label="Protein"
          accent="nutri"
          icon={Activity}
          value={
            <span className="whitespace-nowrap">
              {fmt(macros.protein)}
              <span className="text-base font-semibold text-muted-foreground"> / {goals.protein} g</span>
            </span>
          }
          sub={`${Math.round(pct(macros.protein, goals.protein))}% of goal`}
          progress={pct(macros.protein, goals.protein)}
          progressColor="var(--nutri)"
        />
        <StatCard
          label="Workouts"
          accent="energy"
          icon={Dumbbell}
          value={
            <>
              {weekWorkouts.length}
              <span className="ml-1.5 text-base font-semibold text-muted-foreground">
                this week
              </span>
            </>
          }
          sub={`${fmtCompact(weekWorkouts.reduce((s, w) => s + workoutVolume(w), 0))} kg volume`}
        />
        <StatCard
          label="Active time"
          accent="ignite"
          icon={Timer}
          value={fmtDuration(activeMinutes)}
          sub="last 7 days"
        />
      </section>

      {/* Main grid */}
      <section className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-5">
        {/* Nutrition ring */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Nutrition overview</CardTitle>
            <Badge variant="nutri">
              <Apple /> Today
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-2">
              <RingProgress value={kcalPct / 100} size={200} color="var(--nutri)">
                <p className="text-4xl font-bold tracking-tight tabular text-glow-energy">
                  {fmt(macros.calories)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  of {fmt(goals.calories)} kcal
                </p>
                <p className="mt-2 rounded-full bg-nutri/12 px-2.5 py-0.5 text-xs font-semibold text-nutri tabular">
                  {fmt(Math.max(0, goals.calories - macros.calories))} kcal left
                </p>
              </RingProgress>
            </div>
            <div className="mt-4 space-y-3">
              <MacroBar label="Protein" value={macros.protein} goal={goals.protein} color="var(--nutri)" />
              <MacroBar label="Fat" value={macros.fat} goal={goals.fat} color="var(--ignite)" />
              <MacroBar label="Carbs" value={macros.carbs} goal={goals.carbs} color="#60A5FA" />
            </div>
            <Button asChild variant="nutri" className="mt-5 w-full">
              <Link to="/nutrition">
                <Apple /> Log food
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          {/* Last workout */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Last workout</CardTitle>
              {latest && (
                <Badge variant="secondary">
                  {format(new Date(latest.date + 'T12:00'), 'EEE, MMM d')}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {latest ? (
                <div>
                  <p className="text-xl font-bold tracking-tight">{latest.name}</p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <MiniStat label="Duration" value={fmtDuration(latest.durationMin)} />
                    <MiniStat label="Exercises" value={String(latest.exercises.length)} />
                    <MiniStat label="Volume" value={`${fmtCompact(workoutVolume(latest))} kg`} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button asChild variant="secondary" className="flex-1">
                      <Link to={`/workouts/${latest.id}`}>View workout</Link>
                    </Button>
                    <Button asChild variant="energy" className="flex-1">
                      <Link to="/workouts/active">
                        <Play /> Start workout
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground">No workouts yet.</p>
                  <Button asChild variant="energy" className="mt-3">
                    <Link to="/workouts/active">
                      <Play /> Start your first workout
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly activity */}
          <Card className="flex-1">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Weekly activity</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/progress">
                  <TrendingUp /> Details
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ActivityChart data={activity} height={190} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-4 sm:mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <QuickAction to="/workouts/active" icon={Dumbbell} label="Start workout" hint="Log a training session" accent="energy" />
          <QuickAction to="/nutrition" icon={Apple} label="Log food" hint="Add a meal or snack" accent="nutri" />
          <QuickAction to="/timer" icon={Timer} label="Start timer" hint="HIIT & interval sessions" accent="ignite" />
          <QuickAction to="/progress" icon={TrendingUp} label="View progress" hint="Stats and personal bests" accent="neutral" />
        </div>
      </section>
    </div>
  )
}

function MacroBar({
  label,
  value,
  goal,
  color,
}: {
  label: string
  value: number
  goal: number
  color: string
}) {
  const p = pct(value, goal)
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground tabular">
          <span className="font-semibold text-foreground">{fmt(value)}</span> / {goal} g
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${Math.min(100, p)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2/50 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold tracking-tight tabular">{value}</p>
    </div>
  )
}

function QuickAction({
  to,
  icon: Icon,
  label,
  hint,
  accent,
}: {
  to: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  hint: string
  accent: 'energy' | 'nutri' | 'ignite' | 'neutral'
}) {
  const styles = {
    energy: 'group-hover:border-primary/40 group-hover:shadow-[0_0_28px_-10px_rgba(183,243,107,0.5)] [&_svg]:text-energy',
    nutri: 'group-hover:border-nutri/40 group-hover:shadow-[0_0_28px_-10px_rgba(182,156,255,0.5)] [&_svg]:text-nutri',
    ignite: 'group-hover:border-ignite/40 group-hover:shadow-[0_0_28px_-10px_rgba(255,179,107,0.5)] [&_svg]:text-ignite',
    neutral: 'group-hover:border-white/15 [&_svg]:text-muted-foreground',
  }[accent]
  return (
    <Link
      to={to}
      className={`card-hairline group rounded-2xl bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 sm:p-5 ${styles}`}
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-white/[0.05] transition-colors group-hover:bg-white/[0.09]">
        <Icon className="size-5" strokeWidth={2.2} />
      </span>
      <p className="mt-3 text-sm font-semibold">{label}</p>
      <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{hint}</p>
    </Link>
  )
}
