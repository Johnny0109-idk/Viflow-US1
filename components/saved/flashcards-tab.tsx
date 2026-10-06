'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  CalendarCheck,
  Folder,
  Inbox,
  Plus,
  TrendingUp,
} from 'lucide-react'
import { UNSORTED_FOLDER_ID, useAppStore } from '@/lib/store'
import { getAllFlashcards, getFlashcard, useContentSync } from '@/lib/content'
import { folderColors, subjects, type SubjectId } from '@/lib/mock-data'

const subjectIcons: Record<SubjectId, React.ReactNode> = {
  micro: <TrendingUp aria-hidden className="size-5" />,
  stats: <BarChart3 aria-hidden className="size-5" />,
}

const extraColors = ['#FF5A87', '#59B8FF', '#FF8A5B', '#FFCC1A']

interface FolderModel {
  id: string
  name: string
  color: string
  icon: React.ReactNode
  total: number
  mastered: number
}

export function FlashcardsTab() {
  useContentSync()
  const unlockedIds = useAppStore((s) => s.unlockedFlashcardIds)
  const masteredIds = useAppStore((s) => s.masteredFlashcardIds)
  const dueIds = useAppStore((s) => s.dueTodayFlashcardIds)
  const savedFolders = useAppStore((s) => s.savedFolders)
  const toggleMastered = useAppStore((s) => s.toggleMastered)

  const [customFolders, setCustomFolders] = useState<FolderModel[]>([])
  const [reviewIndex, setReviewIndex] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const subjectFolders: FolderModel[] = subjects.map((subject) => {
    const cards = getAllFlashcards().filter(
      (f) => f.subjectId === subject.id && unlockedIds.includes(f.id),
    )
    return {
      id: subject.id,
      name: subject.name,
      color: subject.color,
      icon: subjectIcons[subject.id],
      total: cards.length,
      mastered: cards.filter((f) => masteredIds.includes(f.id)).length,
    }
  })
  const unsortedCards = unlockedIds.filter(
    (id) => savedFolders[id] === UNSORTED_FOLDER_ID,
  )
  const unsortedFolders: FolderModel[] =
    unsortedCards.length > 0
      ? [
          {
            id: UNSORTED_FOLDER_ID,
            name: 'Chưa phân loại',
            color: folderColors.unsorted,
            icon: <Inbox aria-hidden className="size-5" />,
            total: unsortedCards.length,
            mastered: unsortedCards.filter((id) => masteredIds.includes(id))
              .length,
          },
        ]
      : []
  const folders = [...subjectFolders, ...unsortedFolders, ...customFolders]

  const addFolder = () => {
    const n = customFolders.length + 1
    setCustomFolders((prev) => [
      ...prev,
      {
        id: `custom-${n}`,
        name: `Thư mục mới ${n}`,
        color: extraColors[(n - 1) % extraColors.length] ?? folderColors.dueToday,
        icon: <Folder aria-hidden className="size-5" />,
        total: 0,
        mastered: 0,
      },
    ])
  }

  const reviewing = reviewIndex !== null ? dueIds[reviewIndex] : undefined
  const reviewCard = reviewing ? getFlashcard(reviewing) : null

  const next = () => {
    setRevealed(false)
    setReviewIndex((i) =>
      i !== null && i + 1 < dueIds.length ? i + 1 : null,
    )
  }

  return (
    <>
      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold leading-tight text-ink">
            Thư mục của tôi
          </h2>
          <p className="text-sm text-ink/50">Chọn một môn để bắt đầu</p>
        </div>
        <button
          type="button"
          onClick={addFolder}
          aria-label="Tạo thư mục mới"
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-yellow shadow-[3px_3px_0_#111] outline-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
        >
          <Plus aria-hidden className="size-6 text-ink" strokeWidth={3} />
        </button>
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">
        {folders.map((folder) => {
          const pct =
            folder.total === 0
              ? 0
              : Math.round((folder.mastered / folder.total) * 100)
          return (
            <li
              key={folder.id}
              className="relative overflow-hidden rounded-2xl border-[2.5px] border-ink bg-white shadow-[4px_4px_0_#111]"
            >
              <span
                aria-hidden
                className="block h-2 w-full"
                style={{ backgroundColor: folder.color }}
              />
              <div className="flex flex-col gap-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="flex size-9 items-center justify-center rounded-lg border-2 border-ink text-ink"
                    style={{ backgroundColor: folder.color }}
                  >
                    {folder.icon}
                  </span>
                  <span className="text-xs text-ink/50">
                    {folder.total} thẻ
                  </span>
                </div>
                <p className="text-base font-extrabold leading-tight text-ink">
                  {folder.total > 0 ? (
                    <Link
                      href={`/study/${folder.id}`}
                      className="outline-none after:absolute after:inset-0 focus-visible:after:outline focus-visible:after:outline-[3px] focus-visible:after:outline-purple"
                    >
                      {folder.name}
                    </Link>
                  ) : (
                    folder.name
                  )}
                </p>
                <div
                  role="progressbar"
                  aria-label={`Đã nắm vững ${folder.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  className="h-2.5 overflow-hidden rounded-full border-2 border-ink bg-ink/10"
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: folder.color }}
                  />
                </div>
                <p className="text-xs text-ink/50">
                  {folder.mastered} đã nắm vững
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      <section
        aria-label="Đến hạn hôm nay"
        className="mt-5 rounded-3xl border-[2.5px] border-ink bg-purple p-4 shadow-[5px_5px_0_#111]"
      >
        {reviewCard ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold uppercase text-ink/70">
              Thẻ {(reviewIndex ?? 0) + 1}/{dueIds.length}
            </p>
            <p className="text-lg font-extrabold leading-tight text-ink">
              {reviewCard.term}
            </p>
            {revealed ? (
              <p className="rounded-xl border-2 border-ink bg-cream p-3 text-sm text-ink">
                {reviewCard.definition}
              </p>
            ) : null}
            <div className="flex gap-2">
              {revealed ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (!masteredIds.includes(reviewCard.id)) {
                        toggleMastered(reviewCard.id)
                      }
                      next()
                    }}
                    className="min-h-10 flex-1 rounded-xl border-2 border-ink bg-yellow px-3 text-sm font-extrabold text-ink shadow-[2px_2px_0_#111] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    Đã nắm vững
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="min-h-10 flex-1 rounded-xl border-2 border-ink bg-white px-3 text-sm font-extrabold text-ink outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    Ôn lại sau
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="min-h-10 flex-1 rounded-xl border-2 border-ink bg-yellow px-3 text-sm font-extrabold text-ink shadow-[2px_2px_0_#111] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Hiện đáp án
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="flex size-16 shrink-0 -rotate-6 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-cream"
            >
              <CalendarCheck className="size-8 text-ink" />
            </span>
            <div className="flex min-w-0 flex-col items-start gap-1">
              <h2 className="text-xl font-extrabold leading-tight text-ink">
                Đến hạn hôm nay
              </h2>
              <p className="text-sm text-ink/80">
                {dueIds.length} thẻ cần ôn tập
              </p>
              <button
                type="button"
                disabled={dueIds.length === 0}
                onClick={() => {
                  setRevealed(false)
                  setReviewIndex(0)
                }}
                className="mt-1 min-h-8 rounded-lg border-2 border-ink bg-yellow px-4 text-sm font-bold text-ink outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50"
              >
                Bắt đầu
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
