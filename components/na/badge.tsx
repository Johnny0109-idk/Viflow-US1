import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeStyles = cva(
  'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold leading-none whitespace-nowrap',
  {
    variants: {
      tone: {
        cream: 'bg-cream text-ink',
        yellow: 'bg-yellow text-ink',
        pink: 'bg-pink text-ink',
        purple: 'bg-purple text-white',
        green: 'bg-green text-ink',
        ink: 'bg-ink text-cream',
      },
      outlined: {
        true: 'border-[2.5px] border-ink',
        false: '',
      },
    },
    defaultVariants: { tone: 'cream', outlined: false },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeStyles> {}

export function Badge({ className, tone, outlined, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeStyles({ tone, outlined }), className)} {...props} />
  )
}
