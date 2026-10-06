import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl border-[2.5px] border-ink font-bold select-none transition-[transform,box-shadow] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      tone: {
        yellow: 'bg-yellow text-ink',
        cream: 'bg-cream text-ink',
        pink: 'bg-pink text-ink',
        purple: 'bg-purple text-white',
        green: 'bg-green text-ink',
        ink: 'bg-ink text-cream',
      },
      size: {
        sm: 'min-h-11 px-4 text-sm shadow-hard-sm',
        md: 'min-h-12 px-5 text-base shadow-hard',
        lg: 'min-h-14 px-8 text-xl shadow-hard',
      },
    },
    defaultVariants: { tone: 'yellow', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, tone, size, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonStyles({ tone, size }), className)}
        {...props}
      />
    )
  },
)
