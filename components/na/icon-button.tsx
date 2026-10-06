import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/na/badge'

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: React.ReactNode
  label: string
  caption?: React.ReactNode
  pressedTone?: 'pink' | 'yellow' | 'purple'
}

const pressedBg = {
  pink: 'bg-pink',
  yellow: 'bg-yellow',
  purple: 'bg-purple text-white',
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { icon, label, caption, pressedTone = 'pink', className, ...props },
    ref,
  ) {
    const pressed = props['aria-pressed'] === true || props['aria-pressed'] === 'true'
    return (
      <div className="flex flex-col items-center gap-1.5">
        <button
          ref={ref}
          type="button"
          aria-label={label}
          className={cn(
            'flex size-12 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-cream text-ink shadow-hard-sm transition-[transform,box-shadow] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple active:translate-x-1 active:translate-y-1 active:shadow-none [&_svg]:size-6',
            pressed && pressedBg[pressedTone],
            className,
          )}
          {...props}
        >
          {icon}
        </button>
        {caption ? <Badge className="px-2 py-1">{caption}</Badge> : null}
      </div>
    )
  },
)
