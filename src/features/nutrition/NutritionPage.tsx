import { useMemo, useState } from 'react'
import { subDays } from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Flame,
  Moon,
  Plus,
  Sandwich,
  Sun,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RingProgress } from '@/components/ui/ring-progress'
import { Input } from '@/components/ui/input'
import { FoodPicker } from './FoodPicker'
import { CreateFoodDialog } from './CreateFoodDialog'
import { useAppStore } from '@/store/appStore'
import { useMacrosForDate } from '@/hooks/useDerived'
import { loggedFoodMacros, mealMacros, pct } from '@/lib/calculations'
import { fmt } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { t, fdate, loc, locFood } from '@/lib/i18n'
import type { FoodItem, LoggedFood, MealType } from '@/types'

const MEALS: { type: MealType; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'Breakfast', icon: Sun },
  { type: 'Lunch', icon: Sandwich },
  { type: 'Dinner', icon: Moon },
  { type: 'Snacks', icon: Coffee },
]

let uid = 0

export function NutritionPage() {
  const nutrition = useAppStore((s) => s.nutrition)
  const goals = useAppStore((s) => s.user.goals)
  const addFoodToMeal = useAppStore((s) => s.addFoodToMeal)
  const removeFoodFromMeal = useAppStore((s) => s.removeFoodFromMeal)
  const updateFoodGrams = useAppStore((s) => s.updateFoodGrams)

  const todayISO = fdate(new Date(), 'yyyy-MM-dd')
  const [date, setDate] = useState(todayISO)
  const isToday = date === todayISO

  const macros = useMacrosForDate(date)
  const day = useMemo(() => nutrition.find((d) => d.date === date), [nutrition, date])

  const [pickerMeal, setPickerMeal] = useState<MealType | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [pendingFood, setPendingFood] = useState<FoodItem | null>(null)

  const kcalPct = pct(macros.calories, goals.calories)
  const remaining = Math.max(0, goals.calories - macros.calories)
  const overBy = Math.max(0, macros.calories - goals.calories)

  function shiftDate(delta: number) {
    const next = fdate(subDays(new Date(date + 'T12:00'), -delta), 'yyyy-MM-dd')
    if (next > todayISO) return
    setDate(next)
  }

  function quickLog(food: FoodItem, meal: MealType, grams = 100) {
    const item: LoggedFood = {
      id: `lf-${Date.now()}-${++uid}`,
      foodId: food.id,
      name: locFood(food.id, food.name),
      grams,
      calories: food.calories,
      protein: food.protein,
      fat: food.fat,
      carbs: food.carbs,
    }
    addFoodToMeal(date, meal, item)
    toast.success(t('toast_food_logged'), `${locFood(food.id, food.name)} · ${grams} ${t('g_unit')} → ${loc('meal', meal)}`)
  }

  return (
    <div className="animate-page-in">
      <PageHeader
        title={t('nutrition_title')}
        description={t('nutrition_desc')}
        actions={
          <Button
            variant="nutri"
            onClick={() => setPickerMeal(guessMeal())}
          >
            <Plus /> {t('add_food_btn')}
          </Button>
        }
      />

      {/* Date navigator */}
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-line bg-card p-2 pl-4">
        <p className="text-sm font-semibold">
          {isToday ? t('today') : fdate(new Date(date + 'T12:00'), 'EEEE')}
          <span className="ml-2 text-muted-foreground tabular">
            {fdate(new Date(date + 'T12:00'), 'd MMM yyyy')}
          </span>
        </p>
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => shiftDate(1)}
            aria-label={t('prev_day')}
          >
            <ChevronLeft />
          </Button>
          {!isToday && (
            <Button size="sm" variant="ghost" onClick={() => setDate(todayISO)}>
              {t('today_btn')}
            </Button>
          )}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => shiftDate(-1)}
            disabled={isToday}
            aria-label={t('next_day')}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* Ring + macro summary */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardContent className="pt-5">
            <div className="flex justify-center py-2">
              <RingProgress value={kcalPct / 100} size={216} color="var(--nutri)">
                <p className="text-[40px] font-bold leading-none tracking-tight tabular">
                  {fmt(macros.calories)}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {t('of_kcal_total', { total: fmt(goals.calories) })}
                </p>
                {overBy > 0 ? (
                  <p className="mt-2.5 rounded-full bg-ignite/12 px-2.5 py-0.5 text-xs font-semibold text-ignite tabular">
                    {t('kcal_over_badge', { kcal: fmt(overBy) })}
                  </p>
                ) : (
                  <p className="mt-2.5 rounded-full bg-nutri/12 px-2.5 py-0.5 text-xs font-semibold text-nutri tabular">
                    {t('kcal_left_badge', { kcal: fmt(remaining) })}
                  </p>
                )}
              </RingProgress>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3 lg:grid-cols-1">
          <MacroCard label={t('protein')} value={macros.protein} goal={goals.protein} color="var(--nutri)" />
          <MacroCard label={t('fat')} value={macros.fat} goal={goals.fat} color="var(--ignite)" />
          <MacroCard label={t('carbs')} value={macros.carbs} goal={goals.carbs} color="#60A5FA" />
        </div>
      </div>

      {/* Meals */}
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {MEALS.map(({ type, icon: Icon }) => {
          const items = day?.meals[type] ?? []
          const m = mealMacros(items)
          const mealLabel = loc('meal', type)
          return (
            <Card key={type}>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2.5 text-base">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-nutri/12 text-nutri">
                    <Icon className="size-4" />
                  </span>
                  {mealLabel}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="nutri" className="tabular">
                    <Flame /> {fmt(m.calories)} {t('kcal_unit')}
                  </Badge>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setPickerMeal(type)}
                    aria-label={t('add_food_to_meal', { meal: mealLabel })}
                  >
                    <Plus />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setPickerMeal(type)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-5 text-xs font-medium text-muted-foreground transition-colors hover:border-nutri/40 hover:text-nutri"
                  >
                    <Plus className="size-3.5" /> {t('empty_meal', { meal: mealLabel })}
                  </button>
                ) : (
                  <ul className="divide-y divide-line">
                    {items.map((it) => {
                      const lm = loggedFoodMacros(it)
                      return (
                        <li key={it.id} className="flex items-center gap-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{it.name}</p>
                            <p className="text-xs text-muted-foreground tabular">
                              {fmt(lm.calories)} {t('kcal_unit')} · Б {lm.protein.toFixed(1)} · Ж{' '}
                              {lm.fat.toFixed(1)} · У {lm.carbs.toFixed(1)}
                            </p>
                          </div>
                          <div className="flex w-24 shrink-0 items-center gap-1">
                            <Input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              value={it.grams}
                              onChange={(e) =>
                                updateFoodGrams(date, type, it.id, Number(e.target.value) || 1)
                              }
                              className="h-8 text-right text-sm tabular"
                              aria-label={t('grams_aria', { name: it.name })}
                            />
                            <span className="text-xs text-muted-foreground">{t('g_unit')}</span>
                          </div>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              removeFoodFromMeal(date, type, it.id)
                              toast.success(t('toast_food_removed'), t('toast_food_removed_desc', { name: it.name, meal: mealLabel }))
                            }}
                            aria-label={t('remove_food', { name: it.name })}
                          >
                            <Trash2 />
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                )}
                {items.length > 0 && (
                  <p className="mt-2 border-t border-line pt-2 text-right text-xs text-muted-foreground tabular">
                    {t('items_count', { n: items.length })} ·{' '}
                    {fmt(m.protein)}Б / {fmt(m.fat)}Ж / {fmt(m.carbs)}У
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground/70">
        {isToday ? t('logging_live') : t('viewing_history')} · {fmt(macros.calories)} {t('kcal_unit')} · {t('saved_locally')}
      </p>

      {/* Food picker */}
      <FoodPicker
        open={pickerMeal !== null}
        onClose={() => setPickerMeal(null)}
        onSelect={(food) => {
          if (pickerMeal) quickLog(food, pickerMeal)
          setPickerMeal(null)
        }}
        onCreateCustom={(name) => {
          setPresetName(name)
          setCreateOpen(true)
        }}
      />

      {/* Custom food creation */}
      <CreateFoodDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        presetName={presetName}
        onCreated={(food) => setPendingFood(food)}
      />

      {/* After creating a custom food, offer to log it right away */}
      {pendingFood && (
        <QuickLogDialog
          food={pendingFood}
          defaultMeal={guessMeal()}
          onLog={(meal, grams) => {
            quickLog(pendingFood, meal, grams)
            setPendingFood(null)
          }}
          onClose={() => setPendingFood(null)}
        />
      )}
    </div>
  )
}

function MacroCard({
  label,
  value,
  goal,
  color,
}: {
  label: string
  value: number
  goal: number
  color: string
}) {
  const p = pct(value, goal)
  return (
    <Card className="flex flex-row items-center justify-between gap-4 p-4 sm:p-5 lg:flex-col lg:items-stretch">
      <div className="flex items-baseline gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="ml-auto text-2xl font-bold tracking-tight tabular lg:ml-0 lg:mt-2 lg:w-full">
          {fmt(value)}
          <span className="text-sm font-semibold text-muted-foreground"> / {goal} {t('g_unit')}</span>
        </p>
      </div>
      <div className="hidden h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] lg:mt-3 lg:block">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${Math.min(100, p)}%`, backgroundColor: color }}
        />
      </div>
    </Card>
  )
}

function guessMeal(): MealType {
  const h = new Date().getHours()
  if (h < 11) return 'Breakfast'
  if (h < 16) return 'Lunch'
  if (h < 21) return 'Dinner'
  return 'Snacks'
}

function QuickLogDialog({
  food,
  defaultMeal,
  onLog,
  onClose,
}: {
  food: FoodItem
  defaultMeal: MealType
  onLog: (meal: MealType, grams: number) => void
  onClose: () => void
}) {
  const [meal, setMeal] = useState<MealType>(defaultMeal)
  const [grams, setGrams] = useState(100)
  const kcal = Math.round((food.calories * grams) / 100)
  return (
    <Card className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md p-4 shadow-2xl shadow-black/60 backdrop-blur sm:bottom-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">{t('quick_log_question', { name: locFood(food.id, food.name) })}</p>
          <p className="text-xs text-muted-foreground tabular">
            {t('kcal_macro_line', { kcal, p: ((food.protein * grams) / 100).toFixed(1), f: ((food.fat * grams) / 100).toFixed(1), c: ((food.carbs * grams) / 100).toFixed(1) })}
          </p>
        </div>
        <UtensilsCrossed className="size-5 shrink-0 text-nutri" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {MEALS.map(({ type }) => (
          <Button
            key={type}
            size="sm"
            variant={meal === type ? 'nutri' : 'outline'}
            onClick={() => setMeal(type)}
          >
            {loc('meal', type)}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <Input
            type="number"
            min={1}
            value={grams}
            onChange={(e) => setGrams(Math.max(1, Number(e.target.value) || 1))}
            className="h-8 w-20 text-right text-sm tabular"
            aria-label={t('grams_label')}
          />
          <span className="text-xs text-muted-foreground">{t('g_unit')}</span>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={onClose}>
          {t('not_now')}
        </Button>
        <Button variant="nutri" className="flex-1" onClick={() => onLog(meal, grams)}>
          {t('add_to_meal_btn', { meal: loc('meal', meal) })}
        </Button>
      </div>
    </Card>
  )
}
