'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, Lock, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { getVideo, isVideoCompleted, useRoadmap } from '@/lib/content'
import { subjects, type RoadmapConcept, type SubjectId } from '@/lib/mock-data'

type Status = 'completed' | 'current' | 'next' | 'locked'

const statusLabel: Record<Status, string> = {
  completed: 'Hoàn thành',
  current: 'Đang học',
  next: 'Sắp tới',
  locked: 'Sắp ra mắt',
}

export function RoadmapScreen() {
  const [subjectId, setSubjectId] = useState<SubjectId>('micro')
  const answers = useAppStore((s) => s.answers)

  const chapters = useRoadmap(subjectId)

  const isCompleted = (videoId: string) =>
    isVideoCompleted(getVideo(videoId), answers)

  const firstNewVideoId = chapters
    .flatMap((c) => c.concepts)
    .find((c) => c.videoId && !isCompleted(c.videoId))?.videoId

  const statusOf = (concept: RoadmapConcept): Status => {
    if (!concept.videoId) return 'locked'
    if (isCompleted(concept.videoId)) return 'completed'
    return concept.videoId === firstNewVideoId ? 'current' : 'next'
  }

  const subject = subjects.find((s) => s.id === subjectId)!

  return (
    <div className="h-full overflow-y-auto bg-cream px-5 pt-4 pb-6">
      <header>
        <h1 className="text-balance text-[28px] font-extrabold leading-tight text-ink">
          Lộ trình học
        </h1>
        <p className="text-sm text-ink/50">Đi từng khái niệm, từng video một.</p>
      </header>

      <div
        role="tablist"
        aria-label="Môn học"
        className="mt-4 flex gap-1 rounded-full border-[2.5px] border-ink bg-white p-1"
      >
        {subjects.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={subjectId === s.id}
            onClick={() => setSubjectId(s.id)}
            className={cn(
              'min-h-10 flex-1 rounded-full px-2 text-sm font-extrabold text-ink outline-none transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-purple',
              subjectId === s.id ? 'bg-yellow shadow-[2px_2px_0_#111]' : 'text-ink/60',
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-6">
        {chapters.map((chapter) => (
          <section key={chapter.id} aria-labelledby={chapter.id}>
            <h2
              id={chapter.id}
              className="flex items-center gap-2 text-base font-extrabold text-ink"
            >
              <span
                aria-hidden
                className="size-3 rounded-full border-2 border-ink"
                style={{ backgroundColor: subject.color }}
              />
              {chapter.title}
            </h2>
            <ul className="mt-3 flex flex-col gap-3">
              {chapter.concepts.map((concept) => {
                const status = statusOf(concept)
                return (
                  <li key={concept.id}>
                    <ConceptCard
                      concept={concept}
                      status={status}
                      color={subject.color}
                    />
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function ConceptCard({
  concept,
  status,
  color,
}: {
  concept: RoadmapConcept
  status: Status
  color: string
}) {
  const locked = status === 'locked'

  const body = (
    <>
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-xl border-[2.5px] border-ink"
        style={{
          backgroundColor:
            status === 'completed' ? color : status === 'current' ? '#FFCC1A' : '#fff',
        }}
      >
        {status === 'completed' ? (
          <Check className="size-5 text-ink" strokeWidth={3} />
        ) : locked ? (
          <Lock className="size-5 text-ink/40" />
        ) : (
          <Play className="size-5 fill-ink text-ink" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            'text-pretty text-[15px] font-extrabold leading-snug',
            locked ? 'text-ink/40' : 'text-ink',
          )}
        >
          {concept.title}
        </span>
        <span
          className={cn(
            'mt-1 w-fit rounded-full border-2 px-2 py-0.5 text-[11px] font-extrabold',
            status === 'current'
              ? 'border-ink bg-purple text-white'
              : status === 'completed'
                ? 'border-ink bg-white text-ink'
                : 'border-ink/20 text-ink/50',
          )}
        >
          {statusLabel[status]}
        </span>
      </span>
      {!locked && <ChevronRight aria-hidden className="size-5 shrink-0 text-ink" />}
    </>
  )

  const base =
    'flex items-center gap-3 rounded-2xl border-[2.5px] p-3 outline-none'

  if (locked) {
    return (
      <div
        aria-disabled="true"
        className={cn(base, 'border-ink/25 bg-white/60')}
      >
        {body}
      </div>
    )
  }

  return (
    <Link
      href={`/?v=${concept.videoId}`}
      className={cn(
        base,
        'border-ink bg-white shadow-hard-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple',
        status === 'current' && 'bg-butter',
      )}
    >
      {body}
    </Link>
  )
}
