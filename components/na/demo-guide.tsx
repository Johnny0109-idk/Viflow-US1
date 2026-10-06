'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const STEPS = [
  'Xem video trong Feed',
  'Video kết thúc, mở Quiz',
  'Trả lời câu hỏi quiz',
  'Bình chọn giảng viên',
  'Mở khóa thẻ ghi nhớ',
  'Lưu thẻ vào thư mục',
  'Tab Đã lưu cập nhật dữ liệu',
  'Mở thư mục và bắt đầu ôn thẻ',
]

export function DemoGuide() {
  const [open, setOpen] = useState(false)
  const demoStep = useAppStore((s) => s.demoStep)
  const resetDemo = useAppStore((s) => s.resetDemo)
  const current = Math.min(demoStep, STEPS.length + 1)

  return (
    <div className="absolute right-3 top-3 z-50 flex w-[min(300px,calc(100%-24px))] flex-col items-end">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="demo-guide-panel"
        className="flex min-h-9 items-center gap-1.5 rounded-full border-[2.5px] border-ink bg-yellow px-3 text-xs font-bold text-ink shadow-hard-sm outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Demo guide
        <span className="rounded-full bg-ink px-1.5 py-0.5 text-[10px] text-cream">
          {Math.min(current, STEPS.length)}/{STEPS.length}
        </span>
        {open ? (
          <ChevronUp aria-hidden className="size-4" />
        ) : (
          <ChevronDown aria-hidden className="size-4" />
        )}
      </button>

      {open && (
        <div
          id="demo-guide-panel"
          className="mt-2 w-full rounded-2xl border-[2.5px] border-ink bg-cream p-3 shadow-hard-sm"
        >
          <ol className="flex flex-col gap-1.5">
            {STEPS.map((label, i) => {
              const n = i + 1
              const done = n < current
              const active = n === current
              return (
                <li
                  key={label}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border-2 px-2 py-1.5 text-xs font-semibold text-ink',
                    active
                      ? 'border-ink bg-purple'
                      : done
                        ? 'border-ink/30 bg-green/40'
                        : 'border-ink/20',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-ink text-[10px] font-bold',
                      done ? 'bg-green' : active ? 'bg-yellow' : 'bg-cream',
                    )}
                  >
                    {done ? <Check aria-hidden className="size-3" /> : n}
                  </span>
                  {label}
                </li>
              )
            })}
          </ol>
          <button
            type="button"
            onClick={resetDemo}
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border-[2.5px] border-ink bg-pink text-sm font-bold text-ink outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-0.5"
          >
            <RotateCcw aria-hidden className="size-4" />
            Reset demo
          </button>
        </div>
      )}
    </div>
  )
}
