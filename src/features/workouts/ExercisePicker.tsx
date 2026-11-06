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
      (e) =>
        (filter === 'All' || e.muscleGroup === filter) &&
        (!needle || e.name.toLowerCase().includes(needle) || e.muscleGroup.toLowerCase().includes(needle))
    )
  }, [q, filter])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85dvh] max-w-lg">
        <DialogHeader>
          <DialogTitle>Add exercise</DialogTitle>
          <DialogDescription>{EXERCISES.length} exercises in the library.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search exercises…"
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
            options={[{ value: 'All' as Filter, label: 'All' }, ...MUSCLE_GROUPS.map((g) => ({ value: g as Filter, label: g }))]}
          />
        </div>
        <ScrollArea className="-mx-2 max-h-[45dvh] min-h-40 px-2">
          {list.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing found for “{q}”.
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
                      <p className="truncate text-sm font-semibold">{e.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{e.equipment}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {e.muscleGroup}
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
