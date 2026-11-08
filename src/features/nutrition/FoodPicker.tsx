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
import { t, loc, locFood } from '@/lib/i18n'
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
      base = base.filter((f) => set.has(f.id))
    }
    if (tab === 'favorites') {
      const set = new Set(favoriteFoodIds)
      base = base.filter((f) => set.has(f.id))
    }
    return base.filter(
      (f) =>
        (filter === 'All' || f.category === filter) &&
        (!needle || f.name.toLowerCase().includes(needle)),
    )
  }, [q, filter, tab, allFoods, recentIds, favoriteFoodIds])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85dvh] max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('fp_title')}</DialogTitle>
          <DialogDescription>{t('fp_desc', { n: FOODS.length })}</DialogDescription>
        </DialogHeader>

        <Segmented
          fullWidth
          size="sm"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'search', label: t('tab_search') },
            { value: 'recent', label: <span className="flex items-center gap-1"><History className="size-3" /> {t('tab_recent')}</span> },
            { value: 'favorites', label: <span className="flex items-center gap-1"><Star className="size-3" /> {t('tab_favorites')}</span> },
          ]}
        />

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t('fp_search_placeholder')}
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
              { value: 'All' as Filter, label: t('all_filter') },
              ...FOOD_CATEGORIES.map((c) => ({ value: c as Filter, label: loc('cat', c) })),
            ]}
          />
        </div>

        <ScrollArea className="-mx-2 max-h-[42dvh] min-h-40 px-2">
          {list.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {tab === 'favorites'
                  ? t('fp_no_favorites')
                  : tab === 'recent'
                    ? t('fp_no_recent')
                    : t('fp_search_not_found', { q })}
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
                          {locFood(f.id, f.name)}
                          {f.custom && <Badge variant="nutri">{t('custom_badge')}</Badge>}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground tabular">
                          {fmt(f.calories)} {t('kcal_unit')} · Б {f.protein} · Ж {f.fat} · У {f.carbs}
                          <span className="ml-1">/ 100 {t('g_unit')}</span>
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {loc('cat', f.category)}
                      </Badge>
                    </button>
                    <button
                      type="button"
                      aria-label={fav ? t('remove_food', { name: f.name }) : `☆ ${f.name}`}
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
            setTimeout(() => onCreateCustom(q.trim() || t('create_custom_default')), 180)
          }}
        >
          <Plus /> {t('create_named', { q: q.trim() || t('create_custom_default') })}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
