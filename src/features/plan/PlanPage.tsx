import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Check,
  Crown,
  Play,
  Ruler,
  Scale,
  Sparkles,
  Target,
  Timer,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Segmented } from '@/components/ui/segmented'
import { toast } from '@/components/ui/toast'
import { useAppStore } from '@/store/appStore'
import {
  BMI_MAX,
  BMI_MIN,
  BMI_META,
  bmi,
  bmiCategory,
  goalWeeklyRate,
  goalWeeks,
  healthyWeightRange,
  isBodyValid,
} from '@/lib/body'
import { buildWorkoutPlan, planDayMinutes } from '@/lib/plan'
import { t, locExercise } from '@/lib/i18n'
import type { FitnessGoalType, PlanDay } from '@/types'

const parseNum = (v: string) => {
  const n = Number.parseFloat(v.replace(',', '.'))
  return Number.isFinite(n) ? n : Number.NaN
}

export function PlanPage() {
  const pro = useAppStore((s) => s.pro)
  return pro ? <ProContent /> : <ProPaywall />
}

function ProPaywall() {
  const setPro = useAppStore((s) => s.setPro)

  return (
    <div className="animate-page-in mx-auto max-w-3xl">
      <PageHeader title={t('plan_title')} description={t('plan_desc')} />
      <Card className="relative overflow-hidden border-energy/25">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--energy-dim),transparent_60%)]" />
        <div className="relative p-6 sm:p-8">
          <Badge className="self-start bg-energy/15 text-energy">
            <Crown className="size-3" /> {t('plan_pro')}
          </Badge>
          <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
            {t('plan_pro_tagline')}
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {t('plan_pro_lead')}
          </p>
          <ul className="mt-5 space-y-2.5">
            {['plan_pro_f1', 'plan_pro_f2', 'plan_pro_f3'].map((key) => (
              <li key={key} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-energy" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
          <Button
            variant="energy"
            size="lg"
            className="mt-6 w-full sm:w-auto"
            onClick={() => setPro(true)}
          >
            <Sparkles /> {t('plan_pro_unlock')}
          </Button>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/80">
            {t('plan_pro_demo_note')}
          </p>
        </div>
      </Card>
    </div>
  )
}

function ProContent() {
  const navigate = useNavigate()
  const body = useAppStore((s) => s.body)
  const goal = useAppStore((s) => s.goal)
  const setBody = useAppStore((s) => s.setBody)
  const setGoal = useAppStore((s) => s.setGoal)

  const [height, setHeight] = useState(body ? String(body.heightCm) : '')
  const [weight, setWeight] = useState(body ? String(body.weightKg) : '')
  const [bodyTouched, setBodyTouched] = useState(false)
  const [goalType, setGoalType] = useState<FitnessGoalType>(goal?.type ?? 'lose')
  const [target, setTarget] = useState(goal?.targetWeightKg ? String(goal.targetWeightKg) : '')

  const h = parseNum(height)
  const w = parseNum(weight)
  const validBody = isBodyValid({ heightCm: h, weightKg: w })
  const heightInvalid = bodyTouched && height.trim() !== '' && !(h >= 120 && h <= 230)
  const weightInvalid = bodyTouched && weight.trim() !== '' && !(w >= 30 && w <= 300)

  const bmiVal = validBody ? bmi(w, h) : null
  const category = bmiVal === null ? null : bmiCategory(bmiVal)
  const meta = category === null ? null : BMI_META[category]
  const range = validBody ? healthyWeightRange(h) : null

  const needsTarget = goalType !== 'maintain'
  const targetNum = parseNum(target)
  const targetInRange = Number.isFinite(targetNum) && targetNum >= 30 && targetNum <= 300

  let targetError: string | null = null
  if (needsTarget) {
    if (!target.trim()) targetError = t('plan_target_required')
    else if (!targetInRange) targetError = t('plan_target_range')
    else if (validBody && goalType === 'lose' && targetNum >= w)
      targetError = t('plan_target_error_lose')
    else if (validBody && goalType === 'gain' && targetNum <= w)
      targetError = t('plan_target_error_gain')
  }

  const etaWeeks =
    validBody && needsTarget && !targetError && targetInRange
      ? goalWeeks(w, { type: goalType, targetWeightKg: targetNum })
      : null

  const obesityWarning = bmiVal !== null && bmiVal >= 30 && goalType === 'gain'

  const plan = goal ? buildWorkoutPlan(goal.type) : null
  const planWeeks = goal && body ? goalWeeks(body.weightKg, goal) : null
  const planGoalLabel = goal ? t(`plan_goal_${goal.type}`) : ''

  function saveBody() {
    setBodyTouched(true)
    if (validBody) setBody({ heightCm: h, weightKg: w })
  }

  function handleBuild() {
    setBodyTouched(true)
    if (!validBody || targetError) return
    setBody({ heightCm: h, weightKg: w })
    setGoal({
      type: goalType,
      targetWeightKg: needsTarget ? targetNum : undefined,
    })
    toast.success(t('toast_plan_saved'), t('toast_plan_saved_desc'))
  }

  const markerPct =
    bmiVal === null
      ? 0
      : Math.min(100, Math.max(0, ((bmiVal - BMI_MIN) / (BMI_MAX - BMI_MIN)) * 100))

  return (
    <div className="animate-page-in">
      <PageHeader
        title={t('plan_title')}
        description={t('plan_desc')}
        actions={
          <Badge className="self-start bg-energy/15 text-energy">
            <Crown className="size-3" /> {t('plan_pro')}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Body metrics */}
        <Card className="p-5 lg:col-span-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="size-4 text-energy" /> {t('plan_body_title')}
          </CardTitle>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="plan-height">{t('plan_height')}</Label>
              <Input
                id="plan-height"
                className="mt-1.5"
                type="number"
                inputMode="decimal"
                min={120}
                max={230}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                onBlur={saveBody}
                aria-invalid={heightInvalid}
              />
              {heightInvalid && (
                <p className="mt-1 text-xs text-destructive">{t('plan_height_error')}</p>
              )}
            </div>
            <div>
              <Label htmlFor="plan-weight">{t('plan_weight')}</Label>
              <Input
                id="plan-weight"
                className="mt-1.5"
                type="number"
                inputMode="decimal"
                min={30}
                max={300}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onBlur={saveBody}
                aria-invalid={weightInvalid}
              />
              {weightInvalid && (
                <p className="mt-1 text-xs text-destructive">{t('plan_weight_error')}</p>
              )}
            </div>
          </div>
          {range && (
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {t('plan_bmi_healthy_range', { min: range.min, max: range.max })}
            </p>
          )}
        </Card>

        {/* BMI result */}
        <Card className="p-5 lg:col-span-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="size-4 text-energy" /> {t('plan_bmi_title')}
          </CardTitle>

          {bmiVal !== null && meta ? (
            <>
              <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-2">
                <span className="text-5xl font-bold leading-none tracking-tight tabular">
                  {bmiVal.toFixed(1)}
                </span>
                <Badge
                  variant={
                    meta.tone === 'good'
                      ? 'default'
                      : meta.tone === 'warn'
                        ? 'ignite'
                        : 'destructive'
                  }
                >
                  {t(meta.labelKey)}
                </Badge>
              </div>

              <div className="relative mt-5 h-2.5 overflow-hidden rounded-full" aria-hidden="true">
                <div className="flex h-full w-full">
                  <span className="h-full bg-ignite" style={{ width: '14%' }} />
                  <span className="h-full bg-energy" style={{ width: '26%' }} />
                  <span className="h-full bg-ignite" style={{ width: '20%' }} />
                  <span className="h-full bg-destructive" style={{ width: '40%' }} />
                </div>
                <span
                  className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow"
                  style={{ left: `${markerPct}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground tabular">
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>

              <p className="mt-4 text-sm leading-relaxed">{t(meta.recKey)}</p>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                {t('plan_bmi_note')}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{t('plan_bmi_placeholder')}</p>
          )}
        </Card>
      </div>

      {/* Goal */}
      <Card className="mt-4 p-5 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="size-4 text-energy" /> {t('plan_goal_title')}
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{t('plan_goal_desc')}</p>

        <div className="mt-4">
          <Segmented
            fullWidth
            value={goalType}
            onChange={setGoalType}
            options={[
              { value: 'lose', label: t('plan_goal_short_lose') },
              { value: 'maintain', label: t('plan_goal_short_maintain') },
              { value: 'gain', label: t('plan_goal_short_gain') },
            ]}
          />
        </div>

        {needsTarget && (
          <div className="mt-4 max-w-xs">
            <Label htmlFor="plan-target">{t('plan_target_weight')}</Label>
            <Input
              id="plan-target"
              className="mt-1.5"
              type="number"
              inputMode="decimal"
              min={30}
              max={300}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              aria-invalid={!!targetError}
            />
            {range && (
              <p className="mt-1 text-xs text-muted-foreground">
                {t('plan_bmi_healthy_range', { min: range.min, max: range.max })}
              </p>
            )}
            {target.trim() === '' ? (
              <p className="mt-1 text-xs text-muted-foreground">{t('plan_target_required')}</p>
            ) : targetError ? (
              <p className="mt-1 text-xs text-destructive">{targetError}</p>
            ) : null}
          </div>
        )}

        {etaWeeks !== null && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-surface-2/60 p-3 text-sm">
            <Timer className="mt-0.5 size-4 shrink-0 text-ignite" />
            <span>
              {t('plan_eta', {
                weeks: etaWeeks,
                rate: String(goalWeeklyRate(goalType)).replace('.', ','),
              })}
            </span>
          </div>
        )}

        {obesityWarning && bmiVal !== null && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-ignite/30 bg-ignite/[0.07] p-3 text-sm text-ignite">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{t('plan_obesity_gain_warning', { bmi: bmiVal.toFixed(1) })}</span>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="energy"
            className="w-full sm:w-auto"
            onClick={handleBuild}
            disabled={!validBody || !!targetError}
          >
            <Sparkles /> {t('plan_build')}
          </Button>
          {!validBody && (
            <p className="text-xs text-muted-foreground">{t('plan_goal_need_body')}</p>
          )}
        </div>
      </Card>

      {/* Generated plan */}
      {plan && (
        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {t('plan_plan_title')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('plan_days_week', { n: plan.daysPerWeek })}
                {planWeeks !== null && ` · ${t('plan_weeks', { n: planWeeks })}`}
              </p>
            </div>
            <Badge variant="secondary">{planGoalLabel}</Badge>
          </div>

          <Card className="border-energy/20 bg-energy/[0.04] p-4 text-sm">
            <span className="font-semibold text-energy">{t('plan_progression')}: </span>
            {plan.progression}
          </Card>

          <div className="mt-3 grid gap-3 xl:grid-cols-2">
            {plan.days.map((day, i) => (
              <PlanDayCard
                key={day.id}
                day={day}
                index={i}
                onStart={() => navigate('/workouts/active', { state: { planDay: day } })}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function PlanDayCard({
  day,
  index,
  onStart,
}: {
  day: PlanDay
  index: number
  onStart: () => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">
            <span className="text-muted-foreground tabular">{index + 1}. </span>
            {day.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('plan_day_meta', { n: day.exercises.length, min: planDayMinutes(day) })}
          </p>
        </div>
        <Button
          size="sm"
          variant="energy"
          onClick={onStart}
          aria-label={`${t('plan_start_day')}: ${day.name}`}
        >
          <Play /> {t('plan_start_day')}
        </Button>
      </div>

      <ul className="mt-3 divide-y divide-line border-t border-line">
        {day.exercises.map((pe, i) => {
          const repsLabel =
            pe.mode === 'seconds'
              ? pe.reps >= 300
                ? `${Math.round(pe.reps / 60)} ${t('min_unit')}`
                : `${pe.reps} ${t('sec_unit')}`
              : String(pe.reps)
          return (
            <li
              key={`${day.id}-${pe.exerciseId}-${i}`}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">
                {locExercise(pe.exerciseId, pe.exerciseId)}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular">
                {t('plan_sets_reps', { sets: pe.sets, reps: repsLabel })}
                {pe.restSec > 0 && ` · ${t('plan_rest', { s: pe.restSec })}`}
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
