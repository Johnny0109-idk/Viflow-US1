import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/na/badge'

export interface FolderCardProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  title: string
  count: number
  color: string
  icon?: React.ReactNode
  countLabel?: string
}

export function FolderCard({
  title,
  count,
  color,
  icon,
  countLabel = 'cards',
  className,
  ...props
}: FolderCardProps) {
  return (
    <button
      type="button"
      className={cn(
        'group relative mt-3 flex min-h-28 w-full flex-col justify-between rounded-2xl border-[2.5px] border-ink p-4 text-left text-ink shadow-hard-sm transition-[transform,box-shadow] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple active:translate-x-1 active:translate-y-1 active:shadow-none',
        className,
      )}
      style={{ backgroundColor: color }}
      {...props}
    >
      <span
        aria-hidden
        className="absolute -top-3 left-4 h-3 w-14 rounded-t-lg border-[2.5px] border-b-0 border-ink"
        style={{ backgroundColor: color }}
      />
      <span className="flex size-10 items-center justify-center rounded-xl border-[2.5px] border-ink bg-cream [&_svg]:size-5">
        {icon}
      </span>
      <span className="mt-3 flex items-end justify-between gap-2">
        <span className="text-base font-extrabold leading-tight">{title}</span>
        <Badge outlined>
          {count} {countLabel}
        </Badge>
      </span>
    </button>
  )
}
