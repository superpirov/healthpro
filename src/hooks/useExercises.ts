import { useMemo } from 'react'
import { EXERCISES } from '@/data/exercises'
import { useAppStore } from '@/store/appStore'
import type { Exercise } from '@/types'

/** Built-in library + user-created exercises (custom ones first — most recent). */
export function useExercises(): Exercise[] {
  const custom = useAppStore((s) => s.customExercises)
  return useMemo(() => [...EXERCISES, ...custom], [custom])
}
