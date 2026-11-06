import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Dumbbell, Search } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { EXERCISES, MUSCLE_GROUPS } from '@/data/exercises'
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

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return EXERCISES.filter(
      (e) =>
        (filter === 'All' || e.muscleGroup === filter) &&
        (!needle ||
          e.name.toLowerCase().includes(needle) ||
          e.equipment.toLowerCase().includes(needle) ||
          e.muscleGroup.toLowerCase().includes(needle))
    )
  }, [q, filter])

  return (
    <div className="animate-page-in">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link to="/workouts">
          <ArrowLeft /> Workouts
        </Link>
      </Button>

      <PageHeader
        title="Exercise library"
        description={`${EXERCISES.length} exercises across 7 muscle groups.`}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, muscle or equipment…"
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
              { value: 'All' as Filter, label: 'All' },
              ...MUSCLE_GROUPS.map((g) => ({ value: g as Filter, label: g })),
            ]}
          />
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Nothing found"
          description={`No exercises match “${q}”. Try a different name or category.`}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((e) => (
            <Card key={e.id} className="flex flex-col p-4 transition-colors hover:border-white/15">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold leading-snug">{e.name}</p>
                <Badge className={`shrink-0 ${GROUP_COLOR[e.muscleGroup]} border-transparent`}>
                  {e.muscleGroup}
                </Badge>
              </div>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                {e.description}
              </p>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                Equipment: <span className="text-muted-foreground">{e.equipment}</span>
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
