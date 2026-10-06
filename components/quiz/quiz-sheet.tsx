'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Bell, Check, Lightbulb, RotateCcw, Search, Star, X, Zap } from 'lucide-react'
import { Button } from '@/components/na/button'
import { getLecturerOf, getQuiz, getQuizzesForVideo, getVideo } from '@/lib/content'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const LETTERS = ['A', 'B', 'C', 'D']

type OptionState = 'idle' | 'selected' | 'correct' | 'wrong'

const optionBg: Record<OptionState, string> = {
  idle: 'bg-white',
  selected: 'bg-[#FFE98A] shadow-hard-sm',
  correct: 'bg-[#DDF5D6] shadow-hard-sm',
  wrong: 'bg-[#FFD6E6] shadow-hard-sm',
}

const tileBg: Record<OptionState, string> = {
  idle: 'bg-cream',
  selected: 'bg-yellow',
  correct: 'bg-green',
  wrong: 'bg-pink',
}

function SheetOption({
  letter,
  text,
  state,
  disabled,
  onClick,
}: {
  letter: string
  text: string
  state: OptionState
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={state === 'selected'}
      onClick={onClick}
      className={cn(
        'flex min-h-[46px] w-full items-center gap-3 rounded-2xl border-[2.5px] border-ink px-2.5 py-1.5 text-left text-base font-medium text-ink outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple disabled:cursor-default',
        optionBg[state],
      )}
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-lg border-2 border-ink text-sm',
          tileBg[state],
        )}
      >
        {letter}
      </span>
      <span className="min-w-0 flex-1 leading-snug">{text}</span>
      {(state === 'correct' || state === 'wrong') && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-ink">
          {state === 'correct' ? (
            <Check aria-hidden className="size-4" />
          ) : (
            <X aria-hidden className="size-4" />
          )}
          <span className="sr-only">{state === 'correct' ? 'Đáp án đúng' : 'Đáp án sai'}</span>
        </span>
      )}
    </button>
  )
}

function BackdropHeader({ videoId }: { videoId: string }) {
  const lecturer = getLecturerOf(getVideo(videoId))
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 flex flex-col gap-3 px-4 pt-5 text-white">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl border-[2.5px] border-ink bg-yellow text-base font-bold text-ink shadow-[2px_2px_0_#111]">
          NA
        </span>
        <span className="flex-1 text-xl font-medium">Bảng tin</span>
        <span className="flex size-11 items-center justify-center rounded-full border-2 border-white/60 bg-white/10">
          <Search className="size-5" />
        </span>
        <span className="flex size-11 items-center justify-center rounded-full border-2 border-white/60 bg-white/10">
          <Bell className="size-5" />
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <span
          className="size-9 shrink-0 rounded-full border-2 border-white"
          style={{ backgroundColor: lecturer.avatarColor }}
        />
        <span className="truncate text-sm">{lecturer.name}</span>
      </div>
      <p className="text-base leading-snug">Nhớ được bài chỉ trong 30 giây? Thử ngay nhé!</p>
    </div>
  )
}

function VoteRow({ lecturerId }: { lecturerId: string }) {
  const voted = useAppStore((s) => s.votedLecturerIds.includes(lecturerId))
  const toggleVote = useAppStore((s) => s.toggleVote)
  const [rating, setRating] = useState(0)

  const rate = (value: number) => {
    setRating(value)
    if (!voted) toggleVote(lecturerId)
    useAppStore.getState().completeDemoStep(3)
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-base text-ink/70">
        {voted ? 'Cảm ơn bạn đã bình chọn!' : 'Bình chọn cho giảng viên này'}
      </p>
      <div role="group" aria-label="Bình chọn cho giảng viên, 5 sao" className="flex justify-between">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} sao`}
            aria-pressed={rating >= value}
            onClick={() => rate(value)}
            className={cn(
              'flex size-12 items-center justify-center rounded-xl border-[2.5px] border-ink outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple',
              rating >= value ? 'bg-yellow shadow-[2px_2px_0_#111]' : 'bg-butter',
            )}
          >
            <Star aria-hidden className={cn('size-6', rating >= value && 'fill-ink')} />
          </button>
        ))}
      </div>
    </div>
  )
}

interface QuizSheetProps {
  videoId: string
  quizIds?: string[]
  onClose: () => void
  onComplete: () => void
}

export function QuizSheet({ videoId, quizIds, onClose, onComplete }: QuizSheetProps) {
  const video = getVideo(videoId)
  const isRetry = Boolean(quizIds)
  const quizzes = quizIds ? quizIds.map(getQuiz) : getQuizzesForVideo(videoId)
  const flashcardIds = Array.from(
    new Set(quizzes.flatMap((q) => getVideo(q.videoId).flashcardIds)),
  )
  const answerQuiz = useAppStore((s) => s.answerQuiz)
  const unlockFlashcards = useAppStore((s) => s.unlockFlashcards)

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [finished, setFinished] = useState(false)
  const [navHeight, setNavHeight] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const nav = document.querySelector<HTMLElement>('nav[aria-label="Main"]')
    setNavHeight(nav?.offsetHeight ?? 0)
  }, [])

  useEffect(() => {
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const quiz = quizzes[index]
  const isLast = index === quizzes.length - 1
  const score = results.filter(Boolean).length

  const handleCheck = () => {
    if (picked === null) return
    answerQuiz(quiz.id, picked)
    setResults((r) => [...r, picked === quiz.correctIndex])
    setChecked(true)
  }

  const handleNext = () => {
    if (!isLast) {
      setIndex((i) => i + 1)
      setPicked(null)
      setChecked(false)
      return
    }
    unlockFlashcards(flashcardIds)
    if (!isRetry) useAppStore.getState().completeDemoStep(2)
    setFinished(true)
  }

  const optionState = (i: number): OptionState => {
    if (checked) {
      if (i === quiz.correctIndex) return 'correct'
      if (i === picked) return 'wrong'
      return 'idle'
    }
    return picked === i ? 'selected' : 'idle'
  }

  const answeredCorrectly = checked && picked === quiz.correctIndex

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Kiểm tra nhanh"
      className="absolute inset-x-0 top-0 z-50 flex flex-col justify-end outline-none"
      style={{ bottom: -navHeight }}
    >
      <div aria-hidden className="absolute inset-0 bg-linear-to-b from-ink/95 via-ink/85 to-ink/60" />
      <BackdropHeader videoId={videoId} />

      <section className="relative flex max-h-[84%] min-h-0 flex-col rounded-t-[36px] border-[2.5px] border-b-0 border-ink bg-[#FDF6E3]">
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-[18px] pt-3.5 pb-8">
          <span aria-hidden className="h-[5px] w-[52px] rounded-full bg-ink" />

          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 -rotate-6 items-center justify-center rounded-lg border-[2.5px] border-ink bg-pink">
              <Zap aria-hidden className="size-5" />
            </span>
            <h2 className="flex-1 text-2xl font-medium text-ink">Kiểm tra nhanh</h2>
            {!finished && (
              <span className="rounded-full border-[2.5px] border-ink bg-yellow px-3 py-1.5 text-sm font-medium text-ink">
                Câu hỏi {index + 1}/{quizzes.length}
              </span>
            )}
          </div>

          {finished ? (
            <>
              <div className="flex flex-col gap-1 rounded-2xl border-[2.5px] border-ink bg-white p-4 shadow-hard-sm">
                <p className="text-xs tracking-wide text-ink/60 uppercase">Kết quả của bạn</p>
                <p className="text-5xl font-bold text-ink" aria-label={`${score} trên ${quizzes.length} câu đúng`}>
                  {score}/{quizzes.length}
                </p>
                <p className="text-base text-ink">
                  {score === quizzes.length
                    ? 'Tuyệt vời! Bạn nắm chắc bài này rồi.'
                    : score > 0
                      ? 'Khá tốt! Xem lại phần chưa đúng nhé.'
                      : 'Đừng lo, xem lại video và thử lại nhé.'}
                </p>
                <ul className="mt-2 flex gap-2">
                  {results.map((ok, i) => (
                    <li
                      key={i}
                      className={cn(
                        'flex size-8 items-center justify-center rounded-lg border-2 border-ink',
                        ok ? 'bg-green' : 'bg-pink',
                      )}
                    >
                      {ok ? <Check aria-hidden className="size-4" /> : <X aria-hidden className="size-4" />}
                      <span className="sr-only">{`Câu ${i + 1}: ${ok ? 'đúng' : 'sai'}`}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-sm text-ink/70">
                Đã mở khóa {flashcardIds.length} thẻ ghi nhớ cho bài này.
              </p>

              {!isRetry && <VoteRow lecturerId={video.lecturerId} />}

              <Button tone="yellow" size="sm" className="min-h-[50px] w-full text-lg font-medium" onClick={onComplete}>
                Xong
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1 rounded-2xl border-[2.5px] border-ink bg-white p-3.5 shadow-hard-sm">
                <p className="text-xs tracking-wide text-ink/60 uppercase">Chọn một đáp án</p>
                <p className="text-lg leading-snug font-medium text-ink">{quiz.question}</p>
              </div>

              <div className="flex flex-col gap-2.5">
                {quiz.options.map((text, i) => (
                  <SheetOption
                    key={i}
                    letter={LETTERS[i]}
                    text={text}
                    state={optionState(i)}
                    disabled={checked}
                    onClick={() => setPicked(i)}
                  />
                ))}
              </div>

              {checked && (
                <div
                  role="status"
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border-[2.5px] border-ink p-2.5',
                    answeredCorrectly ? 'bg-[#DDF5D6]' : 'bg-[#FFD6E6]',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink',
                      answeredCorrectly ? 'bg-green' : 'bg-pink',
                    )}
                  >
                    {answeredCorrectly ? (
                      <Lightbulb aria-hidden className="size-5" />
                    ) : (
                      <RotateCcw aria-hidden className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium text-ink">
                      {answeredCorrectly ? 'Chính xác!' : 'Xem lại một chút'}
                    </p>
                    <p className="text-sm leading-snug text-ink">{quiz.explanation}</p>
                  </div>
                </div>
              )}

              <Button
                tone="yellow"
                size="sm"
                disabled={!checked && picked === null}
                className="min-h-[50px] w-full text-lg font-medium"
                onClick={checked ? handleNext : handleCheck}
              >
                {checked ? (isLast ? 'Xem kết quả' : 'Tiếp theo') : 'Kiểm tra'}
                <ArrowRight aria-hidden className="size-5" />
              </Button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
