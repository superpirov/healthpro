import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format, parseISO, startOfWeek, subDays } from 'date-fns'
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Layers,
  Play,
  Plus,
} from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/segmented'
import { StatCard } from '@/components/ui/stat-card'
import { VolumeChart } from '@/components/charts'
import { useAppStore } from '@/store/appStore'
import { useDailyActivity } from '@/hooks/useDerived'
import { workoutVolume } from '@/lib/calculations'
import { fmt, fmtCompact, fmtDuration } from '@/lib/utils'
import type { Workout } from '@/types'

type Period = '7' | '30' | '90'

export function relativeDay(dateISO: string): string {
  const d = parseISO(dateISO)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - d.getTime()) / 86400_000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  return format(d, 'MMM d')
}

export function WorkoutsPage() {
  const workouts = useAppStore((s) => s.workouts)
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('30')
  const days = Number(period)

  const inRange = useMemo(() => {
    const from = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')
    return workouts.filter((w) => w.date >= from)
  }, [workouts, days])

  const weekCount = useMemo(() => {
    const ws = startOfWeek(new Date(), { weekStartsOn: 1 })
    return workouts.filter((w) => parseISO(w.date) >= ws).length
  }, [workouts])

  const totalVolume = inRange.reduce((s, w) => s + workoutVolume(w), 0)
  const totalMinutes = inRange.reduce((s, w) => s + w.durationMin, 0)
  const last = workouts.length ? workouts[workouts.length - 1] : null

  const chartData = useDailyActivity(days).map((d) => ({ label: d.label, volume: d.volume }))
  const history = useMemo(() => [...workouts].reverse(), [workouts])

  return (
    <div className="animate-page-in">
      <PageHeader
        title="Workouts"
        description="Your strength training diary and history."
        actions={
          <>
            <Button asChild variant="outline" size="icon" className="hidden sm:inline-flex">
              <Link to="/workouts/exercises" aria-label="Exercise library">
                <BookOpen />
              </Link>
            </Button>
            <Button asChild variant="energy">
              <Link to="/workouts/active">
                <Play /> New workout
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 flex justify-end">
        <Segmented
          size="sm"
          value={period}
          onChange={setPeriod}
          options={[
            { value: '7', label: '7 days' },
            { value: '30', label: '30 days' },
            { value: '90', label: '90 days' },
          ]}
        />
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="This week" accent="energy" icon={Dumbbell} value={weekCount} sub="workouts" />
        <StatCard
          label="Volume"
          accent="energy"
          icon={Flame}
          value={`${fmtCompact(totalVolume)}`}
          sub={`kg over ${days} days`}
        />
        <StatCard
          label="Total time"
          accent="ignite"
          icon={Clock}
          value={fmtDuration(totalMinutes)}
          sub={`${inRange.length} sessions`}
        />
        {last ? (
          <Card className="col-span-2 p-4 sm:col-span-1 sm:p-5 xl:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Last session
            </p>
            <Link to={`/workouts/${last.id}`} className="group mt-2 block">
              <p className="truncate text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
                {last.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {relativeDay(last.date)} · {fmtDuration(last.durationMin)} ·{' '}
                {fmtCompact(workoutVolume(last))} kg
              </p>
            </Link>
          </Card>
        ) : (
          <StatCard label="Last session" value="—" sub="no data" />
        )}
      </section>

      {/* Activity chart */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Training volume</CardTitle>
        </CardHeader>
        <CardContent>
          <VolumeChart data={chartData} height={210} />
        </CardContent>
      </Card>

      {/* History */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            History
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/workouts/exercises">
              <BookOpen /> Exercise library
            </Link>
          </Button>
        </div>
        {history.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="No workouts yet"
            description="Start your first session and it will appear here with full details."
            action={
              <Button asChild variant="energy">
                <Link to="/workouts/active">
                  <Plus /> New workout
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {history.map((w) => (
              <WorkoutRow key={w.id} workout={w} onClick={() => navigate(`/workouts/${w.id}`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export function WorkoutRow({ workout: w, onClick }: { workout: Workout; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-hairline group flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left transition-all duration-200 hover:-translate-y-px hover:border-primary/30"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-energy/12 text-energy">
        <Dumbbell className="size-5" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold">{w.name}</p>
          <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
            {w.type}
          </Badge>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground tabular">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" /> {relativeDay(w.date)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {fmtDuration(w.durationMin)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers className="size-3.5" /> {w.exercises.length} exercises
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Flame className="size-3.5" /> {fmt(workoutVolume(w))} kg
          </span>
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
    </button>
  )
}
