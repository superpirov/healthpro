# FORMA — Fitness & Nutrition Platform

Мобильно-приоритетный фитнес-продукт: дневник тренировок (GymLog), учёт питания (MacroLog) и интервальные таймеры (IntervalPro). Frontend MVP на демо-данных, всё сохраняется в localStorage.

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # продакшен-сборка в dist/
```

## Стек

React 19 · TypeScript · Vite · Tailwind CSS v4 · Radix UI (shadcn-стиль компоненты) · Zustand (persist) · Recharts · Framer Motion · date-fns · Lucide

## Структура

```
src/
  app/          роутер
  components/   ui/ (дизайн-система), layout/ (Sidebar, MobileNav), charts/
  features/     dashboard, workouts, nutrition, timer, progress
  data/         exercises.ts (44), foods.ts (70+), demoData.ts (согласованные демо-дни)
  store/        appStore.ts (Zustand + localStorage persist)
  hooks/        useDerived (агрегаты), useIntervalTimer (timestamp-таймер)
  lib/          расчёты объёма/макрос, форматтеры
  types/        доменные типы
```

## Демо-пользователь

Alex, цели: 2200 kcal / 160 P / 70 F / 230 C. 14 тренировок за ~5 недель с прогрессией нагрузок, 10 дней истории питания, личные рекорды. Данные генерируются детерминированно относительно «сегодня» и переживают перезагрузку. Сброс: `useAppStore.getState().resetDemoData()` в консоли.
