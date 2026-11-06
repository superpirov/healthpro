import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { format } from 'date-fns'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { ThemeToggle } from './ThemeToggle'
import { Toaster } from '@/components/ui/toast'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { pathname } = useLocation()
  const theme = useAppStore((s) => s.theme)

  return (
    <div className={cn(theme === 'light' && 'light')}>
      <div className="app-vignette min-h-dvh text-foreground">
        <Sidebar />
        <main className="pb-24 lg:pb-8 lg:pl-60">
          <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8">
            {/* Mobile top bar */}
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
              <ThemeToggle className="size-9" />
            </div>
            <p className="mb-4 hidden text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground lg:block">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <MobileNav />
        <Toaster />
      </div>
    </div>
  )
}
