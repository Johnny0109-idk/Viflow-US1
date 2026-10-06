'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FeedItem } from '@/components/feed/feed-item'
import { FlashcardUnlocked } from '@/components/quiz/flashcard-unlocked'
import { QuizSheet } from '@/components/quiz/quiz-sheet'
import { getFeedIds, useFeedIds } from '@/lib/content'
import { useAppStore } from '@/lib/store'

export function Feed({ initialVideoId }: { initialVideoId?: string }) {
  const resetCount = useAppStore((s) => s.resetCount)
  return <FeedInner key={resetCount} initialVideoId={initialVideoId} />
}

function FeedInner({ initialVideoId }: { initialVideoId?: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const feedIds = useFeedIds()
  const initialIndex = Math.max(0, feedIds.indexOf(initialVideoId ?? ''))
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  useEffect(() => {
    if (initialIndex === 0) return
    scrollerRef.current
      ?.querySelector<HTMLElement>(`[data-index="${initialIndex}"]`)
      ?.scrollIntoView({ behavior: 'instant' })
  }, [initialIndex])
  const [toast, setToast] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<{ videoId: string; run: number } | null>(null)

  const openQuiz = useCallback(
    (videoId: string) => {
      useAppStore.getState().completeDemoStep(1)
      setQuiz((q) => ({ videoId, run: (q?.run ?? 0) + 1 }))
    },
    [],
  )
  const closeQuiz = useCallback(() => setQuiz(null), [])
  const [reward, setReward] = useState<string | null>(null)

  const completeQuiz = useCallback(() => {
    setQuiz((q) => {
      if (q) setReward(q.videoId)
      return null
    })
  }, [])

  const keepWatching = useCallback(() => {
    setReward((videoId) => {
      if (videoId) {
        const next = getFeedIds().indexOf(videoId) + 1
        scrollerRef.current
          ?.querySelector<HTMLElement>(`[data-index="${next}"]`)
          ?.scrollIntoView({ behavior: 'smooth' })
      }
      return null
    })
  }, [])

  useEffect(() => {
    const root = scrollerRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveIndex(Number((entry.target as HTMLElement).dataset.index))
          }
        })
      },
      { root, threshold: 0.6 },
    )
    root.querySelectorAll('[data-index]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
    // Quan sát lại khi số video trong feed thay đổi (video cộng đồng nạp xong/mới đăng)
  }, [feedIds.length])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  const showToast = useCallback((message: string) => setToast(message), [])

  return (
    <div className="relative h-full">
      <div
        ref={scrollerRef}
        className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
      >
        {feedIds.map((id, index) => (
          <section
            key={id}
            data-index={index}
            aria-label={`Video ${index + 1} of ${feedIds.length}`}
            className="relative h-full snap-start snap-always"
          >
            <FeedItem
              videoId={id}
              active={index === activeIndex}
              onToast={showToast}
              onOpenQuiz={openQuiz}
            />
          </section>
        ))}
      </div>

      {quiz && (
        <QuizSheet
          key={quiz.run}
          videoId={quiz.videoId}
          onClose={closeQuiz}
          onComplete={completeQuiz}
        />
      )}

      {reward && (
        <FlashcardUnlocked
          videoId={reward}
          onKeepWatching={keepWatching}
          onSaved={(name) => showToast(`Đã lưu vào ${name}`)}
        />
      )}

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center px-6"
      >
        {toast && (
          <p className="rounded-2xl border-[2.5px] border-ink bg-cream px-4 py-3 text-center text-sm font-bold text-ink shadow-hard-sm">
            {toast}
          </p>
        )}
      </div>
    </div>
  )
}
