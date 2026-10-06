'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  Check,
  CircleCheck,
  CircleX,
  Inbox,
  Layers,
  MoreHorizontal,
  RefreshCw,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UNSORTED_FOLDER_ID, useAppStore } from '@/lib/store'
import { getAllFlashcards, getQuiz, useContentSync } from '@/lib/content'
import { APP_NAME, profile } from '@/lib/mock-data'
import { recordsForFolder, resolveFolder } from '@/lib/saved-folders'
import { QuizSheet } from '@/components/quiz/quiz-sheet'

const LETTERS = ['A', 'B', 'C', 'D']

function QuestionCard({
  position,
  quizId,
  selectedIndex,
  isCorrect,
}: {
  position: number
  quizId: string
  selectedIndex: number
  isCorrect: boolean
}) {
  const [open, setOpen] = useState(false)
  const quiz = getQuiz(quizId)
  const panelId = `explain-${quizId}`

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="relative flex w-full flex-col gap-2 overflow-hidden rounded-2xl border-[2.5px] border-ink bg-white py-3 pr-3.5 pl-4 text-left text-ink shadow-hard-sm outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
      >
        <span
          aria-hidden
          className={cn(
            'absolute inset-y-0 left-0 w-1.5',
            isCorrect ? 'bg-green' : 'bg-[#E5484D]',
          )}
        />
        <span className="flex items-start gap-2">
          <span className="shrink-0 pt-0.5 text-xs font-bold tracking-wide text-ink/60 uppercase">
            Câu {String(position).padStart(2, '0')}
          </span>
          <span className="min-w-0 flex-1 text-sm leading-snug font-bold">
            {quiz.question}
          </span>
          <span
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-full border-2 px-2 py-0.5 text-xs font-bold',
              isCorrect
                ? 'border-green bg-[#DDF5D6] text-green'
                : 'border-[#E5484D] bg-[#FFE3E6] text-[#E5484D]',
            )}
          >
            {isCorrect ? (
              <CircleCheck aria-hidden className="size-3.5" />
            ) : (
              <CircleX aria-hidden className="size-3.5" />
            )}
            {isCorrect ? 'ĐÚNG' : 'SAI'}
          </span>
        </span>

        <span className="flex items-start justify-between gap-3">
          <span className="flex min-w-0 flex-col">
            <span className="text-xs text-ink/50">Câu trả lời của bạn</span>
            <span className="text-sm font-bold">
              {LETTERS[selectedIndex]}. {quiz.options[selectedIndex]}
            </span>
          </span>
          {!isCorrect && (
            <span className="flex min-w-0 flex-col items-end text-right">
              <span className="text-xs text-ink/50">Đáp án đúng</span>
              <span className="text-sm font-bold text-green">
                {LETTERS[quiz.correctIndex]}. {quiz.options[quiz.correctIndex]}
              </span>
            </span>
          )}
        </span>

        {open && (
          <span
            id={panelId}
            className={cn(
              'mt-1 rounded-xl border-2 border-ink p-2.5 text-sm leading-snug',
              isCorrect ? 'bg-[#DDF5D6]' : 'bg-[#FFD6E6]',
            )}
          >
            {quiz.explanation}
          </span>
        )}
      </button>
    </li>
  )
}

export function FolderDetail({ folderId }: { folderId: string }) {
  useContentSync()
  const answers = useAppStore((s) => s.answers)
  const sessionIds = useAppStore((s) => s.sessionAnsweredQuizIds)
  const unlockedIds = useAppStore((s) => s.unlockedFlashcardIds)
  const savedFolders = useAppStore((s) => s.savedFolders)
  const [retryIds, setRetryIds] = useState<string[] | null>(null)

  const folder = useMemo(() => resolveFolder(folderId), [folderId])
  const records = useMemo(
    () => (folder ? recordsForFolder(folder, answers, sessionIds) : []),
    [folder, answers, sessionIds],
  )
  const closeRetry = useCallback(() => setRetryIds(null), [])

  if (!folder) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-cream p-6 text-center">
        <p className="text-lg font-bold text-ink">Không tìm thấy thư mục này.</p>
        <Link
          href="/saved"
          className="rounded-2xl border-[2.5px] border-ink bg-yellow px-5 py-3 font-bold text-ink shadow-hard-sm"
        >
          Về Đã lưu
        </Link>
      </div>
    )
  }

  const studyCards =
    folder.kind === 'wrong'
      ? []
      : getAllFlashcards().filter(
          (f) =>
            unlockedIds.includes(f.id) &&
            (folder.kind === 'unsorted'
              ? savedFolders[f.id] === UNSORTED_FOLDER_ID
              : f.subjectId === folder.id),
        )
  const wrong = records.filter((r) => !r.isCorrect)
  const correctCount = records.length - wrong.length
  const icon =
    folder.kind === 'wrong' ? (
      <RotateCcw />
    ) : folder.kind === 'unsorted' ? (
      <Inbox />
    ) : folder.id === 'micro' ? (
      <TrendingUp />
    ) : (
      <BarChart3 />
    )

  return (
    <div className="h-full overflow-y-auto bg-cream px-5 pt-4 pb-6">
      <header className="flex items-center justify-between">
        <Link
          href="/saved"
          aria-label="Quay lại"
          className="flex size-11 items-center justify-center rounded-xl border-[2.5px] border-ink bg-white shadow-[3px_3px_0_#111] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
        >
          <ArrowLeft aria-hidden className="size-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-lg bg-ink text-[11px] font-extrabold text-cream"
          >
            {APP_NAME}
          </span>
          <span className="text-base font-extrabold">{profile.name}</span>
        </div>
        <button
          type="button"
          aria-label="Thêm tùy chọn"
          className="flex size-11 items-center justify-center rounded-xl border-[2.5px] border-ink bg-white shadow-[3px_3px_0_#111] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
        >
          <MoreHorizontal aria-hidden className="size-5" />
        </button>
      </header>

      <section
        className="mt-4 flex items-center gap-3 rounded-2xl border-[2.5px] border-ink p-3 shadow-hard-sm"
        style={{ backgroundColor: `${folder.color}33` }}
      >
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-xl border-[2.5px] border-ink text-ink [&_svg]:size-6"
          style={{ backgroundColor: folder.color }}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl leading-tight font-extrabold text-ink">{folder.name}</h1>
          <p className="text-sm text-ink/60">
            {records.length} câu hỏi · {wrong.length} câu cần thử lại
          </p>
        </div>
        <Sparkles aria-hidden className="size-7 shrink-0" style={{ color: folder.color }} />
      </section>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink">Câu hỏi đã trả lời</h2>
        <span className="text-sm font-bold text-ink/50">
          {correctCount}/{records.length} đúng
        </span>
      </div>

      {records.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border-[2.5px] border-dashed border-ink/40 p-6 text-center">
          <p className="text-sm text-ink/60">
            Chưa có câu hỏi nào trong thư mục này. Xem một video và làm quiz để thấy kết quả ở đây.
          </p>
          <Link
            href="/"
            className="rounded-xl border-[2.5px] border-ink bg-yellow px-4 py-2 text-sm font-bold text-ink shadow-hard-sm"
          >
            Xem video
          </Link>
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {records.map((record, i) => (
            <QuestionCard
              key={record.quizId}
              position={i + 1}
              quizId={record.quizId}
              selectedIndex={record.selectedIndex}
              isCorrect={record.isCorrect}
            />
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={wrong.length === 0}
        onClick={() => setRetryIds(wrong.map((r) => r.quizId))}
        className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-[2.5px] border-ink bg-yellow text-lg font-bold text-ink shadow-hard-sm outline-none transition-[transform,box-shadow] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:bg-butter/60 disabled:text-ink/40 disabled:shadow-none"
      >
        {wrong.length === 0 ? (
          <Check aria-hidden className="size-5" />
        ) : (
          <RefreshCw aria-hidden className="size-5" />
        )}
        {wrong.length === 0 ? 'Không còn câu sai' : 'Thử lại các câu sai'}
      </button>

      {studyCards.length > 0 && (
        <Link
          href={`/study/${folder.id}`}
          className="mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-[2.5px] border-ink bg-purple text-lg font-bold text-ink shadow-hard-sm outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <Layers aria-hidden className="size-5" />
          Ôn {studyCards.length} thẻ ghi nhớ
        </Link>
      )}

      {retryIds && (
        <QuizSheet
          videoId={getQuiz(retryIds[0]).videoId}
          quizIds={retryIds}
          onClose={closeRetry}
          onComplete={closeRetry}
        />
      )}
    </div>
  )
}
