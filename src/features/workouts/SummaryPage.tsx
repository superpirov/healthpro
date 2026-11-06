import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock, Dumbbell, Flame, Layers } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fmt, fmtDuration } from '@/lib/utils'
import { workoutDoneSetCount, workoutVolume } from '@/lib/calculations'
import { useWorkoutById } from '@/hooks/useDerived'
import { EmptyState } from '@/components/ui/page-header'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] as const } },
}

export function SummaryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const workout = useWorkoutById(id)

  if (!workout) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="Workout not found"
        description="This session may have been discarded."
        action={
          <Button asChild variant="energy">
            <Link to="/workouts">Back to workouts</Link>
          </Button>
        }
      />
    )
  }

  const volume = workoutVolume(workout)
  const sets = workoutDoneSetCount(workout)

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div variants={container} initial="hidden" animate="show" className="text-center">
        <motion.div variants={item} className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/12 glow-energy">
          <CheckCircle2 className="size-8 text-primary" strokeWidth={2.2} />
        </motion.div>
        <motion.h1 variants={item} className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Workout complete
        </motion.h1>
        <motion.p variants={item} className="mt-2 text-sm text-muted-foreground sm:text-base">
          <span className="font-semibold text-foreground">{workout.name}</span> — solid session.
        </motion.p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        <SummaryStat variants={item} icon={Clock} accent="text-ignite bg-ignite/12" label="Duration" value={fmtDuration(workout.durationMin)} />
        <SummaryStat variants={item} icon={Dumbbell} accent="text-energy bg-energy/12" label="Exercises" value={String(workout.exercises.length)} />
        <SummaryStat variants={item} icon={Layers} accent="text-energy bg-energy/12" label="Sets done" value={String(sets)} />
        <SummaryStat variants={item} icon={Flame} accent="text-nutri bg-nutri/12" label="Volume" value={`${fmt(volume)} kg`} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 flex flex-col gap-2 sm:flex-row"
      >
        <Button variant="outline" className="flex-1" onClick={() => navigate(`/workouts/${workout.id}`)}>
          View details
        </Button>
        <Button asChild variant="energy" className="flex-1">
          <Link to="/progress">
            See progress <ArrowRight />
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}

function SummaryStat({
  icon: Icon,
  accent,
  label,
  value,
  variants,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  accent: string
  label: string
  value: string
  variants: typeof item
}) {
  return (
    <motion.div variants={variants}>
      <Card className="p-4 text-center sm:p-5">
        <span className={`mx-auto flex size-9 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="size-4.5" strokeWidth={2.2} />
        </span>
        <p className="mt-3 text-2xl font-bold tracking-tight tabular">{value}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </Card>
    </motion.div>
  )
}
