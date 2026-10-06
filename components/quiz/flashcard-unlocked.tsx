'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BookOpen, Check, FolderPlus, Lock, LockOpen, PartyPopper, Play, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/na/button'
import { getFlashcardsForVideo, getVideo } from '@/lib/content'
import { folderColors, subjects } from '@/lib/mock-data'
import { UNSORTED_FOLDER_ID, useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export const FLASHCARD_XP = 20

const CONFETTI = [
  { className: 'left-[7%] top-[14%] size-5 rounded-full border-[2.5px] border-ink bg-[#7BC8FF]', rotate: 0 },
  { className: 'left-[12%] top-[52%] h-1.5 w-12 rounded-full bg-ink', rotate: -18 },
  { className: 'right-[8%] top-[30%] size-5 border-[2.5px] border-ink bg-green', rotate: 14 },
  { className: 'right-[6%] top-[62%] h-1.5 w-12 rounded-full bg-ink', rotate: 24 },
]

function FolderSheet({
  onPick,
  onClose,
}: {
  onPick: (folderId: string) => void
  onClose: () => void
}) {
  const options = [
    ...subjects.map((s) => ({ id: s.id as string, name: s.name, color: s.color })),
    { id: UNSORTED_FOLDER_ID, name: 'Chưa phân loại', color: folderColors.unsorted },
  ]

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col justify-end rounded-[36px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 rounded-[36px] bg-ink/50"
      />
      <motion.div
        role="dialog"
        aria-label="Chọn thư mục"
        className="relative flex flex-col gap-3 rounded-[28px] border-[2.5px] border-ink bg-[#FDF6E3] p-4"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-ink">Lưu vào thư mục</h3>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full border-2 border-ink bg-white"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
        <ul className="flex flex-col gap-2.5">
          {options.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => onPick(o.id)}
                className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl border-[2.5px] border-ink bg-white px-3 text-left text-base font-medium text-ink outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
              >
                <span
                  className="flex size-9 items-center justify-center rounded-lg border-2 border-ink"
                  style={{ backgroundColor: o.color }}
                >
                  <FolderPlus aria-hidden className="size-4" />
                </span>
                {o.name}
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  )
}

interface FlashcardUnlockedProps {
  videoId: string
  onKeepWatching: () => void
  onSaved: (folderName: string) => void
}

export function FlashcardUnlocked({ videoId, onKeepWatching, onSaved }: FlashcardUnlockedProps) {
  const reduce = useReducedMotion()
  const video = getVideo(videoId)
  const cards = getFlashcardsForVideo(videoId)
  const first = cards[0]
  const saveFlashcards = useAppStore((s) => s.saveFlashcards)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [savedTo, setSavedTo] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState(Boolean(reduce))
  const [navHeight, setNavHeight] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('nav[aria-label="Main"]')
    setNavHeight(nav?.offsetHeight ?? 0)
    dialogRef.current?.focus()
    useAppStore.getState().completeDemoStep(4)
  }, [])

  useEffect(() => {
    if (reduce) return
    const t = setTimeout(() => setUnlocked(true), 650)
    return () => clearTimeout(t)
  }, [reduce])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (sheetOpen) setSheetOpen(false)
      else onKeepWatching()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheetOpen, onKeepWatching])

  const pickFolder = (folderId: string) => {
    saveFlashcards(
      cards.map((c) => c.id),
      folderId,
    )
    const name =
      subjects.find((s) => s.id === folderId)?.name ?? 'Chưa phân loại'
    useAppStore.getState().completeDemoStep(5)
    setSavedTo(name)
    setSheetOpen(false)
    onSaved(name)
  }

  const spring = { type: 'spring' as const, stiffness: 220, damping: 18 }

  return (
    <motion.div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Đã mở khóa thẻ ghi nhớ"
      className="absolute inset-x-0 top-0 z-50 flex items-center justify-center px-[22px] outline-none"
      style={{ bottom: -navHeight, paddingBottom: navHeight }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div aria-hidden className="absolute inset-0 bg-ink/70 backdrop-blur-sm" />

      <motion.section
        className="relative flex w-full flex-col gap-3.5 rounded-[36px] border-[2.5px] border-ink bg-[#FDF6E3] p-[18px] shadow-[4px_4px_0_#111]"
        initial={reduce ? false : { scale: 0.9, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 rounded-full border-[2.5px] border-ink bg-[#FFD6E6] px-3 py-1.5 text-xs font-medium tracking-wide text-ink uppercase">
            <PartyPopper aria-hidden className="size-4" />
            Phần thưởng mới
          </span>
          <motion.span
            className="flex rotate-3 items-center gap-1.5 rounded-full border-[2.5px] border-ink bg-green px-3 py-1.5 text-sm font-medium text-ink"
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...spring, delay: 0.9 }}
          >
            <Sparkles aria-hidden className="size-4" />+{FLASHCARD_XP} XP
          </motion.span>
        </div>

        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-[32px] leading-tight font-medium text-ink text-balance">
            Đã mở khóa thẻ ghi nhớ!
          </h2>
          <p className="text-base text-ink/60 text-pretty">
            Một kiến thức mới đã sẵn sàng để bạn ôn tập.
          </p>
        </div>

        <div
          aria-hidden
          className="relative h-[176px] overflow-hidden rounded-3xl border-[2.5px] border-ink bg-[#FFEDA8] [perspective:800px]"
        >
          {CONFETTI.map((c, i) => (
            <motion.span
              key={i}
              className={cn('absolute', c.className)}
              style={{ rotate: c.rotate }}
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...spring, delay: 0.5 + i * 0.1 }}
            />
          ))}

          <div className="absolute top-[22%] left-1/2 h-[96px] w-[120px] -translate-x-[52%] rotate-[8deg] rounded-2xl border-[2.5px] border-ink bg-[#7BC8FF]" />

          <motion.div
            className="absolute top-[8%] left-1/2 flex h-[100px] w-[132px] -translate-x-[46%] flex-col justify-between rounded-2xl border-[2.5px] border-ink bg-pink p-2.5 shadow-[2px_2px_0_#111]"
            style={{ transformStyle: 'preserve-3d' }}
            initial={reduce ? false : { y: 70, rotateY: -180, rotate: 0, scale: 0.6, opacity: 0 }}
            animate={{ y: 0, rotateY: 0, rotate: -6, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.25 }}
          >
            <span className="text-[10px] font-medium tracking-wider text-ink/80 uppercase">Flashcard</span>
            <span className="text-base leading-tight font-medium text-ink">{first.term}</span>
          </motion.div>

          <motion.div
            className="absolute bottom-3 left-1/2 flex size-[58px] -translate-x-1/2 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-green shadow-[2px_2px_0_#111]"
            animate={unlocked && !reduce ? { rotate: [0, -12, 8, 0] } : undefined}
            transition={{ duration: 0.5 }}
          >
            {unlocked ? <LockOpen className="size-7" /> : <Lock className="size-7" />}
          </motion.div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border-[2.5px] border-ink bg-white p-2.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border-[2.5px] border-ink bg-pink">
            <BookOpen aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs tracking-wide text-ink/60 uppercase">Bản xem trước</p>
            <p className="truncate text-base font-medium text-ink">Thuật ngữ: {first.term}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <Button
            tone="yellow"
            size="sm"
            className="min-h-[50px] w-full text-lg font-medium"
            onClick={() => setSheetOpen(true)}
          >
            {savedTo ? (
              <>
                <Check aria-hidden className="size-5" />
                Đã lưu vào {savedTo}
              </>
            ) : (
              <>
                <FolderPlus aria-hidden className="size-5" />
                Lưu vào thư mục
              </>
            )}
          </Button>
          <Button
            tone="cream"
            size="sm"
            className="min-h-[50px] w-full bg-white text-lg font-medium"
            onClick={onKeepWatching}
          >
            <Play aria-hidden className="size-5" />
            Tiếp tục xem
          </Button>
        </div>

        <p className="sr-only">{video.title}</p>

        <AnimatePresence>
          {sheetOpen && <FolderSheet onPick={pickFolder} onClose={() => setSheetOpen(false)} />}
        </AnimatePresence>
      </motion.section>
    </motion.div>
  )
}
