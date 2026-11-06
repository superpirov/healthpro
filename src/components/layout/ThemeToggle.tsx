import { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/appStore'

/** Dark is the primary theme; this toggle switches to a light variant */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  // Reflect the theme on <html> for CSS variables and form controls
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    document.documentElement.style.colorScheme = theme
  }, [theme])

  return (
    <Button
      size="icon"
      variant="outline"
      className={className}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
