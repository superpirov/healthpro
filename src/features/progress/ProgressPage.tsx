import { useState } from 'react'
import { format } from 'date-fns'
import {
  Activity,
  CalendarCheck,
  Clock,
  Dumbbell,
  Flame,
  Egg,
  Trophy,
  Utensils,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { Segmented } from '@/components/ui/segmented'
import {
  ActivityChart,
  CaloriesChart,
  FrequencyChart,
  ProteinChart,
  VolumeChart,
} from '@/components/charts'
import { useAppStore } from '@/store/appStore'
import {
  useAverageMacros,
  useDailyActivity,
  useWorkoutsInRange,
} from '@/hooks/useDerived'
import { workoutVolume } from '@/lib/calculations'
import { fmt, fmtCompact, fmtDuration } from '@/lib/utils'

type Period = '7' | '30' | '90'

const PR_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  'Bench Press': Dumbbell,
  Squat: Activity,
  Deadlift: Flame,
  'Shoulder Press': Clock,
}

export function ProgressPage() {
  const [period, setPeriod] = useState<Period>('30')
  const days = Number(period)

  const workoutsAll = useAppStore((s) => s.workouts)
  const records = useAppStore((s) => s.records)

  const inRange = useWorkoutsInRange(days)
  const daily = useDailyActivity(days)
  const { avg } = useAverageMacros(days)

  const totalVolume = inRange.reduce((s, w) => s + workoutVolume(w), 0)
  const totalTime = inRange.reduce((s, w) => s + w.durationMin, 0)
  const weekWorkouts = useWorkoutsInRange(7).length

  const chartData = daily

  return (
    <div className="animate-page-in">
      <PageHeader
        title="Progress"
        description="Everything you've trained and eaten, visualized."
        actions={
          <Segmented
            value={period}
            onChange={setPeriod}
            options={[
              { value: '7', label: '7d' },
              { value: '30', label: '30d' },
              { value: '90', label: '90d' },
            ]}
          />
        }
      />

      {/* KPI grid */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Workouts"
          accent="energy"
          icon={Dumbbell}
          value={inRange.length}
          sub={`in ${days} days`}
        />
        <StatCard
          label="Total volume"
          accent="energy"
          icon={Flame}
          value={fmtCompact(totalVolume)}
          sub="kg lifted"
        />
        <StatCard
          label="Time trained"
          accent="ignite"
          icon={Clock}
          value={fmtDuration(totalTime)}
          sub={`${inRange.length ? fmt(Math.round(totalTime / inRange.length)) : 0} min avg session`}
        />
        <StatCard
          label="Avg calories"
          accent="nutri"
          icon={Utensils}
          value={fmt(avg.calories)}
          sub="kcal / day"
        />
        <StatCard
          label="Avg protein"
          accent="nutri"
          icon={Egg}
          value={`${fmt(avg.protein)} g`}
          sub="per day"
        />
        <StatCard
          label="This week"
          accent="energy"
          icon={CalendarCheck}
          value={weekWorkouts}
          sub="workouts"
        />
      </section>

      {/* Charts */}
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Training volume" accent="energy">
          <VolumeChart data={chartData.map((d) => ({ label: d.label, volume: d.volume }))} height={230} />
        </ChartCard>
        <ChartCard title="Workout frequency" accent="energy">
          <FrequencyChart data={chartData.map((d) => ({ label: d.label, workouts: d.workouts }))} height={230} />
        </ChartCard>
        <ChartCard title="Calories consumed" accent="nutri">
          <CaloriesChart data={chartData.map((d) => ({ label: d.label, calories: d.calories }))} height={230} />
        </ChartCard>
        <ChartCard title="Protein intake" accent="nutri">
          <ProteinChart data={chartData.map((d) => ({ label: d.label, protein: d.protein }))} height={230} />
        </ChartCard>
        <div className="lg:col-span-2">
          <ChartCard title="Weekly activity" accent="ignite">
            <ActivityChart data={chartData.map((d) => ({ label: d.label, minutes: d.minutes }))} height={210} />
          </ChartCard>
        </div>
      </section>

      {/* Personal records */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="size-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Personal records
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {records.map((r) => {
            const Icon = PR_ICONS[r.exerciseName] ?? Dumbbell
            return (
              <Card key={r.exerciseName} className="relative overflow-hidden p-5">
                <div
                  className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full opacity-[0.07]"
                  style={{ background: 'radial-gradient(circle, #B7F36B 0%, transparent 70%)' }}
                />
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4.5" strokeWidth={2.2} />
                  </span>
                  <Badge variant="secondary">
                    {format(new Date(r.date + 'T12:00'), 'MMM d')}
                  </Badge>
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight tabular">
                  {r.weightKg}
                  <span className="ml-1 text-base font-semibold text-muted-foreground">kg</span>
                </p>
                <p className="mt-1 text-sm font-semibold">{r.exerciseName}</p>
                <p className="text-xs text-muted-foreground">Best set × {r.reps} reps</p>
              </Card>
            )
          })}
          {records.length === 0 && (
            <Card className="col-span-full p-8 text-center text-sm text-muted-foreground">
              Log heavy sets to unlock personal records.
            </Card>
          )}
        </div>
      </section>

      <p className="mt-8 text-center text-[11px] text-muted-foreground/70">
        {workoutsAll.length} sessions in history · demo data persists locally
      </p>
    </div>
  )
}

function ChartCard({
  title,
  accent,
  children,
}: {
  title: string
  accent: 'energy' | 'nutri' | 'ignite'
  children: React.ReactNode
}) {
  const dot = { energy: 'bg-energy', nutri: 'bg-nutri', ignite: 'bg-ignite' }[accent]
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className={`size-2 rounded-full ${dot}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
