import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  FoodItem,
  LoggedFood,
  MealType,
  NutritionDay,
  NutritionGoals,
  PersonalRecord,
  Workout,
} from '@/types'
import {
  DEMO_USER,
  buildDemoNutrition,
  buildDemoRecords,
  buildDemoWorkouts,
} from '@/data/demoData'

interface AppState {
  user: typeof DEMO_USER
  workouts: Workout[]
  nutrition: NutritionDay[]
  customFoods: FoodItem[]
  favoriteFoodIds: string[]
  records: PersonalRecord[]
  theme: 'dark' | 'light'

  /* workouts */
  addWorkout: (w: Workout) => void
  updateWorkout: (w: Workout) => void
  deleteWorkout: (id: string) => void

  /* nutrition */
  ensureDay: (date: string) => void
  addFoodToMeal: (date: string, meal: MealType, item: LoggedFood) => void
  removeFoodFromMeal: (date: string, meal: MealType, itemId: string) => void
  updateFoodGrams: (date: string, meal: MealType, itemId: string, grams: number) => void
  setGoals: (goals: NutritionGoals) => void
  addCustomFood: (food: FoodItem) => void
  toggleFavoriteFood: (foodId: string) => void

  /* misc */
  setTheme: (t: 'dark' | 'light') => void
  resetDemoData: () => void
}

function seedState() {
  return {
    user: DEMO_USER,
    workouts: buildDemoWorkouts(),
    nutrition: buildDemoNutrition(),
    customFoods: [] as FoodItem[],
    favoriteFoodIds: ['chicken-breast', 'rice-white', 'eggs', 'banana', 'oatmeal', 'greek-yogurt'],
    records: buildDemoRecords(),
    theme: 'dark' as const,
  }
}

const emptyDay = (date: string): NutritionDay => ({
  date,
  meals: { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] },
})

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...seedState(),

      addWorkout: (w) =>
        set((s) => {
          const workouts = [...s.workouts, w].sort((a, b) => a.createdAt - b.createdAt)
          return { workouts, records: mergeRecords(s.records, w) }
        }),

      updateWorkout: (w) =>
        set((s) => ({
          workouts: s.workouts
            .map((x) => (x.id === w.id ? w : x))
            .sort((a, b) => a.createdAt - b.createdAt),
        })),

      deleteWorkout: (id) =>
        set((s) => ({ workouts: s.workouts.filter((x) => x.id !== id) })),

      ensureDay: (date) =>
        set((s) =>
          s.nutrition.some((d) => d.date === date)
            ? {}
            : { nutrition: [...s.nutrition, emptyDay(date)] }
        ),

      addFoodToMeal: (date, meal, item) => {
        get().ensureDay(date)
        set((s) => ({
          nutrition: s.nutrition.map((d) =>
            d.date === date
              ? { ...d, meals: { ...d.meals, [meal]: [...d.meals[meal], item] } }
              : d
          ),
        }))
      },

      removeFoodFromMeal: (date, meal, itemId) =>
        set((s) => ({
          nutrition: s.nutrition.map((d) =>
            d.date === date
              ? {
                  ...d,
                  meals: {
                    ...d.meals,
                    [meal]: d.meals[meal].filter((i) => i.id !== itemId),
                  },
                }
              : d
          ),
        })),

      updateFoodGrams: (date, meal, itemId, grams) =>
        set((s) => ({
          nutrition: s.nutrition.map((d) =>
            d.date === date
              ? {
                  ...d,
                  meals: {
                    ...d.meals,
                    [meal]: d.meals[meal].map((i) =>
                      i.id === itemId ? { ...i, grams: Math.max(1, grams) } : i
                    ),
                  },
                }
              : d
          ),
        })),

      setGoals: (goals) => set((s) => ({ user: { ...s.user, goals } })),

      addCustomFood: (food) =>
        set((s) => ({ customFoods: [...s.customFoods, food] })),

      toggleFavoriteFood: (foodId) =>
        set((s) => ({
          favoriteFoodIds: s.favoriteFoodIds.includes(foodId)
            ? s.favoriteFoodIds.filter((id) => id !== foodId)
            : [...s.favoriteFoodIds, foodId],
        })),

      setTheme: (theme) => set({ theme }),

      resetDemoData: () => set({ ...seedState() }),
    }),
    {
      name: 'pulse-app-v1',
      version: 2,
      // v2: demo data is now fully Russian — old English demo seeds are reseeded
      migrate: (state, from) => (from < 2 ? seedState() : state),
    }
  )
)

/** Keep personal records consistent when a new workout beats a PR */
function mergeRecords(records: PersonalRecord[], w: Workout): PersonalRecord[] {
  let next = records
  for (const ex of w.exercises) {
    for (const st of ex.sets) {
      if (st.weight <= 0) continue
      const existing = next.find((r) => r.exerciseName === ex.name)
      if (!existing || st.weight > existing.weightKg) {
        const rec: PersonalRecord = {
          exerciseName: ex.name,
          weightKg: st.weight,
          reps: st.reps,
          date: w.date,
        }
        next = existing
          ? next.map((r) => (r.exerciseName === ex.name ? rec : r))
          : [...next, rec]
      }
    }
  }
  return next
}
