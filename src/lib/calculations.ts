import type { LoggedFood, Meal, NutritionDay, Workout, WorkoutExercise } from '@/types'

/* ─── Training volume ───────────────────────────────────────────── */

/** weight × reps summed over all sets of one exercise */
export function exerciseVolume(ex: WorkoutExercise): number {
  return ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
}

/** total kg lifted in a workout */
export function workoutVolume(w: Workout): number {
  return w.exercises.reduce((sum, ex) => sum + exerciseVolume(ex), 0)
}

export function workoutSetCount(w: Workout): number {
  return w.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
}

export function workoutDoneSetCount(w: Workout): number {
  return w.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0)
}

/** Heaviest working set across a workout — feeds personal records */
export function bestSet(w: Workout): { name: string; weight: number; reps: number } | null {
  let best: { name: string; weight: number; reps: number } | null = null
  for (const ex of w.exercises) {
    for (const s of ex.sets) {
      if (!best || s.weight > best.weight) best = { name: ex.name, weight: s.weight, reps: s.reps }
    }
  }
  return best
}

/* ─── Nutrition ─────────────────────────────────────────────────── */

export interface Macros {
  calories: number
  protein: number
  fat: number
  carbs: number
}

export const EMPTY_MACROS: Macros = { calories: 0, protein: 0, fat: 0, carbs: 0 }

/** Scale per-100g values to an arbitrary gram amount */
export function scalePer100(per100: Macros, grams: number): Macros {
  const k = grams / 100
  return {
    calories: per100.calories * k,
    protein: per100.protein * k,
    fat: per100.fat * k,
    carbs: per100.carbs * k,
  }
}

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    fat: a.fat + b.fat,
    carbs: a.carbs + b.carbs,
  }
}

export function loggedFoodMacros(item: LoggedFood): Macros {
  return scalePer100(
    { calories: item.calories, protein: item.protein, fat: item.fat, carbs: item.carbs },
    item.grams
  )
}

export function mealMacros(items: LoggedFood[]): Macros {
  return items.reduce<Macros>((acc, it) => addMacros(acc, loggedFoodMacros(it)), EMPTY_MACROS)
}

export function dayMacros(day: NutritionDay | undefined): Macros {
  if (!day) return EMPTY_MACROS
  return Object.values(day.meals).reduce<Macros>(
    (acc, items) => addMacros(acc, mealMacros(items)),
    EMPTY_MACROS
  )
}

export function emptyMeals(): Meal['type'][] {
  return ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
}

/** kcal % of goal, rounded for display */
export function pct(value: number, goal: number): number {
  if (goal <= 0) return 0
  return (value / goal) * 100
}
