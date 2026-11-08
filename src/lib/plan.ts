import { t } from '@/lib/i18n'
import { EXERCISES } from '@/data/exercises'
import type { FitnessGoalType, PlanDay, PlanExercise, WorkoutPlan, WorkoutType } from '@/types'

const ex = (
  exerciseId: string,
  sets: number,
  reps: number,
  restSec: number,
  mode?: 'reps' | 'seconds'
): PlanExercise => ({ exerciseId, sets, reps, restSec, ...(mode ? { mode } : {}) })

const day = (
  id: string,
  nameKey: string,
  type: WorkoutType,
  exercises: PlanExercise[]
): PlanDay => ({ id, name: t(nameKey), type, exercises })

const LOSE: PlanDay[] = [
  day('lose-full-a', 'plan_day_full_a', 'Full Body', [
    ex('squat', 3, 12, 60),
    ex('bench-press', 3, 12, 60),
    ex('barbell-row', 3, 12, 60),
    ex('plank', 3, 40, 45, 'seconds'),
  ]),
  day('lose-cardio', 'plan_day_cardio', 'Cardio', [
    ex('rowing', 1, 1200, 0, 'seconds'),
    ex('jump-rope', 3, 60, 45, 'seconds'),
    ex('burpee', 3, 10, 45),
    ex('hanging-leg-raise', 3, 12, 45),
  ]),
  day('lose-full-b', 'plan_day_full_b', 'Full Body', [
    ex('romanian-deadlift', 3, 12, 60),
    ex('db-shoulder-press', 3, 12, 60),
    ex('lat-pulldown', 3, 12, 60),
    ex('walking-lunge', 3, 12, 60),
    ex('cable-crunch', 3, 15, 45),
  ]),
  day('lose-conditioning', 'plan_day_conditioning', 'HIIT', [
    ex('cycling', 1, 1200, 0, 'seconds'),
    ex('burpee', 3, 12, 40),
    ex('jump-rope', 3, 60, 40, 'seconds'),
    ex('russian-twist', 3, 20, 40),
  ]),
]

const GAIN: PlanDay[] = [
  day('gain-upper-a', 'plan_day_upper_a', 'Upper', [
    ex('bench-press', 4, 8, 90),
    ex('barbell-row', 4, 8, 90),
    ex('db-shoulder-press', 3, 10, 90),
    ex('lat-pulldown', 3, 10, 90),
    ex('barbell-curl', 3, 12, 60),
    ex('triceps-pushdown', 3, 12, 60),
  ]),
  day('gain-lower-a', 'plan_day_lower_a', 'Lower', [
    ex('squat', 4, 8, 120),
    ex('romanian-deadlift', 3, 10, 90),
    ex('leg-press', 3, 12, 90),
    ex('leg-curl', 3, 12, 60),
    ex('calf-raise', 3, 15, 60),
  ]),
  day('gain-upper-b', 'plan_day_upper_b', 'Upper', [
    ex('incline-db-press', 4, 10, 90),
    ex('pull-up', 4, 8, 90),
    ex('seated-cable-row', 3, 10, 90),
    ex('lateral-raise', 3, 15, 60),
    ex('hammer-curl', 3, 12, 60),
  ]),
  day('gain-lower-b', 'plan_day_lower_b', 'Lower', [
    ex('front-squat', 4, 8, 120),
    ex('bulgarian-split-squat', 3, 10, 90),
    ex('leg-extension', 3, 12, 60),
    ex('leg-curl', 3, 12, 60),
    ex('calf-raise', 3, 15, 60),
  ]),
]

const MAINTAIN: PlanDay[] = [
  day('maintain-full-a', 'plan_day_full_a', 'Full Body', [
    ex('squat', 3, 10, 90),
    ex('bench-press', 3, 10, 90),
    ex('barbell-row', 3, 10, 90),
    ex('plank', 3, 45, 45, 'seconds'),
  ]),
  day('maintain-full-b', 'plan_day_full_b', 'Full Body', [
    ex('romanian-deadlift', 3, 10, 90),
    ex('db-shoulder-press', 3, 10, 90),
    ex('lat-pulldown', 3, 10, 90),
    ex('cable-crunch', 3, 15, 45),
  ]),
  day('maintain-conditioning', 'plan_day_conditioning', 'Cardio', [
    ex('running', 1, 1500, 0, 'seconds'),
    ex('burpee', 3, 10, 45),
    ex('jump-rope', 3, 60, 45, 'seconds'),
    ex('plank', 3, 45, 45, 'seconds'),
  ]),
]

const PLANS: Record<FitnessGoalType, PlanDay[]> = {
  lose: LOSE,
  maintain: MAINTAIN,
  gain: GAIN,
}

export function buildWorkoutPlan(goal: FitnessGoalType): WorkoutPlan {
  const days = PLANS[goal]
  return {
    goal,
    daysPerWeek: days.length,
    days,
    progression: t(`plan_progression_${goal}`),
  }
}

/** Грубая оценка длительности дня: работа + отдых между подходами */
export function planDayMinutes(day: PlanDay): number {
  const seconds = day.exercises.reduce((sum, e) => sum + e.sets * (45 + e.restSec), 0)
  return Math.max(20, Math.round(seconds / 60))
}

// Self-check (dev only): every prescribed exercise must exist in the catalog.
if (import.meta.env.DEV) {
  const ids = new Set(EXERCISES.map((e) => e.id))
  console.assert(
    Object.values(PLANS)
      .flat()
      .every((d) => d.exercises.every((e) => ids.has(e.exerciseId))),
    'Plan references an exercise missing from the catalog'
  )
}
