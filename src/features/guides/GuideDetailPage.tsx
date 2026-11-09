import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EXERCISES } from '@/data/exercises'
import { GUIDES, guideImage } from '@/data/guides'
import { t, loc, locExercise, locExerciseDesc } from '@/lib/i18n'

export function GuideDetailPage() {
  const { id = '' } = useParams()
  const exercise = EXERCISES.find((e) => e.id === id)
  const guide = GUIDES[id]

  if (!exercise || !guide) {
    return (
      <div className="animate-page-in mx-auto max-w-3xl">
        <EmptyState
          icon={BookOpen}
          title={t('guide_not_found')}
          description={t('guide_not_found_desc')}
          action={
            <Button asChild variant="outline">
              <Link to="/guides">
                <ArrowLeft /> {t('guides_back')}
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  const name = locExercise(exercise.id, exercise.name)
  const captions = guide.captions ?? [t('guide_frame_start'), t('guide_frame_end')]

  return (
    <div className="animate-page-in mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link to="/guides">
          <ArrowLeft /> {t('guides_back')}
        </Link>
      </Button>

      <PageHeader
        title={name}
        description={locExerciseDesc(exercise.id, exercise.description)}
        actions={<Badge variant="secondary">{loc('mg', exercise.muscleGroup)}</Badge>}
      />

      <div className="grid grid-cols-2 gap-3">
        {([0, 1] as const).map((frame) => (
          <figure key={frame} className="min-w-0 overflow-hidden rounded-2xl border border-line">
            <div className="aspect-[4/3] w-full bg-white">
              <img
                src={guideImage(exercise.id, frame)}
                alt={`${name} — ${captions[frame]}`}
                className="size-full object-contain"
              />
            </div>
            <figcaption className="border-t border-line bg-card px-3 py-2 text-[11px] font-medium text-muted-foreground">
              {captions[frame]}
            </figcaption>
          </figure>
        ))}
      </div>

      {guide.credit && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          <a
            href="https://commons.wikimedia.org/wiki/File:Burpee_2_Squat.jpg"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-foreground"
          >
            {t('guide_credit')}
          </a>
        </p>
      )}

      <Card className="mt-4 p-5 sm:p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t('guide_steps')}
        </h2>
        <ol className="mt-4 space-y-3.5">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-energy/12 text-xs font-bold text-energy tabular">
                {i + 1}
              </span>
              <p className="pt-0.5 text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('guide_muscle')}
          </p>
          <p className="mt-1 text-sm font-semibold">{loc('mg', exercise.muscleGroup)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('guide_equipment')}
          </p>
          <p className="mt-1 text-sm font-semibold">{loc('eq', exercise.equipment)}</p>
        </Card>
      </div>
    </div>
  )
}
