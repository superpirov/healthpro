import { create } from 'zustand'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastKind = 'success' | 'error'

interface ToastItem {
  id: number
  kind: ToastKind
  title: string
  description?: string
}

interface ToastState {
  toasts: ToastItem[]
  push: (t: Omit<ToastItem, 'id'>) => void
  dismiss: (id: number) => void
}

let seq = 0

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++seq
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }))
    }, 3500)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'success', title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'error', title, description }),
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end sm:px-0">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-popover/95 p-3.5 shadow-2xl shadow-black/50 backdrop-blur',
              t.kind === 'success' ? 'border-primary/30' : 'border-destructive/40'
            )}
          >
            {t.kind === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-primary" />
            ) : (
              <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-destructive" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-foreground">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {t.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
