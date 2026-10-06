'use client'

import { useMemo, useState } from 'react'
import {
  BarChart3,
  ChevronDown,
  Inbox,
  RotateCcw,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UNSORTED_FOLDER_ID, useAppStore } from '@/lib/store'
import { getAllFlashcards, getQuiz, getVideo, useContentSync } from '@/lib/content'
import {
  APP_NAME,
  folderColors,
  profile,
  subjects,
  type SubjectId,
} from '@/lib/mock-data'
import { SavedFolderTile } from '@/components/saved/saved-folder-tile'
import { FlashcardsTab } from '@/components/saved/flashcards-tab'

type Tab = 'questions' | 'flashcards'

const subjectIcons: Record<SubjectId, React.ReactNode> = {
  micro: <TrendingUp />,
  stats: <BarChart3 />,
}

interface FolderModel {
  id: string
  name: string
  color: string
  icon: React.ReactNode
  countLabel: string
  detailLabel: string
  isNew: boolean
}

function percent(correct: number, total: number) {
  return total === 0 ? 0 : Math.round((correct / total) * 100)
}

export function SavedScreen() {
  const content = useContentSync()
  const [tab, setTab] = useState<Tab>('questions')
  const [query, setQuery] = useState('')

  const answers = useAppStore((s) => s.answers)
  const sessionIds = useAppStore((s) => s.sessionAnsweredQuizIds)
  const savedFolders = useAppStore((s) => s.savedFolders)
  const unlockedIds = useAppStore((s) => s.unlockedFlashcardIds)

  const questionFolders = useMemo<FolderModel[]>(() => {
    const records = Object.values(answers).map((record) => ({
      record,
      subjectId: getVideo(getQuiz(record.quizId).videoId).subjectId,
      inSession: sessionIds.includes(record.quizId),
    }))

    const build = (
      id: string,
      name: string,
      color: string,
      icon: React.ReactNode,
      list: typeof records,
    ): FolderModel => ({
      id,
      name,
      color,
      icon,
      countLabel: `${list.length} câu hỏi`,
      detailLabel: `${percent(
        list.filter((r) => r.record.isCorrect).length,
        list.length,
      )}% chính xác`,
      isNew: list.some((r) => r.inSession),
    })

    return [
      ...subjects.map((subject) =>
        build(
          subject.id,
          subject.name,
          subject.color,
          subjectIcons[subject.id],
          records.filter((r) => r.subjectId === subject.id),
        ),
      ),
      build(
        'wrong',
        'Câu trả lời sai',
        folderColors.wrong,
        <RotateCcw />,
        records.filter((r) => !r.record.isCorrect),
      ),
      build(
        UNSORTED_FOLDER_ID,
        'Chưa phân loại',
        folderColors.unsorted,
        <Inbox />,
        records.filter((r) => r.inSession),
      ),
    ]
  }, [answers, sessionIds, content.userQuizzes, content.userVideos])

  const flashcardFolders = useMemo<FolderModel[]>(() => {
    const unlocked = getAllFlashcards().filter((f) => unlockedIds.includes(f.id))
    const savedIn = (folderId: string) =>
      Object.values(savedFolders).filter((v) => v === folderId).length

    return [
      ...subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        color: subject.color,
        icon: subjectIcons[subject.id],
        countLabel: `${unlocked.filter((f) => f.subjectId === subject.id).length} thẻ`,
        detailLabel: `${savedIn(subject.id)} đã lưu`,
        isNew: false,
      })),
      {
        id: UNSORTED_FOLDER_ID,
        name: 'Chưa phân loại',
        color: folderColors.unsorted,
        icon: <Inbox />,
        countLabel: `${savedIn(UNSORTED_FOLDER_ID)} thẻ`,
        detailLabel: 'Chưa có thư mục',
        isNew: false,
      },
    ]
  }, [savedFolders, unlockedIds, content.userFlashcards])

  const source = tab === 'questions' ? questionFolders : flashcardFolders
  const visible = source.filter((f) =>
    f.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <div className="h-full overflow-y-auto bg-cream px-5 pt-4 pb-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 items-center justify-center rounded-xl bg-ink text-xs font-extrabold text-cream"
          >
            {APP_NAME}
          </span>
          <span className="text-lg font-extrabold text-ink">
            {profile.name}
          </span>
        </div>
        <h1 className="mt-1 text-balance text-[28px] font-extrabold leading-tight text-ink">
          {tab === 'questions' ? 'Ôn tập bất kỳ lúc nào.' : 'Học tập thông minh.'}
        </h1>
        <p className="text-sm text-ink/50">
          {tab === 'questions'
            ? 'Câu hỏi và thẻ ghi nhớ bạn đã lưu, gom theo môn học.'
            : 'Thẻ ghi nhớ đã mở khóa, gom theo môn học.'}
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Loại nội dung đã lưu"
        className="mt-4 flex gap-1 rounded-full border-[2.5px] border-ink bg-white p-1"
      >
        {(
          [
            ['questions', 'Câu hỏi'],
            ['flashcards', 'Thẻ ghi nhớ'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'min-h-10 flex-1 rounded-full text-sm font-extrabold text-ink outline-none transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-purple',
              tab === id ? 'bg-yellow shadow-[2px_2px_0_#111]' : 'text-ink/60',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'flashcards' ? <FlashcardsTab /> : null}

      <div hidden={tab === 'flashcards'} className="mt-4 flex items-center gap-3">
        <label className="flex min-h-12 flex-1 items-center gap-2 rounded-2xl border-[2.5px] border-ink bg-white px-3 shadow-[3px_3px_0_#111] focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-purple">
          <Search aria-hidden className="size-5 shrink-0 text-ink/50" />
          <span className="sr-only">Tìm trong mục đã lưu</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              tab === 'questions'
                ? 'Tìm trong câu hỏi đã lưu'
                : 'Tìm trong thẻ đã lưu'
            }
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
          />
        </label>
        <button
          type="button"
          aria-label="Bộ lọc"
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-yellow shadow-[3px_3px_0_#111] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
        >
          <SlidersHorizontal aria-hidden className="size-5 text-ink" />
        </button>
      </div>

      <div
        hidden={tab === 'flashcards'}
        className="mt-5 flex items-center justify-between"
      >
        <h2 className="text-lg font-extrabold text-ink">Bộ sưu tập của tôi</h2>
        <span className="flex items-center gap-1 text-sm font-bold text-ink/50">
          {visible.length} thư mục
          <ChevronDown aria-hidden className="size-4" />
        </span>
      </div>

      <ul
        hidden={tab === 'flashcards'}
        className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3"
      >
        {visible.map((folder) => (
          <SavedFolderTile
            key={folder.id}
            href={tab === 'questions' ? `/saved/${folder.id}` : undefined}
            name={folder.name}
            color={folder.color}
            icon={folder.icon}
            countLabel={folder.countLabel}
            detailLabel={folder.detailLabel}
            isNew={folder.isNew}
          />
        ))}
      </ul>
      {tab === 'questions' && visible.length === 0 ? (
        <p className="mt-6 text-center text-sm text-ink/50">
          Không tìm thấy thư mục nào.
        </p>
      ) : null}
    </div>
  )
}
