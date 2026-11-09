import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Search } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { EXERCISES, MUSCLE_GROUPS } from '@/data/exercises'
import { GUIDES, guideImage } from '@/data/guides'
import { t, loc, matchExercise, locExercise } from '@/lib/i18n'
import type { MuscleGroup } from '@/types'

type Filter = 'All' | MuscleGroup

export function GuidesPage() {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('All')

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return EXERCISES.filter(
      (e) =>
        GUIDES[e.id] &&
        (filter === 'All' || e.muscleGroup === filter) &&
        matchExercise(needle, locExercise(e.id, e.name), e.muscleGroup, e.equipment)
    )
  }, [q, filter])

  return (
    <div className="animate-page-in">
      <PageHeader title={t('guides_title')} description={t('guides_desc')} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t('guides_search')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={t('guides_search')}
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
        <EmptyState icon={BookOpen} title={t('guides_empty')} description={t('guides_empty_desc')} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {list.map((e) => (
            <Link key={e.id} to={`/guides/${e.id}`} className="group min-w-0">
              <Card className="flex h-full min-w-0 flex-col overflow-hidden transition-colors group-hover:border-white/15">
                <div className="aspect-[4/3] w-full bg-white">
                  <img
                    src={guideImage(e.id, 0)}
                    alt=""
                    loading="lazy"
                    className="size-full object-contain"
                  />
                </div>
                <div className="flex flex-1 flex-col p-3.5">
                  <p className="font-semibold leading-snug">{locExercise(e.id, e.name)}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-2.5">
                    <Badge variant="secondary">{loc('mg', e.muscleGroup)}</Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {loc('eq', e.equipment)}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground/70">
        {t('guide_source_note')}
      </p>
    </div>
  )
}
