import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  Check,
  ChevronDown,
  Plus,
  RotateCcw,
  SkipForward,
  Timer,
  TimerOff,
  Trash2,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RingProgress } from '@/components/ui/ring-progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExercisePicker } from './ExercisePicker'
import { EXERCISES } from '@/data/exercises'
import { GUIDES } from '@/data/guides'
import { useExercises } from '@/hooks/useExercises'
import { useAppStore } from '@/store/appStore'
import { beep } from '@/hooks/useIntervalTimer'
import { todayISO } from '@/data/demoData'
import { fmt, fmtClock } from '@/lib/utils'
import { t, fdate, loc, locExercise } from '@/lib/i18n'
import type { PlanDay, WorkoutExercise, WorkoutSet, WorkoutType } from '@/types'

const WORKOUT_TYPES: WorkoutType[] = [
  'Strength', 'Hypertrophy', 'Push', 'Pull', 'Legs', 'Upper', 'Lower',
  'Full Body', 'Cardio', 'HIIT', 'Core',
]

/** Локализация английского типа */
function locType(type: string): string {
  const key = `type_${type.replace(/\s+/g, '').toLowerCase()}`
  const s = t(key)
  return s === key ? type : s
}

let uid = 0
const nid = (p: string) => `${p}-${Date.now()}-${++uid}`

interface DraftExercise extends WorkoutExercise {}

interface RestState {
  endsAt: number
  totalSec: number
}

export function ActiveWorkoutPage() {
  const navigate = useNavigate()
  const planDay = (useLocation().state as { planDay?: PlanDay } | null)?.planDay
  const addWorkout = useAppStore((s) => s.addWorkout)
  const allExercises = useExercises()

  /* ── setup phase vs live phase ── */
  const [phase, setPhase] = useState<'setup' | 'live'>('setup')

  // setup fields
  const [name, setName] = useState(planDay?.name ?? '')
  const [type, setType] = useState<WorkoutType>(planDay?.type ?? 'Strength')
  const [date, setDate] = useState(todayISO())
  const [errors, setErrors] = useState<{ name?: string }>({})

  // live state
  const [exercises, setExercises] = useState<DraftExercise[]>([])
  const [startedAt, setStartedAt] = useState(0)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [rest, setRest] = useState<RestState | null>(null)
  const [pickerFor, setPickerFor] = useState<'add' | string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const soundRef = useRef(soundOn)
  soundRef.current = soundOn
  // Guard against double-save on rapid Finish taps
  const finishingRef = useRef(false)

  /* elapsed timer */
  useEffect(() => {
    if (phase !== 'live') return
    const t = setInterval(() => setElapsedSec(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(t)
  }, [phase, startedAt])

  /* rest countdown — timestamp-based */
  useEffect(() => {
    if (!rest) return
    const tick = () => {
      const left = rest.endsAt - Date.now()
      if (left <= 0) {
        if (soundRef.current) beep('done')
        setRest(null)
      }
    }
    const t = setInterval(tick, 200)
    return () => clearInterval(t)
  }, [rest])

  const restLeftSec = rest ? Math.max(0, (rest.endsAt - Date.now()) / 1000) : 0

  const totalSets = exercises.reduce((s, e) => s + e.sets.length, 0)
  const doneSets = exercises.reduce((s, e) => s + e.sets.filter((x) => x.done).length, 0)
  const volume = useMemo(
    () =>
      exercises.reduce(
        (s, e) => s + e.sets.reduce((a, x) => a + x.weight * x.reps, 0),
        0
      ),
    [exercises]
  )

  /* ── validation & start ── */
  function handleStart() {
    if (!name.trim()) {
      setErrors({ name: t('error_need_name') })
      return
    }
    setErrors({})
    setPhase('live')
    setStartedAt(Date.now())
    // sensible starter template based on type, or the day chosen in the PRO plan
    setExercises(planDay ? planDayToDraft(planDay) : starterFor(type))
  }

  /* ── exercise ops ── */
  function addExerciseFromLibrary(exId: string) {
    const def = allExercises.find((e) => e.id === exId)
    if (!def) return
    const ex: DraftExercise = {
      id: nid('we'),
      exerciseId: def.id,
      name: locExercise(def.id, def.name),
      muscleGroup: def.muscleGroup,
      sets: [
        { id: nid('ws'), weight: defaultWeightFor(def.muscleGroup), reps: 10, done: false },
        { id: nid('ws'), weight: defaultWeightFor(def.muscleGroup), reps: 10, done: false },
        { id: nid('ws'), weight: defaultWeightFor(def.muscleGroup), reps: 10, done: false },
      ],
    }
    setExercises((prev) => [...prev, ex])
    setExpanded((p) => ({ ...p, [ex.id]: true }))
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((e) => e.id !== id))
  }

  function patchExercise(id: string, fn: (e: DraftExercise) => DraftExercise) {
    setExercises((prev) => prev.map((e) => (e.id === id ? fn(e) : e)))
  }

  function addSet(exId: string) {
    patchExercise(exId, (e) => {
      const last = e.sets[e.sets.length - 1]
      return {
        ...e,
        sets: [
          ...e.sets,
          { id: nid('ws'), weight: last?.weight ?? 20, reps: last?.reps ?? 10, done: false },
        ],
      }
    })
  }

  function removeSet(exId: string, setId: string) {
    patchExercise(exId, (e) => ({ ...e, sets: e.sets.filter((s) => s.id !== setId) }))
  }

  function patchSet(exId: string, setId: string, patch: Partial<WorkoutSet>) {
    patchExercise(exId, (e) => ({
      ...e,
      sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
    }))
  }

  function toggleSetDone(exId: string, set: WorkoutSet) {
    const nextDone = !set.done
    patchSet(exId, set.id, { done: nextDone })
    if (nextDone && soundRef.current) beep('start')
    if (nextDone) startRest(60)
  }

  /* ── rest timer ── */
  function startRest(sec: number) {
    setRest({ endsAt: Date.now() + sec * 1000, totalSec: sec })
  }

  /* ── finish / discard ── */
  function finishWorkout() {
    if (finishingRef.current) return
    finishingRef.current = true
    const durationMin = Math.max(1, Math.round(elapsedSec / 60))
    const id = nid('w')
    addWorkout({
      id,
      name: name.trim(),
      type,
      date,
      durationMin,
      exercises: exercises.map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) })),
      createdAt: startedAt,
    })
    navigate(`/workouts/summary/${id}`, { replace: true })
  }

  function discard() {
    setPhase('setup')
    setExercises([])
    setRest(null)
    setElapsedSec(0)
    setConfirmDiscard(false)
  }

  /* ── SETUP SCREEN ── */
  if (phase === 'setup') {
    return (
      <div className="animate-page-in mx-auto max-w-xl">
        <PageHeader title={t('active_setup_title')} description={t('active_setup_desc')} />
        <Card className="p-5 sm:p-6">
          <div className="space-y-5">
            <div>
              <Label htmlFor="w-name">{t('field_workout_name')}</Label>
              <Input
                id="w-name"
                className="mt-1.5"
                placeholder={t('workout_name_placeholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                autoFocus
              />
              {errors.name && <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('field_type')}</Label>
                <Select value={type} onValueChange={(v) => setType(v as WorkoutType)}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKOUT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {locType(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="w-date">{t('field_date')}</Label>
                <Input
                  id="w-date"
                  type="date"
                  className="mt-1.5"
                  value={date}
                  max={todayISO()}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-xl border border-line bg-surface-2/50 p-3.5 text-xs leading-relaxed text-muted-foreground">
              {planDay ? t('setup_note_plan') : t('setup_note', { type: locType(type) })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                <X /> {t('cancel')}
              </Button>
              <Button variant="energy" className="flex-[2]" onClick={handleStart}>
                {t('btn_start_workout')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  /* ── LIVE SCREEN ── */
  return (
    <div className="animate-page-in">
      {/* Sticky live header */}
      <div className="sticky top-0 z-30 -mx-4 mb-4 border-b border-line bg-background/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold sm:text-base">{name}</p>
            <p className="text-xs text-muted-foreground tabular">
              {fmtClock(elapsedSec)} {t('elapsed')} · {t('sets_progress', { done: doneSets, total: totalSets })} · {fmt(volume)} {t('kg_unit')}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setSoundOn((v) => !v)}
              aria-label={soundOn ? t('mute_sounds') : t('unmute_sounds')}
            >
              {soundOn ? <Timer /> : <TimerOff />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmDiscard(true)}>
              {t('discard')}
            </Button>
            <Button
              size="sm"
              variant="energy"
              disabled={exercises.length === 0 || doneSets === 0}
              onClick={finishWorkout}
            >
              <Check /> {t('finish')}
            </Button>
          </div>
        </div>
      </div>

      {/* Rest banner */}
      <AnimatePresence>
        {rest && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="mb-4 border-ignite/30 bg-ignite/[0.06] p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 items-center gap-3 sm:flex-1 sm:gap-4">
                  <RingProgress
                    value={restLeftSec / rest.totalSec}
                    size={56}
                    stroke={5}
                    color="#FFB36B"
                  >
                    <span className="text-xs font-bold tabular text-ignite sm:text-sm">
                      {fmtClock(restLeftSec)}
                    </span>
                  </RingProgress>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{t('rest')}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t('next_set_in', { s: Math.ceil(restLeftSec) })}
                    </p>
                  </div>
                </div>
                <div className="grid shrink-0 grid-cols-3 gap-1.5 sm:flex sm:items-center">
                  {[30, 15].map((s) => (
                    <Button key={s} size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => startRest(s)}>
                      +{s}{t('sec_unit')}
                    </Button>
                  ))}
                  <Button size="sm" variant="ghost" className="w-full sm:w-auto" onClick={() => setRest(null)}>
                    <SkipForward /> {t('skip')}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercises */}
      <div className="mx-auto max-w-3xl space-y-3">
        {exercises.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">{t('no_exercises_live')}</p>
          </Card>
        )}
        {exercises.map((ex, idx) => {
          const open = expanded[ex.id] ?? false
          const exDone = ex.sets.filter((s) => s.done).length
          return (
            <Card key={ex.id} className="overflow-hidden">
              <div className="flex items-center gap-1 p-4">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => setExpanded((p) => ({ ...p, [ex.id]: !open }))}
                  aria-expanded={open}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-energy/12 text-sm font-bold text-energy">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('muscle_group_of', {
                        group: loc('mg', ex.muscleGroup),
                        done: exDone,
                        total: ex.sets.length,
                      })}
                    </p>
                  </div>
                </button>
                {GUIDES[ex.exerciseId] && (
                  <Link
                    to={`/guides/${ex.exerciseId}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${t('guide_open')}: ${ex.name}`}
                    title={t('guide_open')}
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-energy"
                  >
                    <BookOpen className="size-4" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setExpanded((p) => ({ ...p, [ex.id]: !open }))}
                  aria-label={open ? t('guide_collapse') : t('guide_expand')}
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary"
                >
                  <ChevronDown
                    className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-line px-4 pb-4 pt-3">
                      <div className="grid grid-cols-[28px_1fr_1fr_auto_auto] items-center gap-2 px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <span>✓</span>
                        <span>{t('col_weight_kg')}</span>
                        <span>{t('col_reps')}</span>
                        <span>{t('col_rest')}</span>
                        <span />
                      </div>
                      {ex.sets.map((s, i) => (
                        <div
                          key={s.id}
                          className={`grid grid-cols-[28px_1fr_1fr_auto_auto] items-center gap-2 rounded-xl px-1 py-1 ${s.done ? 'bg-energy/[0.05]' : ''}`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSetDone(ex.id, s)}
                            aria-label={s.done ? `${t('col_reps')} ${i + 1}` : `${t('col_reps')} ${i + 1}`}
                            className={`flex size-7 items-center justify-center rounded-lg border transition-all ${
                              s.done
                                ? 'border-primary bg-primary text-primary-foreground glow-energy'
                                : 'border-line hover:border-primary/50'
                            }`}
                          >
                            {s.done && <Check className="size-4" strokeWidth={3} />}
                          </button>
                          <Input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step={2.5}
                            value={s.weight}
                            onChange={(e) =>
                              patchSet(ex.id, s.id, { weight: Math.max(0, Number(e.target.value) || 0) })
                            }
                            className="h-9 text-center tabular"
                            aria-label={`${t('col_weight_kg')} подход ${i + 1}`}
                          />
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={s.reps}
                            onChange={(e) =>
                              patchSet(ex.id, s.id, { reps: Math.max(1, Number(e.target.value) || 1) })
                            }
                            className="h-9 text-center tabular"
                            aria-label={`${t('col_reps')} подход ${i + 1}`}
                          />
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => startRest(90)}
                            aria-label={`Начать отдых после подхода ${i + 1}`}
                          >
                            <Timer />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => removeSet(ex.id, s.id)}
                            aria-label={`Удалить подход ${i + 1}`}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      ))}
                      <div className="mt-3 flex items-center justify-between">
                        <Button size="sm" variant="outline" onClick={() => addSet(ex.id)}>
                          <Plus /> {t('add_set')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeExercise(ex.id)}
                        >
                          <Trash2 /> {t('remove_exercise')}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}

        <Button variant="outline" className="w-full border-dashed py-6" onClick={() => setPickerFor('add')}>
          <Plus /> {t('add_exercise')}
        </Button>

        <p className="pt-1 text-center text-[11px] text-muted-foreground/70">
          {t('started_at', { time: fdate(startedAt, 'HH:mm') })}
        </p>
      </div>

      {/* Exercise picker */}
      <ExercisePicker
        open={pickerFor === 'add'}
        onClose={() => setPickerFor(null)}
        onSelect={(id) => {
          addExerciseFromLibrary(id)
          setPickerFor(null)
        }}
      />

      {/* Discard confirm */}
      <Dialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('dialog_discard_title')}</DialogTitle>
            <DialogDescription>
              {doneSets === 0
                ? t('dialog_discard_none')
                : t('dialog_discard_many', { n: doneSets })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDiscard(false)}>
              {t('keep_training')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                discard()
                navigate('/workouts')
              }}
            >
              <RotateCcw /> {t('discard')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* helpers */

function planDayToDraft(day: PlanDay): DraftExercise[] {
  return day.exercises.flatMap<DraftExercise>((pe) => {
    const def = EXERCISES.find((e) => e.id === pe.exerciseId)
    if (!def) return []
    return [
      {
        id: nid('we'),
        exerciseId: def.id,
        name: locExercise(def.id, def.name),
        muscleGroup: def.muscleGroup,
        sets: Array.from({ length: pe.sets }, () => ({
          id: nid('ws'),
          weight: defaultWeightFor(def.muscleGroup),
          reps: pe.reps,
          done: false,
        })),
      },
    ]
  })
}

function defaultWeightFor(group: string): number {
  switch (group) {
    case 'Chest': return 60
    case 'Back': return 50
    case 'Legs': return 80
    case 'Shoulders': return 30
    case 'Arms': return 12
    default: return 0
  }
}

function starterFor(type: WorkoutType): DraftExercise[] {
  const plans: Partial<Record<WorkoutType, string[]>> = {
    Push: ['bench-press', 'db-shoulder-press', 'triceps-pushdown'],
    Pull: ['deadlift', 'lat-pulldown', 'barbell-curl'],
    Legs: ['squat', 'leg-press', 'leg-curl'],
    Upper: ['bench-press', 'barbell-row', 'shoulder-press'],
    Lower: ['squat', 'romanian-deadlift', 'calf-raise'],
    'Full Body': ['squat', 'bench-press', 'barbell-row'],
    Core: ['plank', 'hanging-leg-raise', 'cable-crunch'],
    Strength: ['bench-press', 'squat', 'shoulder-press'],
    Hypertrophy: ['incline-db-press', 'lat-pulldown', 'lateral-raise'],
  }
  const ids = plans[type] ?? []
  return ids.map((id) => {
    const def = EXERCISES.find((e) => e.id === id)!
    return {
      id: nid('we'),
      exerciseId: def.id,
      name: locExercise(def.id, def.name),
      muscleGroup: def.muscleGroup,
      sets: Array.from({ length: 3 }, () => ({
        id: nid('ws'),
        weight: defaultWeightFor(def.muscleGroup),
        reps: 10,
        done: false,
      })),
    }
  })
}
