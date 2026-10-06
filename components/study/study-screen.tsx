'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AlignLeft,
  Check,
  MoreHorizontal,
  PartyPopper,
  RefreshCw,
  Repeat,
  Type,
  X,
} from 'lucide-react'
import { UNSORTED_FOLDER_ID, useAppStore } from '@/lib/store'
import { getAllFlashcards, getFlashcard, getSubject, useContentHydrated } from '@/lib/content'

const hardShadow = 'shadow-[4px_4px_0_#111]'

function buildQueue(folderId: string) {
  const { unlockedFlashcardIds, savedFolders } = useAppStore.getState()
  return getAllFlashcards()
    .filter(
      (f) =>
        unlockedFlashcardIds.includes(f.id) &&
        (folderId === UNSORTED_FOLDER_ID
          ? savedFolders[f.id] === UNSORTED_FOLDER_ID
          : f.subjectId === folderId),
    )
    .map((f) => f.id)
}

// Chờ localStorage nạp xong rồi mới dựng hàng đợi thẻ (hàng đợi chỉ tính 1 lần khi mount).
export function StudyScreen({ folderId }: { folderId: string }) {
  const hydrated = useContentHydrated()
  return <StudyScreenInner key={hydrated ? 'ready' : 'loading'} folderId={folderId} />
}

function StudyScreenInner({ folderId }: { folderId: string }) {
  const reduceMotion = useReducedMotion()
  const masteredIds = useAppStore((s) => s.masteredFlashcardIds)
  const toggleMastered = useAppStore((s) => s.toggleMastered)

  const subject = ['micro', 'stats'].includes(folderId)
    ? getSubject(folderId as 'micro' | 'stats')
    : null

  const [queue, setQueue] = useState<string[]>(() => buildQueue(folderId))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [gotIt, setGotIt] = useState<string[]>([])
  const [learning, setLearning] = useState<string[]>([])

  const total = queue.length
  const done = total === 0 || index >= total
  const card = !done ? getFlashcard(queue[index]) : null
  const subjectName =
    folderId === UNSORTED_FOLDER_ID ? 'Chưa phân loại' : (subject?.name ?? 'Thư mục')

  useEffect(() => {
    if (done && total > 0) useAppStore.getState().completeDemoStep(8)
  }, [done, total])

  const answer = (known: boolean) => {
    if (!card) return
    const isMastered = masteredIds.includes(card.id)
    if (known && !isMastered) toggleMastered(card.id)
    if (!known && isMastered) toggleMastered(card.id)
    if (known) setGotIt((l) => [...l, card.id])
    else setLearning((l) => [...l, card.id])
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  const restart = (ids: string[]) => {
    setQueue(ids)
    setIndex(0)
    setFlipped(false)
    setGotIt([])
    setLearning([])
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-yellow sm:p-6">
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-cream px-5 pb-6 pt-4 sm:h-[min(844px,calc(100dvh-48px))] sm:w-[390px] sm:rounded-[40px] sm:border-[2.5px] sm:border-ink sm:shadow-hard">
        <header className="flex items-center justify-between">
          <Link
            href="/saved"
            aria-label="Đóng"
            className={`flex size-10 items-center justify-center rounded-xl border-[2.5px] border-ink bg-white ${hardShadow} outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple`}
          >
            <X aria-hidden className="size-5 text-ink" strokeWidth={3} />
          </Link>
          <span className="rounded-full border-[2.5px] border-ink bg-yellow px-4 py-1 text-sm font-extrabold uppercase text-ink">
            Ôn thẻ
          </span>
          <button
            type="button"
            aria-label="Tùy chọn"
            className="flex size-10 items-center justify-center rounded-xl border-[2.5px] border-ink bg-white outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
          >
            <MoreHorizontal aria-hidden className="size-5 text-ink" />
          </button>
        </header>

        {done ? (
          <Summary
            subjectName={subjectName}
            total={total}
            gotIt={gotIt.length}
            learning={learning}
            onRetry={() => restart(learning)}
            onRestart={() => restart(buildQueue(folderId))}
          />
        ) : card ? (
          <>
            <div className="mt-6">
              <div className="flex items-end justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-ink/50">
                  Tiến trình
                </span>
                <span className="text-lg font-extrabold text-ink">
                  {index + 1}/{total}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Tiến trình ôn thẻ"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={index + 1}
                className="mt-2 h-3 overflow-hidden rounded-full border-[2.5px] border-ink bg-ink/10"
              >
                <div
                  className="h-full bg-purple transition-[width] duration-300"
                  style={{ width: `${((index + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-6 flex min-h-0 flex-1 [perspective:1200px]">
              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                aria-label={flipped ? 'Chạm để quay lại' : 'Chạm để lật thẻ'}
                className="relative size-full rounded-3xl outline-none focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-purple"
              >
                <motion.div
                  className="relative size-full [transform-style:preserve-3d]"
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 220, damping: 22 }
                  }
                >
                  <CardFace
                    tag="Thuật ngữ"
                    tagIcon={<Type aria-hidden className="size-4" strokeWidth={3} />}
                    accent="bg-purple"
                    corner="bg-pink"
                    hint="Chạm để lật thẻ"
                    hidden={flipped}
                  >
                    <p className="px-4 text-center text-3xl font-extrabold leading-tight text-ink">
                      {card.term}
                    </p>
                    <span aria-hidden className="mt-3 h-1.5 w-16 rounded-full border-2 border-ink bg-purple" />
                  </CardFace>
                  <CardFace
                    back
                    tag="Định nghĩa"
                    tagIcon={<AlignLeft aria-hidden className="size-4" strokeWidth={3} />}
                    accent="bg-[#59B8FF]"
                    corner="bg-green"
                    hint="Chạm để quay lại"
                    hidden={!flipped}
                  >
                    <p className="text-sm text-ink/50">Định nghĩa</p>
                    <p className="mt-2 px-5 text-center text-lg font-bold leading-snug text-ink">
                      {card.definition}
                    </p>
                    <span aria-hidden className="mt-3 h-1.5 w-16 rounded-full border-2 border-ink bg-[#59B8FF]" />
                  </CardFace>
                </motion.div>
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3 text-xs text-ink/50">
              <span aria-hidden className="h-0.5 flex-1 bg-ink" />
              Bạn nhớ thẻ này đến đâu?
              <span aria-hidden className="h-0.5 flex-1 bg-ink" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => answer(false)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-[2.5px] border-ink bg-[#FF8FB5] px-2 text-sm font-extrabold text-ink shadow-[4px_4px_0_#111] outline-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
              >
                <RefreshCw aria-hidden className="size-5" strokeWidth={3} />
                Vẫn đang học
              </button>
              <button
                type="button"
                onClick={() => answer(true)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-[2.5px] border-ink bg-[#86DC9A] px-2 text-sm font-extrabold text-ink shadow-[4px_4px_0_#111] outline-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
              >
                <Check aria-hidden className="size-5" strokeWidth={3} />
                Đã hiểu
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function CardFace({
  back,
  tag,
  tagIcon,
  accent,
  corner,
  hint,
  hidden,
  children,
}: {
  back?: boolean
  tag: string
  tagIcon: React.ReactNode
  accent: string
  corner: string
  hint: string
  hidden: boolean
  children: React.ReactNode
}) {
  return (
    <div
      aria-hidden={hidden}
      className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl border-[2.5px] border-ink bg-butter/60 shadow-[6px_6px_0_#111] [backface-visibility:hidden]"
      style={{ transform: back ? 'rotateY(180deg)' : undefined }}
    >
      <span
        aria-hidden
        className={`absolute -right-6 -top-6 size-24 rounded-full border-[2.5px] border-ink ${accent}`}
      />
      <span
        aria-hidden
        className={`absolute -bottom-2 -left-6 bottom-16 size-14 rotate-12 rounded-xl border-[2.5px] border-ink ${corner}`}
      />
      <span
        className={`relative m-5 inline-flex w-fit items-center gap-2 rounded-full border-[2.5px] border-ink px-3 py-1 text-xs font-extrabold uppercase text-ink ${accent}`}
      >
        {tagIcon}
        {tag}
      </span>
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto">
        {children}
      </div>
      <span className="relative m-5 flex min-h-12 items-center justify-center gap-2 rounded-2xl border-[2.5px] border-ink bg-white text-sm font-bold text-ink">
        <Repeat aria-hidden className="size-5" />
        {hint}
      </span>
    </div>
  )
}

function Summary({
  subjectName,
  total,
  gotIt,
  learning,
  onRetry,
  onRestart,
}: {
  subjectName: string
  total: number
  gotIt: number
  learning: string[]
  onRetry: () => void
  onRestart: () => void
}) {
  if (total === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Chưa có thẻ nào</h1>
        <p className="text-sm text-ink/60">
          Hoàn thành quiz trong video để mở khóa thẻ ghi nhớ cho thư mục này.
        </p>
        <Link
          href="/saved"
          className="rounded-2xl border-[2.5px] border-ink bg-yellow px-6 py-3 font-extrabold text-ink shadow-[4px_4px_0_#111]"
        >
          Về thư viện
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
      <span className="flex size-20 rotate-6 items-center justify-center rounded-3xl border-[2.5px] border-ink bg-pink shadow-[4px_4px_0_#111]">
        <PartyPopper aria-hidden className="size-10 text-ink" />
      </span>
      <div>
        <h1 className="text-3xl font-extrabold leading-tight text-ink">Hoàn thành!</h1>
        <p className="mt-1 text-sm text-ink/60">{subjectName}</p>
      </div>
      <dl className="grid w-full grid-cols-2 gap-3">
        <div className="rounded-2xl border-[2.5px] border-ink bg-[#86DC9A] p-4 shadow-[4px_4px_0_#111]">
          <dt className="text-xs font-bold uppercase text-ink/70">Đã hiểu</dt>
          <dd className="text-3xl font-extrabold text-ink">
            {gotIt}/{total}
          </dd>
        </div>
        <div className="rounded-2xl border-[2.5px] border-ink bg-[#FF8FB5] p-4 shadow-[4px_4px_0_#111]">
          <dt className="text-xs font-bold uppercase text-ink/70">Vẫn đang học</dt>
          <dd className="text-3xl font-extrabold text-ink">
            {learning.length}/{total}
          </dd>
        </div>
      </dl>
      {learning.length > 0 ? (
        <ul className="w-full space-y-1 text-left text-sm text-ink/80">
          {learning.map((id) => (
            <li key={id} className="truncate">
              {'• '}
              {getFlashcard(id).term}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex w-full flex-col gap-3">
        {learning.length > 0 ? (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-12 rounded-2xl border-[2.5px] border-ink bg-yellow font-extrabold text-ink shadow-[4px_4px_0_#111] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
          >
            Ôn lại thẻ chưa nhớ
          </button>
        ) : (
          <button
            type="button"
            onClick={onRestart}
            className="min-h-12 rounded-2xl border-[2.5px] border-ink bg-yellow font-extrabold text-ink shadow-[4px_4px_0_#111] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
          >
            Ôn lại từ đầu
          </button>
        )}
        <Link
          href="/saved"
          className="flex min-h-12 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-white font-extrabold text-ink outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
        >
          Về thư viện
        </Link>
      </div>
    </div>
  )
}
