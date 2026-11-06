import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
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
import { relativeDay } from './WorkoutsPage'
import { useAppStore } from '@/store/appStore'
import { useWorkoutById } from '@/hooks/useDerived'
import { EXERCISES } from '@/data/exercises'
import { exerciseVolume } from '@/lib/calculations'
import { fmt, fmtCompact, fmtDuration } from '@/lib/utils'
import type { WorkoutExercise } from '@/types'

let uid = 0
const nid = (p: string) => `${p}-edit-${Date.now()}-${++uid}`

export function WorkoutDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const workout = useWorkoutById(id)
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
        title="Workout not found"
        description="It may have been deleted."
        action={
          <Button asChild variant="energy">
            <Link to="/workouts">Back to workouts</Link>
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
    const def = EXERCISES.find((e) => e.id === exId)
    if (!def) return
    setDraft((prev) => [
      ...prev,
      {
        id: nid('e'),
        exerciseId: def.id,
        name: def.name,
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
          <ArrowLeft /> Workouts
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{workout.name}</h1>
            <Badge variant="secondary">{workout.type}</Badge>
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground tabular">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" /> {format(new Date(workout.date + 'T12:00'), 'EEEE, MMM d, yyyy')}
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
                <X /> Cancel
              </Button>
              <Button variant="energy" onClick={saveEdit}>
                <Check /> Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={startEdit}>
                <Pencil /> Edit
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
            Exercises
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xl font-bold tracking-tight tabular sm:text-2xl">{sets}</p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sets
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xl font-bold tracking-tight tabular sm:text-2xl">
            {fmtCompact(volume)} <span className="text-sm font-semibold text-muted-foreground">kg</span>
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Volume
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
                  {ex.muscleGroup} · {fmt(exerciseVolume(ex))} kg volume
                </p>
              </div>
              {editing && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeExercise(idx)}
                  aria-label={`Remove ${ex.name}`}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="grid grid-cols-[44px_1fr_1fr] bg-surface-2/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Set</span>
                <span>Weight, kg</span>
                <span>Reps</span>
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
                        aria-label={`Set ${i + 1} weight`}
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
                          aria-label={`Set ${i + 1} reps`}
                        />
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSet(idx, s.id)}
                          aria-label={`Remove set ${i + 1}`}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="py-1 text-sm tabular">{s.weight} kg</span>
                      <span className="py-1 text-sm tabular">× {s.reps}</span>
                    </>
                  )}
                </div>
              ))}
              {ex.sets.length === 0 && (
                <p className="border-t border-line px-3 py-3 text-center text-xs text-muted-foreground">
                  No sets
                </p>
              )}
            </div>
            {editing && (
              <Button size="sm" variant="outline" className="mt-3" onClick={() => addSet(idx)}>
                <Plus /> Add set
              </Button>
            )}
          </Card>
        ))}
        {exercises.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line py-10 text-center text-sm text-muted-foreground">
            No exercises in this session.
          </p>
        )}
      </div>

      {editing && (
        <Button variant="outline" className="mt-3 w-full border-dashed py-5" onClick={() => setPickerOpen(true)}>
          <Plus /> Add exercise
        </Button>
      )}

      <ExercisePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addFromLibrary} />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this workout?</DialogTitle>
            <DialogDescription>
              “{workout.name}” from {format(new Date(workout.date + 'T12:00'), 'MMM d')} will be removed
              from your history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteWorkout(workout.id)
                navigate('/workouts')
              }}
            >
              <Trash2 /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
