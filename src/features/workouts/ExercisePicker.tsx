import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Segmented } from '@/components/ui/segmented'
import { EXERCISES, MUSCLE_GROUPS } from '@/data/exercises'
import { t, loc, matchExercise, locExercise } from '@/lib/i18n'
import type { MuscleGroup } from '@/types'

type Filter = 'All' | MuscleGroup

export function ExercisePicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (exerciseId: string) => void
}) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('All')

  useEffect(() => {
    if (open) {
      setQ('')
      setFilter('All')
    }
  }, [open])

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return EXERCISES.filter(
      (e) => (filter === 'All' || e.muscleGroup === filter) && matchExercise(needle, e.name, e.muscleGroup, e.equipment),
    )
  }, [q, filter])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85dvh] max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('picker_add_exercise')}</DialogTitle>
          <DialogDescription>{t('picker_in_library', { n: EXERCISES.length })}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t('search_exercises')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
        </div>
        <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
          <Segmented
            size="sm"
            value={filter}
            onChange={setFilter}
            options={[{ value: 'All' as Filter, label: t('all_filter') }, ...MUSCLE_GROUPS.map((g) => ({ value: g as Filter, label: loc('mg', g) }))]}
          />
        </div>
        <ScrollArea className="-mx-2 max-h-[45dvh] min-h-40 px-2">
          {list.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t('nothing_found_q', { q })}
            </p>
          ) : (
            <ul className="space-y-1.5 pb-2">
              {list.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(e.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-colors hover:border-line hover:bg-secondary"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{locExercise(e.id, e.name)}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{loc('eq', e.equipment)}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {loc('mg', e.muscleGroup)}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
