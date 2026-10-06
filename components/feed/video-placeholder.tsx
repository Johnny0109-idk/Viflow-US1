import { Pause, Play } from 'lucide-react'
import { Badge } from '@/components/na/badge'

interface VideoPlaceholderProps {
  color: string
  concept: string
  playing: boolean
  onToggle: () => void
}

export function VideoPlaceholder({
  color,
  concept,
  playing,
  onToggle,
}: VideoPlaceholderProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <span
        aria-hidden
        className="px-6 text-center text-6xl leading-none font-extrabold tracking-tight text-ink/10 uppercase"
      >
        {concept}
      </span>
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={playing ? 'Pause video' : 'Play video'}
          className="flex size-16 items-center justify-center rounded-3xl border-[2.5px] border-ink bg-cream text-ink shadow-hard outline-none transition-[transform,box-shadow] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          {playing ? (
            <Pause aria-hidden className="size-8 fill-ink" />
          ) : (
            <Play aria-hidden className="size-8 fill-ink" />
          )}
        </button>
        <Badge outlined>Demo video placeholder</Badge>
      </div>
    </div>
  )
}
