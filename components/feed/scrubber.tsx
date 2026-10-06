import { formatTime } from '@/lib/format'

interface ScrubberProps {
  elapsed: number
  duration: number
  onSeek: (seconds: number) => void
}

export function Scrubber({ elapsed, duration, onSeek }: ScrubberProps) {
  const pct = Math.min(100, (elapsed / duration) * 100)

  return (
    <div className="relative h-5">
      <input
        type="range"
        min={0}
        max={duration}
        step={0.1}
        value={elapsed}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Video position"
        aria-valuetext={`${formatTime(elapsed)} of ${formatTime(duration)}`}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full border-[2.5px] border-ink bg-cream peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-purple">
        <div
          className="h-full rounded-full bg-yellow"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div
        aria-hidden
        className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-ink bg-cream"
        style={{ left: `${pct}%` }}
      />
    </div>
  )
}
