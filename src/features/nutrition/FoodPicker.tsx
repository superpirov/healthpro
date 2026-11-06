import { useEffect, useMemo, useState } from 'react'
import { History, Plus, Search, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Segmented } from '@/components/ui/segmented'
import { FOODS, FOOD_CATEGORIES } from '@/data/foods'
import { useAppStore } from '@/store/appStore'
import { fmt } from '@/lib/utils'
import type { FoodCategory, FoodItem } from '@/types'

type Filter = 'All' | FoodCategory

/** Recent picks = foods logged in the last 14 days, most recent first */
function useRecentFoodIds(): string[] {
  const nutrition = useAppStore((s) => s.nutrition)
  return useMemo(() => {
    const from = new Date()
    from.setDate(from.getDate() - 14)
    const fromISO = from.toISOString().slice(0, 10)
    const seen: string[] = []
    const days = [...nutrition].filter((d) => d.date >= fromISO).sort((a, b) => (a.date < b.date ? 1 : -1))
    for (const d of days) {
      for (const items of Object.values(d.meals)) {
        for (const it of items) {
          if (!seen.includes(it.foodId)) seen.push(it.foodId)
        }
      }
    }
    return seen.slice(0, 30)
  }, [nutrition])
}

export function FoodPicker({
  open,
  onClose,
  onSelect,
  onCreateCustom,
}: {
  open: boolean
  onClose: () => void
  onSelect: (food: FoodItem) => void
  onCreateCustom: (name: string) => void
}) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [tab, setTab] = useState<'search' | 'recent' | 'favorites'>('search')

  const customFoods = useAppStore((s) => s.customFoods)
  const favoriteFoodIds = useAppStore((s) => s.favoriteFoodIds)
  const toggleFavoriteFood = useAppStore((s) => s.toggleFavoriteFood)
  const recentIds = useRecentFoodIds()

  useEffect(() => {
    if (open) {
      setQ('')
      setFilter('All')
      setTab('search')
    }
  }, [open])

  const allFoods = useMemo(() => [...customFoods, ...FOODS], [customFoods])

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let base = allFoods
    if (tab === 'recent') {
      const set = new Set(recentIds)
      base = allFoods.filter((f) => set.has(f.id))
    } else if (tab === 'favorites') {
      base = allFoods.filter((f) => favoriteFoodIds.includes(f.id))
    }
    return base.filter(
      (f) =>
        (filter === 'All' || f.category === filter) &&
        (!needle || f.name.toLowerCase().includes(needle) || f.category.toLowerCase().includes(needle))
    )
  }, [allFoods, tab, filter, q, recentIds, favoriteFoodIds])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88dvh] max-w-lg">
        <DialogHeader>
          <DialogTitle>Add food</DialogTitle>
          <DialogDescription>Search {FOODS.length} foods or create your own.</DialogDescription>
        </DialogHeader>

        <Segmented
          size="sm"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'search', label: 'Search' },
            { value: 'recent', label: <span className="flex items-center gap-1"><History className="size-3" /> Recent</span> },
            { value: 'favorites', label: <span className="flex items-center gap-1"><Star className="size-3" /> Favorites</span> },
          ]}
          className="w-full justify-between"
        />

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search foods…"
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
            options={[
              { value: 'All' as Filter, label: 'All' },
              ...FOOD_CATEGORIES.map((c) => ({ value: c as Filter, label: c })),
            ]}
          />
        </div>

        <ScrollArea className="-mx-2 max-h-[42dvh] min-h-40 px-2">
          {list.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {tab === 'favorites'
                  ? 'No favorites yet — tap the star on any food.'
                  : tab === 'recent'
                    ? 'Nothing logged in the last 14 days.'
                    : `Nothing found for “${q}”.`}
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5 pb-2">
              {list.map((f) => {
                const fav = favoriteFoodIds.includes(f.id)
                return (
                  <li key={f.id} className="group flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSelect(f)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-colors hover:border-line hover:bg-secondary"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                          {f.name}
                          {f.custom && <Badge variant="nutri">Custom</Badge>}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground tabular">
                          {fmt(f.calories)} kcal · P {f.protein} · F {f.fat} · C {f.carbs}
                          <span className="ml-1">/ 100 g</span>
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {f.category}
                      </Badge>
                    </button>
                    <button
                      type="button"
                      aria-label={fav ? `Remove ${f.name} from favorites` : `Add ${f.name} to favorites`}
                      onClick={() => toggleFavoriteFood(f.id)}
                      className="rounded-lg p-2 text-muted-foreground/60 transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Star className={fav ? 'size-4 fill-nutri text-nutri' : 'size-4'} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            onClose()
            // let the picker dialog close before opening the create one
            setTimeout(() => onCreateCustom(q.trim()), 180)
          }}
        >
          <Plus /> Create “{q.trim() || 'custom food'}”
        </Button>
      </DialogContent>
    </Dialog>
  )
}
