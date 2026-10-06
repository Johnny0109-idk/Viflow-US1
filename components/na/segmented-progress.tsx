import { cn } from '@/lib/utils'

export interface SegmentedProgressProps {
  total: number
  value: number
  label?: string
  className?: string
}

export function SegmentedProgress({
  total,
  value,
  label = 'Progress',
  className,
}: SegmentedProgressProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      className={cn('flex w-full items-center gap-1.5', className)}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-3 min-w-0 flex-1 rounded-full border-[2.5px] border-ink',
            i < value ? 'bg-yellow' : 'bg-cream',
          )}
        />
      ))}
    </div>
  )
}
