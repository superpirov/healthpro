import { useState } from 'react'
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
import { t, fdate, locRecordName } from '@/lib/i18n'

type Period = '7' | '30' | '90'

const PR_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  'Жим штанги лёжа': Dumbbell,
  'Приседания со штангой': Activity,
  'Становая тяга': Flame,
  'Жим штанги стоя': Clock,
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
        title={t('progress_title')}
        description={t('progress_desc')}
        actions={
          <Segmented
            value={period}
            onChange={setPeriod}
            options={[
              { value: '7', label: t('prd_7') },
              { value: '30', label: t('prd_30') },
              { value: '90', label: t('prd_90') },
            ]}
          />
        }
      />

      {/* KPI grid */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label={t('kpi_workouts')}
          accent="energy"
          icon={Dumbbell}
          value={inRange.length}
          sub={t('in_days', { days })}
        />
        <StatCard
          label={t('stat_volume')}
          accent="energy"
          icon={Flame}
          value={fmtCompact(totalVolume)}
          sub={t('kg_lifted')}
        />
        <StatCard
          label={t('time_trained')}
          accent="ignite"
          icon={Clock}
          value={fmtDuration(totalTime)}
          sub={`${inRange.length ? fmt(Math.round(totalTime / inRange.length)) : 0} ${t('min_avg')}`}
        />
        <StatCard
          label={t('avg_calories')}
          accent="nutri"
          icon={Utensils}
          value={fmt(avg.calories)}
          sub={t('kcal_per_day')}
        />
        <StatCard
          label={t('avg_protein')}
          accent="nutri"
          icon={Egg}
          value={`${fmt(avg.protein)} ${t('g_unit')}`}
          sub={t('per_day')}
        />
        <StatCard
          label={t('stat_this_week')}
          accent="energy"
          icon={CalendarCheck}
          value={weekWorkouts}
          sub={t('stat_workouts_sub')}
        />
      </section>

      {/* Charts */}
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title={t('chart_volume')} accent="energy">
          <VolumeChart data={chartData.map((d) => ({ label: d.label, volume: d.volume }))} height={230} />
        </ChartCard>
        <ChartCard title={t('chart_frequency')} accent="energy">
          <FrequencyChart data={chartData.map((d) => ({ label: d.label, workouts: d.workouts }))} height={230} />
        </ChartCard>
        <ChartCard title={t('chart_calories')} accent="nutri">
          <CaloriesChart data={chartData.map((d) => ({ label: d.label, calories: d.calories }))} height={230} />
        </ChartCard>
        <ChartCard title={t('chart_protein')} accent="nutri">
          <ProteinChart data={chartData.map((d) => ({ label: d.label, protein: d.protein }))} height={230} />
        </ChartCard>
        <div className="lg:col-span-2">
          <ChartCard title={t('chart_activity')} accent="ignite">
            <ActivityChart data={chartData.map((d) => ({ label: d.label, minutes: d.minutes }))} height={210} />
          </ChartCard>
        </div>
      </section>

      {/* Personal records */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="size-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {t('personal_records')}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {records.map((r) => {
            const Icon = PR_ICONS[locRecordName(r.exerciseName)] ?? Dumbbell
            return (
              <Card key={locRecordName(r.exerciseName)} className="relative overflow-hidden p-5">
                <div
                  className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full opacity-[0.07]"
                  style={{ background: 'radial-gradient(circle, #B7F36B 0%, transparent 70%)' }}
                />
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4.5" strokeWidth={2.2} />
                  </span>
                  <Badge variant="secondary">
                    {fdate(new Date(r.date + 'T12:00'), 'd MMM')}
                  </Badge>
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight tabular">
                  {r.weightKg}
                  <span className="ml-1 text-base font-semibold text-muted-foreground">{t('kg_unit')}</span>
                </p>
                <p className="mt-1 text-sm font-semibold">{locRecordName(r.exerciseName)}</p>
                <p className="text-xs text-muted-foreground">{t('best_set_reps', { reps: r.reps })}</p>
              </Card>
            )
          })}
          {records.length === 0 && (
            <Card className="col-span-full p-8 text-center text-sm text-muted-foreground">
              {t('records_empty')}
            </Card>
          )}
        </div>
      </section>

      <p className="mt-8 text-center text-[11px] text-muted-foreground/70">
        {t('sessions_in_history', { n: workoutsAll.length })}
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
