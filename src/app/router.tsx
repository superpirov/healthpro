import { createBrowserRouter, Navigate } from 'react-router-dom'
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

export const router = createBrowserRouter([
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
      { path: 'nutrition', element: <NutritionPage /> },
      { path: 'timer', element: <TimerPage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
