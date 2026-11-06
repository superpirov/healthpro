/* ─── Workouts (GymLog) ─────────────────────────────────────────── */

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Cardio'

export type Equipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Machine'
  | 'Cable'
  | 'Bodyweight'
  | 'Kettlebell'
  | 'Cardio Machine'

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: Equipment
  description: string
  custom?: boolean
}

export interface WorkoutSet {
  id: string
  weight: number // kg
  reps: number
  done: boolean
}

export interface WorkoutExercise {
  id: string
  exerciseId: string
  /** Snapshot of name/muscle so history survives catalog edits */
  name: string
  muscleGroup: MuscleGroup
  sets: WorkoutSet[]
}

export type WorkoutType =
  | 'Strength'
  | 'Hypertrophy'
  | 'Push'
  | 'Pull'
  | 'Legs'
  | 'Upper'
  | 'Lower'
  | 'Full Body'
  | 'Cardio'
  | 'HIIT'
  | 'Core'

export interface Workout {
  id: string
  name: string
  type: WorkoutType
  /** ISO date, yyyy-MM-dd */
  date: string
  durationMin: number
  exercises: WorkoutExercise[]
  /** epoch ms — for ordering */
  createdAt: number
}

/* ─── Nutrition (MacroLog) ──────────────────────────────────────── */

export interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  /** per 100 g */
  calories: number
  protein: number
  fat: number
  carbs: number
  custom?: boolean
}

export type FoodCategory =
  | 'Protein'
  | 'Grains'
  | 'Dairy'
  | 'Fruits'
  | 'Vegetables'
  | 'Nuts & Seeds'
  | 'Fats & Oils'
  | 'Bakery'
  | 'Beverages'
  | 'Snacks'

export interface LoggedFood {
  id: string
  foodId: string
  name: string
  grams: number
  /** snapshot per 100 g for stable history */
  calories: number
  protein: number
  fat: number
  carbs: number
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

export interface Meal {
  type: MealType
  items: LoggedFood[]
}

/** Keyed by yyyy-MM-dd */
export interface NutritionDay {
  date: string
  meals: Record<MealType, LoggedFood[]>
}

export interface NutritionGoals {
  calories: number
  protein: number
  fat: number
  carbs: number
}

/* ─── Timer (IntervalPro) ───────────────────────────────────────── */

export type TimerPhase = 'idle' | 'prepare' | 'work' | 'rest' | 'rest-between' | 'done'

export interface IntervalConfig {
  prepSec: number
  workSec: number
  restSec: number
  rounds: number
  restBetweenRoundsSec: number
}

export interface TimerPreset {
  id: string
  name: string
  description: string
  config: IntervalConfig
}

/* ─── App-wide ──────────────────────────────────────────────────── */

export interface UserProfile {
  name: string
  goals: NutritionGoals
}

export interface PersonalRecord {
  exerciseName: string
  weightKg: number
  reps: number
  date: string
}
