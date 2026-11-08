import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Dumbbell, Plus, Search } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { MUSCLE_GROUPS } from '@/data/exercises'
import { useExercises } from '@/hooks/useExercises'
import { CreateExerciseDialog } from './CreateExerciseDialog'
import { t, loc, matchExercise, locExercise, locExerciseDesc } from '@/lib/i18n'
import type { MuscleGroup } from '@/types'

type Filter = 'All' | MuscleGroup

const GROUP_COLOR: Record<MuscleGroup, string> = {
  Chest: 'bg-energy/12 text-energy',
  Back: 'bg-nutri/12 text-nutri',
  Legs: 'bg-ignite/12 text-ignite',
  Shoulders: 'bg-energy/12 text-energy',
  Arms: 'bg-nutri/12 text-nutri',
  Core: 'bg-ignite/12 text-ignite',
  Cardio: 'bg-white/[0.06] text-muted-foreground',
}

export function ExerciseLibraryPage() {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [createOpen, setCreateOpen] = useState(false)
  const exercises = useExercises()

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return exercises.filter(
      (e) =>
        (filter === 'All' || e.muscleGroup === filter) && matchExercise(needle, locExercise(e.id, e.name), e.muscleGroup, e.equipment)
    )
  }, [q, filter, exercises])

  return (
    <div className="animate-page-in">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link to="/workouts">
          <ArrowLeft /> {t('back_nav_workouts')}
        </Link>
      </Button>

      <PageHeader
        title={t('lib_title')}
        description={t('lib_desc', { n: exercises.length })}
        actions={
          <Button variant="energy" onClick={() => setCreateOpen(true)}>
            <Plus /> <span className="hidden sm:inline">{t('ce_btn')}</span>
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t('lib_search_placeholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="no-scrollbar -mx-1 overflow-x-auto px-1 sm:mx-0 sm:px-0">
          <Segmented
            size="sm"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'All' as Filter, label: t('all_filter') },
              ...MUSCLE_GROUPS.map((g) => ({ value: g as Filter, label: loc('mg', g) })),
            ]}
          />
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={t('nothing_found')}
          description={t('lib_nothing_desc', { q })}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((e) => (
            <Card key={e.id} className="flex flex-col p-4 transition-colors hover:border-white/15">
              <div className="flex items-start justify-between gap-2">
                <p className="flex min-w-0 items-center gap-1.5 font-semibold leading-snug">
                  <span className="truncate">{locExercise(e.id, e.name)}</span>
                  {e.custom && <Badge variant="nutri" className="shrink-0">{t('custom_ex_badge')}</Badge>}
                </p>
                <Badge className={`shrink-0 ${GROUP_COLOR[e.muscleGroup]} border-transparent`}>
                  {loc('mg', e.muscleGroup)}
                </Badge>
              </div>
              <p className="mt-2 flex-1 break-words text-xs leading-relaxed text-muted-foreground">
                {locExerciseDesc(e.id, e.description)}
              </p>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                {t('equipment_label')} <span className="text-muted-foreground">{loc('eq', e.equipment)}</span>
              </p>
            </Card>
          ))}
        </div>
      )}

      <CreateExerciseDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
