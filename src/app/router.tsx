import { createHashRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { WorkoutsPage } from '@/features/workouts/WorkoutsPage'
import { WorkoutDetailPage } from '@/features/workouts/WorkoutDetailPage'
import { ActiveWorkoutPage } from '@/features/workouts/ActiveWorkoutPage'
import { SummaryPage } from '@/features/workouts/SummaryPage'
import { ExerciseLibraryPage } from '@/features/workouts/ExerciseLibraryPage'
import { NutritionPage } from '@/features/nutrition/NutritionPage'
import { TimerPage } from '@/features/timer/TimerPage'
import { ProgressPage } from '@/features/progress/ProgressPage'
import { PlanPage } from '@/features/plan/PlanPage'
import { GuidesPage } from '@/features/guides/GuidesPage'
import { GuideDetailPage } from '@/features/guides/GuideDetailPage'

// HashRouter: GitHub Pages не отдаёт index.html для /healthpro/workouts,
// поэтому маршруты живут в хэше (#/workouts) и работают при прямом открытии
export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'workouts', element: <WorkoutsPage /> },
      { path: 'workouts/active', element: <ActiveWorkoutPage /> },
      { path: 'workouts/summary/:id', element: <SummaryPage /> },
      { path: 'workouts/exercises', element: <ExerciseLibraryPage /> },
      { path: 'workouts/:id', element: <WorkoutDetailPage /> },
      { path: 'plan', element: <PlanPage /> },
      { path: 'guides', element: <GuidesPage /> },
      { path: 'guides/:id', element: <GuideDetailPage /> },
      { path: 'nutrition', element: <NutritionPage /> },
      { path: 'timer', element: <TimerPage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
