import { addDays, format, subDays } from 'date-fns'
import type {
  LoggedFood,
  MealType,
  NutritionDay,
  PersonalRecord,
  UserProfile,
  Workout,
  WorkoutExercise,
  WorkoutSet,
  WorkoutType,
} from '@/types'
import { EXERCISES } from './exercises'
import { FOODS } from './foods'

export const iso = (d: Date) => format(d, 'yyyy-MM-dd')
export const todayISO = () => iso(new Date())
export const daysAgoISO = (n: number) => iso(subDays(new Date(), n))

/** Deterministic PRNG (mulberry32) so demo data never shifts between renders */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let setSeq = 0
function mkSet(weight: number, reps: number, done = true): WorkoutSet {
  return { id: `ds-${++setSeq}`, weight, reps, done }
}

let exSeq = 0
function mkExercise(
  exerciseId: string,
  sets: [weight: number, reps: number][]
): WorkoutExercise {
  const def = EXERCISES.find((e) => e.id === exerciseId)!
  return {
    id: `de-${++exSeq}`,
    exerciseId: def.id,
    name: def.name,
    muscleGroup: def.muscleGroup,
    sets: sets.map(([w, r]) => mkSet(w, r)),
  }
}

/* ─── Workouts: 14 sessions across ~5 weeks, progressive overload ─ */

interface WkTemplate {
  daysAgo: number
  name: string
  type: WorkoutType
  durationMin: number
  exercises: WorkoutExercise[]
}

const wk = (t: WkTemplate, idx: number): Workout => ({
  id: `demo-w-${idx}`,
  name: t.name,
  type: t.type,
  date: daysAgoISO(t.daysAgo),
  durationMin: t.durationMin,
  exercises: t.exercises,
  createdAt: subDays(new Date(), t.daysAgo).getTime() + 10 * 3600_000,
})

export function buildDemoWorkouts(): Workout[] {
  setSeq = 0
  exSeq = 0
  const t: WkTemplate[] = [
    // ── 5 weeks ago
    {
      daysAgo: 33,
      name: 'Push Day',
      type: 'Push',
      durationMin: 52,
      exercises: [
        mkExercise('bench-press', [[55, 12], [60, 10], [60, 9]]),
        mkExercise('db-shoulder-press', [[22, 12], [24, 10], [24, 10]]),
        mkExercise('incline-db-press', [[20, 12], [22, 10]]),
        mkExercise('triceps-pushdown', [[20, 14], [22.5, 12]]),
      ],
    },
    {
      daysAgo: 31,
      name: 'Pull Day',
      type: 'Pull',
      durationMin: 58,
      exercises: [
        mkExercise('deadlift', [[100, 8], [110, 6], [115, 5]]),
        mkExercise('lat-pulldown', [[45, 12], [50, 10], [50, 10]]),
        mkExercise('seated-cable-row', [[45, 12], [50, 10]]),
        mkExercise('barbell-curl', [[25, 12], [27.5, 10]]),
      ],
    },
    {
      daysAgo: 29,
      name: 'Leg Day',
      type: 'Legs',
      durationMin: 61,
      exercises: [
        mkExercise('squat', [[70, 10], [75, 8], [80, 8]]),
        mkExercise('leg-press', [[120, 12], [140, 10]]),
        mkExercise('romanian-deadlift', [[60, 10], [65, 10]]),
        mkExercise('leg-extension', [[35, 14], [40, 12]]),
        mkExercise('calf-raise', [[50, 15], [55, 15]]),
      ],
    },
    // ── 4 weeks ago
    {
      daysAgo: 26,
      name: 'Upper Power',
      type: 'Strength',
      durationMin: 55,
      exercises: [
        mkExercise('bench-press', [[57.5, 11], [62.5, 10], [62.5, 8]]),
        mkExercise('barbell-row', [[50, 10], [55, 8], [55, 8]]),
        mkExercise('shoulder-press', [[30, 10], [30, 8]]),
        mkExercise('pull-up', [[0, 8], [0, 7]]),
      ],
    },
    {
      daysAgo: 24,
      name: 'HIIT Circuit',
      type: 'HIIT',
      durationMin: 32,
      exercises: [
        mkExercise('burpee', [[0, 15], [0, 15], [0, 12]]),
        mkExercise('jump-rope', [[0, 50], [0, 50]]),
        mkExercise('rowing', [[0, 250], [0, 250]]),
      ],
    },
    {
      daysAgo: 22,
      name: 'Leg Day',
      type: 'Legs',
      durationMin: 64,
      exercises: [
        mkExercise('squat', [[75, 10], [80, 8], [85, 7]]),
        mkExercise('bulgarian-split-squat', [[16, 10], [18, 10]]),
        mkExercise('romanian-deadlift', [[65, 10], [70, 9]]),
        mkExercise('leg-curl', [[35, 12], [40, 10]]),
      ],
    },
    // ── 3 weeks ago
    {
      daysAgo: 19,
      name: 'Push Day',
      type: 'Push',
      durationMin: 56,
      exercises: [
        mkExercise('bench-press', [[60, 11], [65, 9], [65, 8]]),
        mkExercise('incline-db-press', [[22, 11], [24, 10]]),
        mkExercise('lateral-raise', [[8, 15], [9, 12], [9, 12]]),
        mkExercise('skull-crusher', [[20, 12], [22.5, 10]]),
      ],
    },
    {
      daysAgo: 17,
      name: 'Pull Day',
      type: 'Pull',
      durationMin: 60,
      exercises: [
        mkExercise('deadlift', [[110, 7], [120, 5], [125, 5]]),
        mkExercise('pull-up', [[0, 9], [0, 8], [0, 6]]),
        mkExercise('db-row', [[24, 10], [26, 10]]),
        mkExercise('face-pull', [[20, 15], [22.5, 12]]),
      ],
    },
    {
      daysAgo: 15,
      name: 'Core & Cardio',
      type: 'Core',
      durationMin: 42,
      exercises: [
        mkExercise('plank', [[0, 60], [0, 60]]),
        mkExercise('hanging-leg-raise', [[0, 12], [0, 10], [0, 10]]),
        mkExercise('cable-crunch', [[30, 14], [35, 12]]),
        mkExercise('cycling', [[0, 600], [0, 600]]),
      ],
    },
    // ── 2 weeks ago
    {
      daysAgo: 12,
      name: 'Upper Power',
      type: 'Strength',
      durationMin: 58,
      exercises: [
        mkExercise('bench-press', [[62.5, 10], [67.5, 8], [70, 7]]),
        mkExercise('barbell-row', [[55, 9], [60, 8], [60, 7]]),
        mkExercise('arnold-press', [[16, 12], [18, 10]]),
        mkExercise('hammer-curl', [[12, 12], [14, 10]]),
      ],
    },
    {
      daysAgo: 10,
      name: 'Leg Day',
      type: 'Legs',
      durationMin: 66,
      exercises: [
        mkExercise('squat', [[80, 9], [85, 8], [90, 6]]),
        mkExercise('leg-press', [[150, 11], [160, 10]]),
        mkExercise('walking-lunge', [[18, 12], [18, 12]]),
        mkExercise('leg-extension', [[42.5, 12], [45, 11]]),
        mkExercise('calf-raise', [[60, 14], [60, 14]]),
      ],
    },
    // ── last week
    {
      daysAgo: 7,
      name: 'Push Day',
      type: 'Push',
      durationMin: 54,
      exercises: [
        mkExercise('bench-press', [[65, 10], [70, 8], [72.5, 7]]),
        mkExercise('db-shoulder-press', [[26, 10], [26, 9]]),
        mkExercise('cable-fly', [[15, 14], [17.5, 12]]),
        mkExercise('triceps-pushdown', [[25, 12], [25, 11]]),
      ],
    },
    {
      daysAgo: 5,
      name: 'Pull Day',
      type: 'Pull',
      durationMin: 62,
      exercises: [
        mkExercise('deadlift', [[115, 6], [130, 5], [140, 4]]),
        mkExercise('lat-pulldown', [[52.5, 11], [55, 10]]),
        mkExercise('seated-cable-row', [[55, 10], [55, 9]]),
        mkExercise('preacher-curl', [[22.5, 11], [25, 10]]),
      ],
    },
    // ── yesterday: the latest session
    {
      daysAgo: 1,
      name: 'Upper Power',
      type: 'Strength',
      durationMin: 62,
      exercises: [
        mkExercise('bench-press', [[60, 12], [70, 10], [75, 8]]),
        mkExercise('squat', [[80, 10], [90, 8], [100, 6]]),
        mkExercise('shoulder-press', [[30, 12], [35, 10], [35, 8]]),
      ],
    },
  ]
  return t.map(wk)
}

/* ─── Nutrition: 10 days of meals, today partially logged ───────── */

const foodById = (id: string) => FOODS.find((f) => f.id === id)!

let lfSeq = 0
function log(foodId: string, grams: number): LoggedFood {
  const f = foodById(foodId)
  return {
    id: `dl-${++lfSeq}`,
    foodId: f.id,
    name: f.name,
    grams,
    calories: f.calories,
    protein: f.protein,
    fat: f.fat,
    carbs: f.carbs,
  }
}

type MealPlan = Partial<Record<MealType, [foodId: string, grams: number][]>>

function dayPlan(daysAgo: number, seed: number): MealPlan {
  const r = rng(seed)
  const jitter = (g: number) => Math.round((g * (0.85 + r() * 0.3)) / 5) * 5

  const breakfasts: [string, number][] = [
    ['oatmeal', 250], ['oatmeal', 300], ['eggs', 110], ['greek-yogurt', 200],
    ['bread-wholegrain', 70], ['banana', 120],
  ]
  const lunches: [string, number][] = [
    ['chicken-breast', 180], ['rice-white', 220], ['beef-lean', 160],
    ['pasta', 220], ['salmon', 170], ['potato', 250], ['quinoa', 200],
  ]
  const dinners: [string, number][] = [
    ['salmon', 180], ['chicken-thigh', 180], ['sweet-potato', 250],
    ['ground-turkey', 170], ['broccoli', 150], ['rice-brown', 220], ['cod', 200],
  ]
  const snacks: [string, number][] = [
    ['banana', 120], ['almonds', 30], ['apple', 150], ['protein-shake', 300],
    ['greek-yogurt', 170], ['dark-chocolate', 25], ['peanut-butter', 30],
  ]

  const take = (plan: [string, number][], n: number): [string, number][] => {
    const out: [string, number][] = []
    const used = new Set<number>()
    while (out.length < n) {
      const i = Math.floor(r() * plan.length)
      if (!used.has(i)) {
        used.add(i)
        out.push([plan[i][0], jitter(plan[i][1])])
      }
    }
    return out
  }

  void daysAgo
  return {
    Breakfast: [...take(breakfasts, 2), ['coffee-black', 200]],
    Lunch: take(lunches, 3),
    Dinner: take(dinners, 3),
    Snacks: take(snacks, 2),
  }
}

function toDay(daysAgo: number, plan: MealPlan): NutritionDay {
  return {
    date: daysAgoISO(daysAgo),
    meals: {
      Breakfast: (plan.Breakfast ?? []).map(([f, g]) => log(f, g)),
      Lunch: (plan.Lunch ?? []).map(([f, g]) => log(f, g)),
      Dinner: (plan.Dinner ?? []).map(([f, g]) => log(f, g)),
      Snacks: (plan.Snacks ?? []).map(([f, g]) => log(f, g)),
    },
  }
}

export function buildDemoNutrition(): NutritionDay[] {
  lfSeq = 0
  const days: NutritionDay[] = []
  // Days 9..1 back — full days
  for (let d = 9; d >= 1; d--) {
    days.push(toDay(d, dayPlan(d, 1000 + d * 37)))
  }
  // Today — morning + lunch logged, dinner/snacks still ahead (matches 1,640 kcal vibe)
  days.push({
    date: todayISO(),
    meals: {
      Breakfast: [log('oatmeal', 300), log('eggs', 100), log('banana', 120), log('coffee-black', 30)],
      Lunch: [log('chicken-breast', 200), log('rice-white', 250), log('broccoli', 120)],
      Dinner: [],
      Snacks: [log('greek-yogurt', 200), log('apple', 150), log('almonds', 30)],
    },
  })
  return days
}

/* ─── Personal records — consistent with the workout history ────── */

export function buildDemoRecords(): PersonalRecord[] {
  return [
    { exerciseName: 'Bench Press', weightKg: 75, reps: 8, date: daysAgoISO(1) },
    { exerciseName: 'Squat', weightKg: 100, reps: 6, date: daysAgoISO(1) },
    { exerciseName: 'Deadlift', weightKg: 140, reps: 4, date: daysAgoISO(5) },
    { exerciseName: 'Shoulder Press', weightKg: 35, reps: 10, date: daysAgoISO(1) },
  ]
}

export const DEMO_USER: UserProfile = {
  name: 'Alex',
  goals: { calories: 2200, protein: 160, fat: 70, carbs: 230 },
}

/** Dates the demo app "knows about" for history navigation */
export function recentDates(count: number): string[] {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => iso(addDays(now, -i)))
}
