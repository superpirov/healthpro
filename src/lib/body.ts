import type { BodyMetrics, FitnessGoal, FitnessGoalType } from '@/types'

export type BmiCategory = 'under' | 'normal' | 'over' | 'obese1' | 'obese2' | 'obese3'

export const BMI_MIN = 15
export const BMI_MAX = 40

/** ВОЗ: вес (кг) / рост (м)² */
export function bmi(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0
  const m = heightCm / 100
  return weightKg / (m * m)
}

export function bmiCategory(value: number): BmiCategory {
  if (value < 18.5) return 'under'
  if (value < 25) return 'normal'
  if (value < 30) return 'over'
  if (value < 35) return 'obese1'
  if (value < 40) return 'obese2'
  return 'obese3'
}

export const BMI_META: Record<
  BmiCategory,
  { labelKey: string; recKey: string; tone: 'good' | 'warn' | 'bad' }
> = {
  under: { labelKey: 'plan_bmi_under', recKey: 'plan_bmi_rec_under', tone: 'warn' },
  normal: { labelKey: 'plan_bmi_normal', recKey: 'plan_bmi_rec_normal', tone: 'good' },
  over: { labelKey: 'plan_bmi_over', recKey: 'plan_bmi_rec_over', tone: 'warn' },
  obese1: { labelKey: 'plan_bmi_obese1', recKey: 'plan_bmi_rec_obese1', tone: 'bad' },
  obese2: { labelKey: 'plan_bmi_obese2', recKey: 'plan_bmi_rec_obese2', tone: 'bad' },
  obese3: { labelKey: 'plan_bmi_obese3', recKey: 'plan_bmi_rec_obese3', tone: 'bad' },
}

/** Здоровый диапазон веса при росте (ИМТ 18,5–24,9) */
export function healthyWeightRange(heightCm: number): { min: number; max: number } {
  const m = heightCm / 100
  const round = (n: number) => Math.round(n * 10) / 10
  return { min: round(18.5 * m * m), max: round(24.9 * m * m) }
}

/** Безопасный темп: снижение 0,5–1 кг/нед, набор 0,25–0,5 кг/нед */
export function goalWeeklyRate(type: FitnessGoalType): number {
  return type === 'lose' ? 0.75 : 0.35
}

/** Оценка срока до целевого веса в неделях */
export function goalWeeks(currentKg: number, goal: FitnessGoal): number | null {
  if (goal.type === 'maintain' || !goal.targetWeightKg) return null
  const diff = Math.abs(currentKg - goal.targetWeightKg)
  return Math.max(1, Math.ceil(diff / goalWeeklyRate(goal.type)))
}

export function isBodyValid(body: BodyMetrics): boolean {
  return (
    body.heightCm >= 120 &&
    body.heightCm <= 230 &&
    body.weightKg >= 30 &&
    body.weightKg <= 300
  )
}

// Self-check (dev only): WHO BMI cut-offs must stay exact.
if (import.meta.env.DEV) {
  console.assert(
    bmiCategory(17) === 'under' &&
      bmiCategory(22) === 'normal' &&
      bmiCategory(27) === 'over' &&
      bmiCategory(31) === 'obese1' &&
      bmiCategory(37) === 'obese2' &&
      bmiCategory(42) === 'obese3',
    'BMI thresholds (WHO)'
  )
}
