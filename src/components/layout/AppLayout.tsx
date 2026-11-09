import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { ThemeToggle } from './ThemeToggle'
import { Toaster } from '@/components/ui/toast'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import { fdate } from '@/lib/i18n'

export function AppLayout() {
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
                {fdate(new Date(), 'EEEE, d MMMM')}
              </p>
              <ThemeToggle className="size-9" />
            </div>
            <p className="mb-4 hidden text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground lg:block">
              {fdate(new Date(), 'EEEE, d MMMM')}
            </p>
            <Outlet />
          </div>
        </main>
        <MobileNav />
        <Toaster />
      </div>
    </div>
  )
}
