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
import { locExercise, locFood, locWorkoutName } from '@/lib/i18n'

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
    name: locExercise(def.id, def.name),
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
  name: locWorkoutName(t.name),
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
      name: 'День толчка',
      type: 'Push',
      durationMin: 55,
      exercises: [
        mkExercise('deadlift', [[100, 8], [110, 6], [115, 5]]),
        mkExercise('pull-up', [[0, 10], [0, 8]]),
        mkExercise('db-row', [[30, 10], [32.5, 9]]),
        mkExercise('face-pull', [[25, 14], [25, 12]]),
      ],
    },
    // ── 4 weeks ago
    {
      daysAgo: 31,
      name: 'День тяги',
      type: 'Pull',
      durationMin: 62,
      exercises: [
        mkExercise('deadlift', [[115, 6], [130, 5], [140, 4]]),
        mkExercise('lat-pulldown', [[52.5, 11], [55, 10]]),
        mkExercise('seated-cable-row', [[55, 10], [55, 9]]),
        mkExercise('preacher-curl', [[22.5, 11], [25, 10]]),
      ],
    },
    // ── 4 weeks ago
    {
      daysAgo: 29,
      name: 'День ног',
      type: 'Legs',
      durationMin: 68,
      exercises: [
        mkExercise('squat', [[80, 10], [90, 8], [95, 6]]),
        mkExercise('leg-press', [[120, 12], [140, 10], [140, 8]]),
        mkExercise('romanian-deadlift', [[60, 10], [70, 8]]),
        mkExercise('calf-raise', [[40, 15], [40, 12]]),
      ],
    },
    // ── 3 weeks ago
    {
      daysAgo: 26,
      name: 'Сила — верх',
      type: 'Strength',
      durationMin: 62,
      exercises: [
        mkExercise('bench-press', [[60, 12], [70, 10], [75, 8]]),
        mkExercise('barbell-row', [[50, 10], [60, 8], [65, 6]]),
        mkExercise('shoulder-press', [[30, 10], [35, 8]]),
        mkExercise('pull-up', [[7.5, 8], [7.5, 6]]),
      ],
    },
    // ── 3 weeks ago
    {
      daysAgo: 24,
      name: 'ВИИТ-круговая',
      type: 'HIIT',
      durationMin: 25,
      exercises: [
        mkExercise('jump-rope', [[0, 50], [0, 45]]),
        mkExercise('burpee', [[0, 10], [0, 8]]),
        mkExercise('push-up', [[0, 15], [0, 12]]),
        mkExercise('running', [[0, 60], [0, 55]]),
      ],
    },
    // ── 3 weeks ago
    {
      daysAgo: 22,
      name: 'День ног',
      type: 'Legs',
      durationMin: 65,
      exercises: [
        mkExercise('front-squat', [[60, 10], [70, 8], [75, 6]]),
        mkExercise('leg-extension', [[50, 12], [55, 10]]),
        mkExercise('leg-curl', [[45, 10], [50, 8]]),
        mkExercise('walking-lunge', [[20, 20], [20, 16]]),
      ],
    },
    // ── 2 weeks ago
    {
      daysAgo: 19,
      name: 'День толчка',
      type: 'Push',
      durationMin: 58,
      exercises: [
        mkExercise('bench-press', [[65, 10], [72.5, 8], [77.5, 6]]),
        mkExercise('incline-db-press', [[30, 10], [32.5, 8]]),
        mkExercise('cable-fly', [[20, 12], [20, 10]]),
        mkExercise('triceps-pushdown', [[25, 12], [27.5, 10]]),
      ],
    },
    // ── 2 weeks ago
    {
      daysAgo: 17,
      name: 'День тяги',
      type: 'Pull',
      durationMin: 55,
      exercises: [
        mkExercise('deadlift', [[120, 8], [135, 5], [140, 3]]),
        mkExercise('lat-pulldown', [[55, 10], [57.5, 9]]),
        mkExercise('seated-cable-row', [[57.5, 10], [57.5, 8]]),
        mkExercise('barbell-curl', [[25, 10], [27.5, 8]]),
      ],
    },
    // ── 2 weeks ago
    {
      daysAgo: 15,
      name: 'Кор и кардио',
      type: 'Core',
      durationMin: 35,
      exercises: [
        mkExercise('plank', [[0, 45], [0, 60]]),
        mkExercise('hanging-leg-raise', [[0, 12], [0, 10]]),
        mkExercise('cable-crunch', [[30, 15], [30, 12]]),
        mkExercise('running', [[0, 600], [0, 500]]),
      ],
    },
    // ── 1 week ago
    {
      daysAgo: 12,
      name: 'Сила — верх',
      type: 'Strength',
      durationMin: 65,
      exercises: [
        mkExercise('bench-press', [[65, 10], [75, 8], [80, 5]]),
        mkExercise('barbell-row', [[55, 10], [65, 8], [70, 5]]),
        mkExercise('shoulder-press', [[32.5, 10], [37.5, 8]]),
        mkExercise('pull-up', [[7.5, 7], [7.5, 6]]),
      ],
    },
    // ── 10 days ago
    {
      daysAgo: 10,
      name: 'День ног',
      type: 'Legs',
      durationMin: 70,
      exercises: [
        mkExercise('squat', [[85, 10], [95, 8], [100, 6]]),
        mkExercise('leg-press', [[130, 12], [150, 10], [150, 8]]),
        mkExercise('romanian-deadlift', [[65, 10], [75, 8]]),
        mkExercise('calf-raise', [[45, 15], [45, 12]]),
      ],
    },
    // ── 1 week ago
    {
      daysAgo: 7,
      name: 'День толчка',
      type: 'Push',
      durationMin: 60,
      exercises: [
        mkExercise('bench-press', [[67.5, 10], [75, 8], [80, 6]]),
        mkExercise('incline-db-press', [[32.5, 10], [35, 8]]),
        mkExercise('dip', [[0, 12], [0, 10]]),
        mkExercise('lateral-raise', [[12.5, 12], [12.5, 10]]),
      ],
    },
    // ── 5 days ago
    {
      daysAgo: 5,
      name: 'День тяги',
      type: 'Pull',
      durationMin: 58,
      exercises: [
        mkExercise('deadlift', [[125, 8], [140, 5], [145, 3]]),
        mkExercise('lat-pulldown', [[57.5, 10], [60, 8]]),
        mkExercise('seated-cable-row', [[60, 10], [60, 8]]),
        mkExercise('db-shoulder-press', [[17.5, 10], [20, 8]]),
      ],
    },
    // ── 1 day ago: the latest session
    {
      daysAgo: 1,
      name: 'Сила — верх',
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
    name: locFood(f.id, f.name),
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
    { exerciseName: 'Жим штанги лёжа', weightKg: 75, reps: 8, date: daysAgoISO(1) },
    { exerciseName: 'Приседания со штангой', weightKg: 100, reps: 6, date: daysAgoISO(1) },
    { exerciseName: 'Становая тяга', weightKg: 140, reps: 4, date: daysAgoISO(5) },
    { exerciseName: 'Жим штанги стоя', weightKg: 35, reps: 10, date: daysAgoISO(1) },
  ]
}

export const DEMO_USER: UserProfile = {
  name: 'Алекс',
  goals: { calories: 2200, protein: 160, fat: 70, carbs: 230 },
}

/** Dates the demo app "knows about" for history navigation */
export function recentDates(count: number): string[] {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => iso(addDays(now, -i)))
}
