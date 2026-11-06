import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:brightness-105 glow-energy',
        secondary:
          'bg-secondary text-secondary-foreground border border-line hover:bg-surface-2 hover:border-white/10',
        ghost: 'text-muted-foreground hover:text-foreground hover:bg-secondary',
        outline:
          'border border-line bg-transparent text-foreground hover:bg-secondary hover:border-white/15',
        destructive:
          'bg-destructive/10 text-destructive border border-destructive/25 hover:bg-destructive/20',
        energy:
          'bg-energy text-[#0b0d0c] hover:brightness-105 glow-energy',
        nutri:
          'bg-nutri text-[#0b0d0c] hover:brightness-105 glow-nutri',
        ignite:
          'bg-ignite text-[#0b0d0c] hover:brightness-105 glow-ignite',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-lg px-3 text-xs has-[>svg]:px-2.5',
        lg: 'h-12 rounded-xl px-6 text-base has-[>svg]:px-5',
        xl: 'h-14 rounded-2xl px-8 text-base has-[>svg]:px-7',
        icon: 'size-10 rounded-xl',
        'icon-sm': 'size-8 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
