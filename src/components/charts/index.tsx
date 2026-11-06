import { t } from '@/lib/i18n'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/* Shared FORMA chart styling — hairline grid, muted axes.
   Colors come from CSS variables so charts adapt to dark/light themes. */

const AXIS = {
  stroke: 'var(--muted-foreground)',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const

const GRID = {
  stroke: 'var(--border)',
  strokeDasharray: '3 6',
  vertical: false,
} as const

const CURSOR = { stroke: 'var(--border)' } as const
const BAR_CURSOR = { fill: 'color-mix(in srgb, var(--energy) 6%, transparent)' } as const

interface TipEntry {
  name?: string
  value?: number | string
  color?: string
  dataKey?: string | number
}

function ChartTip({
  active,
  payload,
  label,
  unit = '',
}: {
  active?: boolean
  payload?: TipEntry[]
  label?: string | number
  unit?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-popover/95 px-3 py-2 shadow-xl shadow-black/40 backdrop-blur">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="mt-0.5 text-sm font-semibold tabular" style={{ color: p.color }}>
          {typeof p.value === 'number' ? Math.round(p.value).toLocaleString('ru-RU') : p.value}
          {unit && ` ${unit}`}
          {p.name && p.name !== String(p.dataKey) && (
            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">{p.name}</span>
          )}
        </p>
      ))}
    </div>
  )
}

export interface VolumePoint {
  label: string
  volume: number
}

/** Training volume bars */
export function VolumeChart({ data, height = 220 }: { data: VolumePoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid {...GRID} />
        <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={18} />
        <YAxis {...AXIS} width={48} />
        <Tooltip content={<ChartTip unit="kg" />} cursor={BAR_CURSOR} />
        <Bar dataKey="volume" name={t('chart_volume')} fill="var(--energy)" radius={[5, 5, 2, 2]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export interface MinutesPoint {
  label: string
  minutes: number
}

/** Active minutes area */
export function ActivityChart({ data, height = 220 }: { data: MinutesPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gEnergy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--energy)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--energy)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={18} />
        <YAxis {...AXIS} width={48} />
        <Tooltip content={<ChartTip unit="min" />} cursor={CURSOR} />
        <Area
          type="monotone"
          dataKey="minutes"
          name={t('kpi_active_time')}
          stroke="var(--energy)"
          strokeWidth={2.5}
          fill="url(#gEnergy)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--energy)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export interface CaloriesPoint {
  label: string
  calories: number
}

/** Calories area with goal line support via reference in parent */
export function CaloriesChart({ data, height = 220 }: { data: CaloriesPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gNutri" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--nutri)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--nutri)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={18} />
        <YAxis {...AXIS} width={48} />
        <Tooltip content={<ChartTip unit="kcal" />} cursor={CURSOR} />
        <Area
          type="monotone"
          dataKey="calories"
          name={t('kpi_calories')}
          stroke="var(--nutri)"
          strokeWidth={2.5}
          fill="url(#gNutri)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--nutri)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export interface ProteinPoint {
  label: string
  protein: number
}

export function ProteinChart({ data, height = 220 }: { data: ProteinPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={18} />
        <YAxis {...AXIS} width={48} />
        <Tooltip content={<ChartTip unit="g" />} cursor={CURSOR} />
        <Line
          type="monotone"
          dataKey="protein"
          name={t('kpi_protein')}
          stroke="var(--nutri)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--nutri)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export interface FrequencyPoint {
  label: string
  workouts: number
}

export function FrequencyChart({ data, height = 220 }: { data: FrequencyPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid {...GRID} />
        <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={18} />
        <YAxis {...AXIS} width={48} allowDecimals={false} />
        <Tooltip content={<ChartTip />} cursor={BAR_CURSOR} />
        <Bar dataKey="workouts" name={t('workouts')} fill="var(--energy)" radius={[5, 5, 2, 2]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}
