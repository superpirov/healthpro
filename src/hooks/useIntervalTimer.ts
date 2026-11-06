import { useCallback, useEffect, useRef, useState } from 'react'
import type { IntervalConfig, TimerPhase } from '@/types'

/**
 * Interval timer driven by wall-clock timestamps (Date.now()), not tick
 * accumulation — so tab throttling / background tabs never drift the clock.
 * A single 100 ms rAF-ish interval only recomputes display state.
 */

export interface TimerSnapshot {
  phase: TimerPhase
  round: number // 1-based current round
  totalRounds: number
  remainingSec: number
  phaseTotalSec: number
}

interface TimerEngine {
  phase: TimerPhase
  round: number
  phaseEndsAt: number // epoch ms
  phaseTotalSec: number
}

function initialEngine(): TimerEngine {
  return { phase: 'idle', round: 0, phaseEndsAt: 0, phaseTotalSec: 0 }
}

/** Millisecond beep via Web Audio API — no external assets */
let audioCtx: AudioContext | null = null
export function beep(kind: 'start' | 'end' | 'tick' | 'done') {
  try {
    audioCtx ??= new AudioContext()
    if (audioCtx.state === 'suspended') void audioCtx.resume()
    const t = audioCtx.currentTime
    const play = (freq: number, at: number, dur: number, gain = 0.22) => {
      const osc = audioCtx!.createOscillator()
      const g = audioCtx!.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(gain, at + 0.015)
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
      osc.connect(g).connect(audioCtx!.destination)
      osc.start(at)
      osc.stop(at + dur + 0.05)
    }
    if (kind === 'start') play(660, t, 0.18)
    else if (kind === 'end') { play(880, t, 0.16); play(880, t + 0.22, 0.16) }
    else if (kind === 'tick') play(520, t, 0.07, 0.1)
    else if (kind === 'done') { play(660, t, 0.15); play(880, t + 0.18, 0.15); play(1100, t + 0.36, 0.3) }
  } catch {
    /* audio unavailable — silently ignore */
  }
}

export function useIntervalTimer(config: IntervalConfig, soundOn: boolean) {
  const engineRef = useRef<TimerEngine>(initialEngine())
  const runningRef = useRef(false)
  const pausedRemainRef = useRef(0) // ms left in phase when paused
  const soundRef = useRef(soundOn)
  soundRef.current = soundOn

  const [snap, setSnap] = useState<TimerSnapshot>({
    phase: 'idle',
    round: 0,
    totalRounds: config.rounds,
    remainingSec: config.prepSec,
    phaseTotalSec: config.prepSec,
  })
  const [isRunning, setIsRunning] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastWholeSecRef = useRef(-1)

  const publish = useCallback(() => {
    const e = engineRef.current
    if (e.phase === 'idle' || e.phase === 'done') {
      setSnap({
        phase: e.phase,
        round: e.phase === 'done' ? engineRef.current.round : 0,
        totalRounds: config.rounds,
        remainingSec: e.phase === 'done' ? 0 : config.prepSec,
        phaseTotalSec: e.phase === 'done' ? 0 : config.prepSec,
      })
      return
    }
    const remainMs = Math.max(0, e.phaseEndsAt - Date.now())
    setSnap({
      phase: e.phase,
      round: e.round,
      totalRounds: config.rounds,
      remainingSec: remainMs / 1000,
      phaseTotalSec: e.phaseTotalSec,
    })
  }, [config.rounds, config.prepSec])

  const stopTicking = () => {
    if (tickRef.current !== null) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }

  /** Advance to the next phase based on schedule */
  const restLenFor = useCallback(
    (round: number) => {
      const c = config
      const between = Math.max(c.restSec, c.restBetweenRoundsSec)
      const block = Math.max(1, Math.ceil(c.rounds / 2))
      return round % block === 0 ? between : c.restSec
    },
    [config]
  )
  const restLenForRef = useRef(restLenFor)
  restLenForRef.current = restLenFor

  const advance = useCallback((from: TimerEngine): TimerEngine => {
    const c = config
    switch (from.phase) {
      case 'prepare':
        return {
          phase: 'work',
          round: 1,
          phaseEndsAt: Date.now() + c.workSec * 1000,
          phaseTotalSec: c.workSec,
        }
      case 'work': {
        if (from.round >= c.rounds) {
          return { phase: 'done', round: c.rounds, phaseEndsAt: 0, phaseTotalSec: 0 }
        }
        const rest = restLenForRef.current(from.round)
        return {
          phase: rest > c.restSec ? 'rest-between' : 'rest',
          round: from.round,
          phaseEndsAt: Date.now() + rest * 1000,
          phaseTotalSec: rest,
        }
      }
      case 'rest':
        return {
          phase: 'work',
          round: from.round + 1,
          phaseEndsAt: Date.now() + c.workSec * 1000,
          phaseTotalSec: c.workSec,
        }
      case 'rest-between':
        return {
          phase: 'work',
          round: from.round + 1,
          phaseEndsAt: Date.now() + c.workSec * 1000,
          phaseTotalSec: c.workSec,
        }
      default:
        return from
    }
  }, [config])

  const tick = useCallback(() => {
    let e = engineRef.current
    if (e.phase === 'idle' || e.phase === 'done') return
    let changed = false
    // Handle possibly multiple phase crossings after a long tab freeze
    while (Date.now() >= e.phaseEndsAt) {
      if (soundRef.current) beep(e.phase === 'work' ? 'end' : 'start')
      e = advance(e)
      changed = true
      if (e.phase === 'done') {
        if (soundRef.current) beep('done')
        runningRef.current = false
        setIsRunning(false)
        stopTicking()
        break
      }
    }
    engineRef.current = e
    // last-3-second ticks
    if (runningRef.current) {
      const whole = Math.ceil((e.phaseEndsAt - Date.now()) / 1000)
      if (whole <= 3 && whole >= 1 && whole !== lastWholeSecRef.current) {
        lastWholeSecRef.current = whole
        if (soundRef.current) beep('tick')
      }
    }
    if (changed || runningRef.current) publish()
  }, [advance, publish])

  const startTicking = useCallback(() => {
    stopTicking()
    tickRef.current = setInterval(tick, 100)
  }, [tick])

  const start = useCallback(() => {
    const c = config
    const prep = c.prepSec > 0
    engineRef.current = prep
      ? { phase: 'prepare', round: 0, phaseEndsAt: Date.now() + c.prepSec * 1000, phaseTotalSec: c.prepSec }
      : { phase: 'work', round: 1, phaseEndsAt: Date.now() + c.workSec * 1000, phaseTotalSec: c.workSec }
    pausedRemainRef.current = 0
    lastWholeSecRef.current = -1
    runningRef.current = true
    setIsRunning(true)
    if (soundRef.current) beep(prep ? 'start' : 'start')
    publish()
    startTicking()
  }, [config, publish, startTicking])

  const pause = useCallback(() => {
    if (!runningRef.current) return
    const e = engineRef.current
    if (e.phase === 'idle' || e.phase === 'done') return
    pausedRemainRef.current = Math.max(0, e.phaseEndsAt - Date.now())
    runningRef.current = false
    setIsRunning(false)
    stopTicking()
    publish()
  }, [publish])

  const resume = useCallback(() => {
    if (runningRef.current) return
    const e = engineRef.current
    if (e.phase === 'idle' || e.phase === 'done') return
    const remain = pausedRemainRef.current > 0 ? pausedRemainRef.current : Math.max(0, e.phaseEndsAt - Date.now())
    engineRef.current = { ...e, phaseEndsAt: Date.now() + remain }
    pausedRemainRef.current = 0
    runningRef.current = true
    setIsRunning(true)
    startTicking()
  }, [startTicking])

  const reset = useCallback(() => {
    runningRef.current = false
    setIsRunning(false)
    stopTicking()
    pausedRemainRef.current = 0
    engineRef.current = initialEngine()
    publish()
  }, [config, publish])

  const skip = useCallback(() => {
    const e = engineRef.current
    if (e.phase === 'idle' || e.phase === 'done') return
    // Jump straight into the next phase
    const next = advance(e)
    engineRef.current = next
    lastWholeSecRef.current = -1
    if (next.phase === 'done') {
      if (soundRef.current) beep('done')
      runningRef.current = false
      setIsRunning(false)
      stopTicking()
    }
    publish()
  }, [advance, publish])

  // Re-sync when config changes while idle
  useEffect(() => {
    if (!runningRef.current && engineRef.current.phase === 'idle') publish()
  }, [config, publish])

  // Cleanup on unmount
  useEffect(() => () => stopTicking(), [])

  return { ...snap, isRunning, start, pause, resume, reset, skip }
}
