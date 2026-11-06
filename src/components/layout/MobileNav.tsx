import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './Sidebar'

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/90 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex h-[64px] max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground active:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200',
                    isActive && 'bg-primary/12'
                  )}
                >
                  <Icon className="size-[19px]" strokeWidth={isActive ? 2.4 : 2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
