import * as React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type QuizOptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed'

export interface QuizOptionProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  letter: string
  text: string
  state?: QuizOptionState
}

const stateBg: Record<QuizOptionState, string> = {
  idle: 'bg-cream',
  selected: 'bg-yellow',
  correct: 'bg-green',
  wrong: 'bg-pink',
  dimmed: 'bg-cream opacity-60',
}

export function QuizOption({
  letter,
  text,
  state = 'idle',
  className,
  ...props
}: QuizOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={state === 'selected'}
      className={cn(
        'flex min-h-14 w-full items-center gap-3 rounded-2xl border-[2.5px] border-ink p-3 text-left text-base font-bold text-ink shadow-hard-sm transition-[transform,box-shadow] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none',
        stateBg[state],
        className,
      )}
      {...props}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border-[2.5px] border-ink bg-cream text-sm font-extrabold">
        {state === 'correct' ? (
          <Check aria-hidden className="size-5" strokeWidth={3} />
        ) : state === 'wrong' ? (
          <X aria-hidden className="size-5" strokeWidth={3} />
        ) : (
          letter
        )}
      </span>
      <span className="min-w-0 flex-1 leading-snug">{text}</span>
      {state === 'correct' && <span className="sr-only">Correct answer</span>}
      {state === 'wrong' && <span className="sr-only">Wrong answer</span>}
    </button>
  )
}
