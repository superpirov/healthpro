import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw, Settings2, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RingProgress } from '@/components/ui/ring-progress'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useIntervalTimer } from '@/hooks/useIntervalTimer'
import { cn, fmtClock } from '@/lib/utils'
import type { IntervalConfig, TimerPreset, TimerPhase } from '@/types'

const PRESETS: TimerPreset[] = [
  { id: 'hiit-beginner', name: 'HIIT Beginner', description: '20s work / 40s rest, 8 rounds', config: { prepSec: 10, workSec: 20, restSec: 40, rounds: 8, restBetweenRoundsSec: 30 } },
  { id: 'hiit-advanced', name: 'HIIT Advanced', description: '40s work / 20s rest, 10 rounds', config: { prepSec: 10, workSec: 40, restSec: 20, rounds: 10, restBetweenRoundsSec: 30 } },
  { id: 'tabata', name: 'Tabata', description: '20s work / 10s rest, 8 rounds', config: { prepSec: 10, workSec: 20, restSec: 10, rounds: 8, restBetweenRoundsSec: 60 } },
  { id: 'boxing', name: 'Boxing', description: '3 min work / 1 min rest, 6 rounds', config: { prepSec: 15, workSec: 180, restSec: 60, rounds: 6, restBetweenRoundsSec: 60 } },
  { id: 'stretching', name: 'Stretching', description: '45s hold / 15s switch, 10 rounds', config: { prepSec: 5, workSec: 45, restSec: 15, rounds: 10, restBetweenRoundsSec: 15 } },
]

const DEFAULT_CONFIG: IntervalConfig = {
  prepSec: 10,
  workSec: 30,
  restSec: 30,
  rounds: 8,
  restBetweenRoundsSec: 30,
}

const PHASE_META: Record<
  Exclude<TimerPhase, 'idle' | 'done'>,
  { label: string; color: string; badge: string; hint: string }
> = {
  prepare: { label: 'Get ready', color: 'var(--nutri)', badge: 'Preparation', hint: 'Find your position' },
  work: { label: 'Work', color: 'var(--energy)', badge: 'Work', hint: 'Give it everything' },
  rest: { label: 'Rest', color: 'var(--ignite)', badge: 'Rest', hint: 'Breathe and recover' },
  'rest-between': { label: 'Rest', color: 'var(--ignite)', badge: 'Between rounds', hint: 'Longer break' },
}

function totalWorkSec(c: IntervalConfig): number {
  return c.workSec * c.rounds
}

export function TimerPage() {
  const [config, setConfig] = useState<IntervalConfig>(DEFAULT_CONFIG)
  const [presetId, setPresetId] = useState<string>('hiit-beginner')
  const [soundOn, setSoundOn] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const timer = useIntervalTimer(config, soundOn)
  const { phase, round, totalRounds, remainingSec, phaseTotalSec, isRunning } = timer

  // Sync the document title with the countdown
  useEffect(() => {
    const base = 'PULSE — Fitness & Nutrition'
    if (phase === 'prepare' || phase === 'work' || phase === 'rest' || phase === 'rest-between') {
      document.title = `${fmtClock(remainingSec)} · ${PHASE_META[phase].label} — PULSE`
    } else {
      document.title = base
    }
    return () => {
      document.title = base
    }
  }, [phase, remainingSec])

  const meta = phase === 'idle' || phase === 'done' ? null : PHASE_META[phase]
  const ringColor = meta?.color ?? 'var(--energy)'
  const ringValue =
    phase === 'idle' ? 1 : phase === 'done' ? 1 : phaseTotalSec > 0 ? remainingSec / phaseTotalSec : 0

  const totalRemaining =
    phase === 'idle' || phase === 'done'
      ? 0
      : remainingSec + (totalRounds - round) * (config.workSec + config.restSec)

  const applyPreset = (p: TimerPreset) => {
    setPresetId(p.id)
    setConfig(p.config)
    timer.reset()
  }

  const isCustom =
    presetId === 'custom' ||
    PRESETS.every((p) => JSON.stringify(p.config) !== JSON.stringify(config))

  return (
    <div className="animate-page-in">
      <PageHeader
        title="Interval timer"
        description="HIIT, Tabata, boxing rounds — timed to the second."
        actions={
          <>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setSoundOn((v) => !v)}
              aria-label={soundOn ? 'Mute sounds' : 'Unmute sounds'}
            >
              {soundOn ? <Volume2 /> : <VolumeX />}
            </Button>
            <Button variant="outline" onClick={() => setSettingsOpen(true)}>
              <Settings2 /> Settings
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ── Timer face ── */}
        <Card
          className={cn(
            'relative overflow-hidden lg:col-span-2',
            phase === 'work' && 'border-primary/30',
            phase === 'rest' && 'border-ignite/30',
            phase === 'prepare' && 'border-nutri/30'
          )}
        >
          <CardContent className="flex flex-col items-center px-4 py-10 sm:py-14">
            {/* Round dots */}
            <div className="mb-8 flex items-center gap-1.5">
              {Array.from({ length: totalRounds }, (_, i) => {
                const active = phase !== 'idle' && phase !== 'done' && i === round - 1
                const done = phase !== 'idle' && phase !== 'done' && i < round - (phase === 'work' ? 1 : 0)
                return (
                  <span
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      active ? 'w-6' : 'w-1.5',
                      active
                        ? ''
                        : done
                          ? 'bg-primary/60'
                          : 'bg-white/10'
                    )}
                    style={active ? { backgroundColor: ringColor } : undefined}
                  />
                )
              })}
            </div>

            {/* Ring */}
            <div className="relative w-full max-w-[300px]">
              {isRunning && meta && (
                <div
                  className="pointer-events-none absolute inset-4 animate-pulse rounded-full"
                  style={{ boxShadow: `0 0 90px 12px ${meta.color}26` }}
                />
              )}
              <RingProgress
                value={ringValue}
                size={280}
                stroke={16}
                color={ringColor}
                glow={isRunning}
                className="max-[380px]:!size-[min(78vw,240px)]"
              >
                <Badge
                  className={cn('mb-3 border-transparent')}
                  variant="secondary"
                >
                  <span
                    className="mr-1 inline-block size-2 rounded-full"
                    style={{ backgroundColor: ringColor }}
                  />
                  {phase === 'idle'
                    ? 'Ready'
                    : phase === 'done'
                      ? 'Complete'
                      : meta?.badge}
                </Badge>
                <p
                  className="text-[clamp(2.6rem,14vw,4.5rem)] font-bold leading-none tracking-tight tabular"
                  style={{ color: phase === 'idle' || phase === 'done' ? undefined : ringColor }}
                >
                  {phase === 'done' ? '00:00' : fmtClock(phase === 'idle' ? config.prepSec : remainingSec)}
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {phase === 'idle'
                    ? `${config.rounds} rounds · ${Math.round(totalWorkSec(config) / 60)} min total`
                    : phase === 'done'
                      ? 'Session complete — nice work'
                      : `Round ${round} of ${totalRounds}`}
                </p>
                {meta && <p className="mt-0.5 text-xs text-muted-foreground/70">{meta.hint}</p>}
              </RingProgress>
            </div>

            {totalRemaining > 0 && (
              <p className="mt-6 text-xs text-muted-foreground tabular">
                ≈ {fmtClock(totalRemaining)} left in session
              </p>
            )}

            {/* Controls */}
            <div className="mt-8 flex items-center gap-3">
              {phase === 'idle' || phase === 'done' ? (
                <Button
                  size="xl"
                  variant={phase === 'done' ? 'secondary' : 'energy'}
                  className="min-w-44 rounded-full text-lg"
                  onClick={phase === 'done' ? timer.reset : timer.start}
                >
                  {phase === 'done' ? (
                    <>
                      <RotateCcw /> Again
                    </>
                  ) : (
                    <>
                      <Play /> Start
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-12 rounded-full"
                    onClick={timer.reset}
                    aria-label="Reset"
                  >
                    <RotateCcw />
                  </Button>
                  <Button
                    size="xl"
                    variant={isRunning ? 'secondary' : 'energy'}
                    className="min-w-40 rounded-full text-lg"
                    onClick={isRunning ? timer.pause : timer.resume}
                  >
                    {isRunning ? (
                      <>
                        <Pause /> Pause
                      </>
                    ) : (
                      <>
                        <Play /> Resume
                      </>
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-12 rounded-full"
                    onClick={timer.skip}
                    aria-label="Skip to next interval"
                  >
                    <SkipForward />
                  </Button>
                </>
              )}
            </div>

            <SwitchRow
              className="mt-8"
              label="Sound signals"
              checked={soundOn}
              onChange={setSoundOn}
            />
          </CardContent>
        </Card>

        {/* ── Presets & current config ── */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Modes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={isRunning}
                  onClick={() => applyPreset(p)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-all',
                    presetId === p.id && !isCustom
                      ? 'border-ignite/40 bg-ignite/[0.07]'
                      : 'border-line hover:border-white/15 hover:bg-secondary',
                    isRunning && 'cursor-not-allowed opacity-40'
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground tabular">{p.description}</p>
                  </div>
                  {presetId === p.id && !isCustom && (
                    <span className="size-2 shrink-0 rounded-full bg-ignite glow-ignite" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Current setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <ConfigPill label="Prep" value={`${config.prepSec}s`} />
                <ConfigPill label="Work" value={`${config.workSec}s`} accent="text-energy" />
                <ConfigPill label="Rest" value={`${config.restSec}s`} accent="text-ignite" />
                <ConfigPill label="Rounds" value={String(config.rounds)} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground tabular">
                {isCustom ? 'Custom' : PRESETS.find((p) => p.id === presetId)?.name} ·{' '}
                {Math.round(
                  (config.prepSec +
                    config.rounds * config.workSec +
                    (config.rounds - 1) * config.restSec) /
                    60
                )}{' '}
                min session
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Settings sheet ── */}
      <Sheet open={settingsOpen} onOpenChange={(o) => !isRunning && setSettingsOpen(o)}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Interval settings</SheetTitle>
            <SheetDescription>
              {isRunning ? 'Stop the timer to edit settings.' : 'Times are in seconds.'}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-5 overflow-y-auto p-5">
            <NumberField
              label="Preparation time, sec"
              value={config.prepSec}
              min={0}
              max={300}
              disabled={isRunning}
              onChange={(v) => patch(setConfig, { prepSec: v })}
            />
            <NumberField
              label="Work time, sec"
              value={config.workSec}
              min={5}
              max={600}
              disabled={isRunning}
              onChange={(v) => patch(setConfig, { workSec: v })}
            />
            <NumberField
              label="Rest time, sec"
              value={config.restSec}
              min={0}
              max={600}
              disabled={isRunning}
              onChange={(v) => patch(setConfig, { restSec: v })}
            />
            <NumberField
              label="Rounds"
              value={config.rounds}
              min={1}
              max={99}
              disabled={isRunning}
              onChange={(v) => patch(setConfig, { rounds: v })}
            />
            <NumberField
              label="Rest between rounds, sec"
              value={config.restBetweenRoundsSec}
              min={0}
              max={600}
              disabled={isRunning}
              onChange={(v) => patch(setConfig, { restBetweenRoundsSec: v })}
            />
            <div className="rounded-xl border border-line bg-surface-2/50 p-3.5 text-xs leading-relaxed text-muted-foreground">
              Longer rest is applied automatically after each round when “rest between rounds” exceeds
              the regular rest.
            </div>
            <Button
              variant="secondary"
              className="w-full"
              disabled={isRunning}
              onClick={() => {
                setPresetId('custom')
                setSettingsOpen(false)
              }}
            >
              Save as custom setup
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/* helpers */

function patch(
  setConfig: React.Dispatch<React.SetStateAction<IntervalConfig>>,
  part: Partial<IntervalConfig>
) {
  setConfig((c) => ({ ...c, ...part }))
}

function ConfigPill({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-2/50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn('mt-0.5 text-lg font-bold tabular', accent)}>{value}</p>
    </div>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  disabled?: boolean
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="normal-case tracking-normal text-secondary-foreground">{label}</Label>
      <div className="flex items-center gap-1.5">
        <Button
          size="icon-sm"
          variant="outline"
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, value - (max > 100 ? 5 : 1)))}
          aria-label={`Decrease ${label}`}
        >
          −
        </Button>
        <Input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          disabled={disabled}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, Math.round(n))))
          }}
          className="h-9 w-16 text-center tabular"
          aria-label={label}
        />
        <Button
          size="icon-sm"
          variant="outline"
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + (max > 100 ? 5 : 1)))}
          aria-label={`Increase ${label}`}
        >
          +
        </Button>
      </div>
    </div>
  )
}

function SwitchRow({
  label,
  checked,
  onChange,
  className,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  className?: string
}) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-3 text-sm text-muted-foreground', className)}>
      <Switch checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  )
}
