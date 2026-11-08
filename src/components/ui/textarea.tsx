import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-16 w-full rounded-xl border border-input bg-surface-2 px-3.5 py-2.5 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
