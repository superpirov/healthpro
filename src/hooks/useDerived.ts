import { useMemo } from 'react'
import { parseISO, startOfWeek, isWithinInterval, format, subDays } from 'date-fns'
import { useAppStore } from '@/store/appStore'
import { dayMacros, workoutVolume, type Macros } from '@/lib/calculations'
import { todayISO } from '@/data/demoData'
import type { NutritionDay, Workout } from '@/types'

const toDate = (iso: string) => parseISO(iso)

/** Workouts of the current ISO week (Mon..Sun) */
export function useWeekWorkouts(): Workout[] {
  const workouts = useAppStore((s) => s.workouts)
  return useMemo(() => {
    const ws = startOfWeek(new Date(), { weekStartsOn: 1 })
    return workouts.filter((w) => toDate(w.date) >= ws)
  }, [workouts])
}

export function useLatestWorkout(): Workout | null {
  const workouts = useAppStore((s) => s.workouts)
  return useMemo(
    () => (workouts.length ? workouts[workouts.length - 1] : null),
    [workouts]
  )
}

export function useTodayMacros(): Macros {
  const nutrition = useAppStore((s) => s.nutrition)
  return useMemo(() => {
    const t = todayISO()
    return dayMacros(nutrition.find((d) => d.date === t))
  }, [nutrition])
}

export function useMacrosForDate(date: string): Macros {
  const nutrition = useAppStore((s) => s.nutrition)
  return useMemo(
    () => dayMacros(nutrition.find((d) => d.date === date)),
    [nutrition, date]
  )
}

export function useNutritionDay(date: string): NutritionDay | undefined {
  const nutrition = useAppStore((s) => s.nutrition)
  return useMemo(
    () => nutrition.find((d) => d.date === date),
    [nutrition, date]
  )
}

export interface DayActivity {
  date: string
  label: string
  workouts: number
  volume: number
  minutes: number
  calories: number
  protein: number
}

/** Per-day aggregates for the last N days — powers all charts */
export function useDailyActivity(days: number): DayActivity[] {
  const workouts = useAppStore((s) => s.workouts)
  const nutrition = useAppStore((s) => s.nutrition)
  return useMemo(() => {
    const out: DayActivity[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const iso = format(d, 'yyyy-MM-dd')
      const dayWorkouts = workouts.filter((w) => w.date === iso)
      const m = dayMacros(nutrition.find((x) => x.date === iso))
      out.push({
        date: iso,
        label: format(d, days > 10 ? 'd MMM' : 'EEE'),
        workouts: dayWorkouts.length,
        volume: dayWorkouts.reduce((s, w) => s + workoutVolume(w), 0),
        minutes: dayWorkouts.reduce((s, w) => s + w.durationMin, 0),
        calories: Math.round(m.calories),
        protein: Math.round(m.protein),
      })
    }
    return out
  }, [workouts, nutrition, days])
}

/** Sum of macros over the last N days that have any data */
export function useAverageMacros(days: number): { avg: Macros; daysCount: number } {
  const nutrition = useAppStore((s) => s.nutrition)
  return useMemo(() => {
    const from = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')
    const relevant = nutrition.filter((d) => d.date >= from)
    if (relevant.length === 0) return { avg: { calories: 0, protein: 0, fat: 0, carbs: 0 }, daysCount: 0 }
    const totals = relevant.reduce<Macros>(
      (acc, d) => {
        const m = dayMacros(d)
        return {
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          fat: acc.fat + m.fat,
          carbs: acc.carbs + m.carbs,
        }
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    )
    const n = relevant.length
    return {
      avg: {
        calories: totals.calories / n,
        protein: totals.protein / n,
        fat: totals.fat / n,
        carbs: totals.carbs / n,
      },
      daysCount: n,
    }
  }, [nutrition, days])
}

/** Workouts within the last N days */
export function useWorkoutsInRange(days: number): Workout[] {
  const workouts = useAppStore((s) => s.workouts)
  return useMemo(() => {
    const from = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')
    return workouts.filter((w) => w.date >= from)
  }, [workouts, days])
}

export function useWorkoutById(id: string | undefined): Workout | null {
  const workouts = useAppStore((s) => s.workouts)
  return useMemo(() => workouts.find((w) => w.id === id) ?? null, [workouts, id])
}

export { toDate, isWithinInterval }
