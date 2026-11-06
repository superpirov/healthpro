import { t } from '@/lib/i18n'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 1640 -> "1,640" */
export function fmt(n: number): string {
  return Math.round(n).toLocaleString('ru-RU')
}

/** 205 -> "3h 25m" */
export function fmtDuration(minutes: number): string {
  const m = Math.round(minutes)
  if (m < 60) return `${m} ${t('min_unit')}`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest ? `${h} ${t('h_unit')} ${rest} ${t('min_unit')}` : `${h} ${t('h_unit')}`
}

/** seconds -> "mm:ss" */
export function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds))
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

/** Large volume numbers: 12450 -> "12.5k" */
export function fmtCompact(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return fmt(n)
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
