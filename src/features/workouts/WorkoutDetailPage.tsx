import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  Dumbbell,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/page-header'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExercisePicker } from './ExercisePicker'
import { relativeDay, locType } from './WorkoutsPage'
import { useAppStore } from '@/store/appStore'
import { useWorkoutById } from '@/hooks/useDerived'
import { useExercises } from '@/hooks/useExercises'
import { exerciseVolume } from '@/lib/calculations'
import { fmt, fmtCompact, fmtDuration } from '@/lib/utils'
import { t, fdate, loc, locExercise, locWorkoutName } from '@/lib/i18n'
import { toast } from '@/components/ui/toast'
import type { WorkoutExercise } from '@/types'

let uid = 0
const nid = (p: string) => `${p}-edit-${Date.now()}-${++uid}`



export function WorkoutDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const workout = useWorkoutById(id)
  const allExercises = useExercises()
  const updateWorkout = useAppStore((s) => s.updateWorkout)
  const deleteWorkout = useAppStore((s) => s.deleteWorkout)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<WorkoutExercise[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  if (!workout) {
    return (
      <EmptyState
        icon={Dumbbell}
        title={t('workout_not_found')}
        description={t('deleted_note')}
        action={
          <Button asChild variant="energy">
            <Link to="/workouts">{t('back_to_workouts')}</Link>
          </Button>
        }
      />
    )
  }

  const exercises = editing ? draft : workout.exercises
  const volume = exercises.reduce((s, e) => s + exerciseVolume(e), 0)
  const sets = exercises.reduce((s, e) => s + e.sets.length, 0)

  function startEdit() {
    setDraft(JSON.parse(JSON.stringify(workout!.exercises)))
    setEditing(true)
  }

  function saveEdit() {
    updateWorkout({ ...workout!, exercises: draft })
    setEditing(false)
    toast.success(t('toast_workout_saved'))
  }

  function patch(idx: number, ex: WorkoutExercise) {
    setDraft((prev) => prev.map((e, i) => (i === idx ? ex : e)))
  }

  function addSet(idx: number) {
    const ex = draft[idx]
    const last = ex.sets[ex.sets.length - 1]
    patch(idx, {
      ...ex,
      sets: [...ex.sets, { id: nid('s'), weight: last?.weight ?? 20, reps: last?.reps ?? 10, done: true }],
    })
  }

  function removeSet(idx: number, setId: string) {
    const ex = draft[idx]
    patch(idx, { ...ex, sets: ex.sets.filter((s) => s.id !== setId) })
  }

  function removeExercise(idx: number) {
    setDraft((prev) => prev.filter((_, i) => i !== idx))
  }

  function addFromLibrary(exId: string) {
    const def = allExercises.find((e) => e.id === exId)
    if (!def) return
    setDraft((prev) => [
      ...prev,
      {
        id: nid('e'),
        exerciseId: def.id,
        name: locExercise(def.id, def.name),
        muscleGroup: def.muscleGroup,
        sets: Array.from({ length: 3 }, () => ({ id: nid('s'), weight: 20, reps: 10, done: true })),
      },
    ])
    setPickerOpen(false)
  }

  return (
    <div className="animate-page-in mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link to="/workouts">
          <ArrowLeft /> {t('back_nav_workouts')}
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{locWorkoutName(workout.name)}</h1>
            <Badge variant="secondary">{locType(workout.type)}</Badge>
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground tabular">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" /> {fdate(new Date(workout.date + 'T12:00'), 'EEEE, d MMM yyyy')}
              <span className="text-muted-foreground/60">· {relativeDay(workout.date)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" /> {fmtDuration(workout.durationMin)}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                <X /> {t('cancel')}
              </Button>
              <Button variant="energy" onClick={saveEdit}>
                <Check /> {t('save')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={startEdit}>
                <Pencil /> {t('edit')}
              </Button>
              <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-xl font-bold tracking-tight tabular sm:text-2xl">{exercises.length}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('summary_exercises')}
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xl font-bold tracking-tight tabular sm:text-2xl">{sets}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('summary_sets_done')}
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xl font-bold tracking-tight tabular sm:text-2xl">
            {fmtCompact(volume)} <span className="text-sm font-semibold text-muted-foreground">{t('kg_unit')}</span>
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('volume')}
          </p>
        </Card>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {exercises.map((ex, idx) => (
          <Card key={ex.id} className="p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{ex.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t('exercise_volume_note', { group: loc('mg', ex.muscleGroup), vol: fmt(exerciseVolume(ex)) })}
                </p>
              </div>
              {editing && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeExercise(idx)}
                  aria-label={`${t('remove_exercise')}: ${ex.name}`}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="grid grid-cols-[44px_1fr_1fr] bg-surface-2/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>{t('col_set')}</span>
                <span>{t('col_weight_kg')}</span>
                <span>{t('col_reps')}</span>
              </div>
              {ex.sets.map((s, i) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[44px_1fr_1fr] items-center gap-2 border-t border-line px-3 py-1.5"
                >
                  <span className="text-sm font-semibold text-muted-foreground tabular">{i + 1}</span>
                  {editing ? (
                    <>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={2.5}
                        value={s.weight}
                        onChange={(e) =>
                          patch(idx, {
                            ...ex,
                            sets: ex.sets.map((x, xi) =>
                              xi === i ? { ...x, weight: Math.max(0, Number(e.target.value) || 0) } : x
                            ),
                          })
                        }
                        className="h-9 text-center tabular"
                        aria-label={`${t('col_weight_kg')} ${i + 1}`}
                      />
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          value={s.reps}
                          onChange={(e) =>
                            patch(idx, {
                              ...ex,
                              sets: ex.sets.map((x, xi) =>
                                xi === i ? { ...x, reps: Math.max(1, Number(e.target.value) || 1) } : x
                              ),
                            })
                          }
                          className="h-9 text-center tabular"
                          aria-label={`${t('col_reps')} ${i + 1}`}
                        />
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSet(idx, s.id)}
                          aria-label={`${t('delete_btn')} ${i + 1}`}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="py-1 text-sm tabular">{s.weight} {t('kg_unit')}</span>
                      <span className="py-1 text-sm tabular">× {s.reps}</span>
                    </>
                  )}
                </div>
              ))}
              {ex.sets.length === 0 && (
                <p className="border-t border-line px-3 py-3 text-center text-xs text-muted-foreground">
                  {t('no_sets')}
                </p>
              )}
            </div>
            {editing && (
              <Button size="sm" variant="outline" className="mt-3" onClick={() => addSet(idx)}>
                <Plus /> {t('add_set')}
              </Button>
            )}
          </Card>
        ))}
        {exercises.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line py-10 text-center text-sm text-muted-foreground">
            {t('no_exercises_session')}
          </p>
        )}
      </div>

      {editing && (
        <Button variant="outline" className="mt-3 w-full border-dashed py-5" onClick={() => setPickerOpen(true)}>
          <Plus /> {t('add_exercise')}
        </Button>
      )}

      <ExercisePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addFromLibrary} />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('dialog_delete_title')}</DialogTitle>
            <DialogDescription>
              {t('dialog_delete_desc', {
                name: locWorkoutName(workout.name),
                date: fdate(new Date(workout.date + 'T12:00'), 'd MMM'),
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              {t('keep_it')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteWorkout(workout.id)
                toast.success(t('toast_workout_deleted'))
                navigate('/workouts')
              }}
            >
              <Trash2 /> {t('delete_btn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
