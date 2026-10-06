import Link from 'next/link'
import { Route } from 'lucide-react'
import { SegmentedProgress } from '@/components/na/segmented-progress'
import { getRoadmap } from '@/lib/content'
import type { Video } from '@/lib/mock-data'

export function getRoadmapPosition(video: Video) {
  const chapters = getRoadmap(video.subjectId)
  // Ưu tiên chương thực sự chứa video này (kể cả "Góc nhìn khác"), rồi mới tìm theo tên chương
  const chapter =
    chapters.find((c) => c.concepts.some((x) => x.videoId === video.id)) ??
    chapters.find((c) => c.title === video.chapter)
  const total = chapter?.concepts.length ?? 1
  const index = chapter?.concepts.findIndex((c) => c.videoId === video.id) ?? 0
  return { total, current: Math.max(index, 0) + 1 }
}

export function RoadmapChip({ video }: { video: Video }) {
  const { total, current } = getRoadmapPosition(video)

  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/roadmap"
        className="flex flex-col gap-1 rounded-3xl border-[2.5px] border-ink bg-cream px-4 py-3 text-ink shadow-hard-sm outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <Route aria-hidden className="size-4" />
          Course roadmap
        </span>
        <span className="truncate text-sm font-semibold text-ink/80">
          {video.chapter} &gt; {video.concept} {current}/{total}
        </span>
      </Link>
      <SegmentedProgress
        total={total}
        value={current}
        label="Concepts in this chapter"
      />
    </div>
  )
}
