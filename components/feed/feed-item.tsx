'use client'

import { useEffect, useRef, useState } from 'react'
import { BookOpen, Bookmark, Heart, Layers, Lock, Share2 } from 'lucide-react'
import { Badge } from '@/components/na/badge'
import { Button } from '@/components/na/button'
import { IconButton } from '@/components/na/icon-button'
import { RoadmapChip } from '@/components/feed/roadmap-chip'
import { Scrubber } from '@/components/feed/scrubber'
import { VideoPlaceholder } from '@/components/feed/video-placeholder'
import { formatCount } from '@/lib/format'
import { getLecturerOf, getVideo, useContentSync } from '@/lib/content'
import { useAppStore } from '@/lib/store'

const TICK_MS = 100

interface FeedItemProps {
  videoId: string
  active: boolean
  onToast: (message: string) => void
  onOpenQuiz: (videoId: string) => void
}

export function FeedItem({ videoId, active, onToast, onOpenQuiz }: FeedItemProps) {
  useContentSync()
  const video = getVideo(videoId)
  const lecturer = getLecturerOf(video)
  const duration = video.durationSec

  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const quizTriggered = useRef(false)

  const voted = useAppStore((s) => s.votedLecturerIds.includes(lecturer.id))
  const following = useAppStore((s) => s.followedLecturerIds.includes(lecturer.id))
  const savedFolders = useAppStore((s) => s.savedFolders)
  const unlockedIds = useAppStore((s) => s.unlockedFlashcardIds)
  const toggleVote = useAppStore((s) => s.toggleVote)
  const toggleFollow = useAppStore((s) => s.toggleFollow)
  const saveFlashcards = useAppStore((s) => s.saveFlashcards)
  const unsaveFlashcards = useAppStore((s) => s.unsaveFlashcards)

  const hasCards = video.flashcardIds.length > 0
  const saved = hasCards && video.flashcardIds.every((id) => id in savedFolders)
  const unlockedCount = video.flashcardIds.filter((id) => unlockedIds.includes(id)).length
  const locked = unlockedCount === 0

  useEffect(() => {
    setPlaying(active)
    if (!active) setElapsed(0)
  }, [active])

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + TICK_MS / 1000
        if (next >= duration) {
          setPlaying(false)
          return duration
        }
        return next
      })
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [playing, duration])

  useEffect(() => {
    if (elapsed < duration) {
      quizTriggered.current = false
      return
    }
    if (active && !quizTriggered.current) {
      quizTriggered.current = true
      onOpenQuiz(videoId)
    }
  }, [elapsed, duration, active, videoId, onOpenQuiz])

  const togglePlay = () => {
    if (!playing && elapsed >= duration) setElapsed(0)
    setPlaying((p) => !p)
  }

  const handleSave = () => {
    if (!hasCards) {
      onToast('Video này chưa có thẻ ghi nhớ để lưu')
      return
    }
    if (saved) {
      unsaveFlashcards(video.flashcardIds)
      onToast('Removed from Saved')
    } else {
      saveFlashcards(video.flashcardIds)
      onToast(
        locked
          ? 'Đã lưu. Thẻ sẽ hiện trong tab Đã lưu sau khi bạn hoàn thành quiz'
          : 'Saved to Unsorted',
      )
    }
  }

  const handleFlashcards = () =>
    onToast(
      locked
        ? 'Finish the quiz to unlock these flashcards'
        : `${unlockedCount} flashcards unlocked`,
    )

  const handleSkipToQuiz = () => {
    setPlaying(false)
    quizTriggered.current = true
    setElapsed(duration)
    onOpenQuiz(videoId)
  }

  return (
    <div className="absolute inset-0">
      <VideoPlaceholder
        color={video.posterColor}
        concept={video.concept}
        playing={playing}
        onToggle={togglePlay}
      />

      <div className="absolute inset-x-4 top-4 flex flex-col items-end gap-3">
        <div className="w-full">
          <RoadmapChip video={video} />
        </div>
        <Button tone="ink" size="sm" onClick={handleSkipToQuiz}>
          Skip to quiz (demo)
        </Button>
      </div>

      <div className="absolute right-3 bottom-12 flex flex-col items-center gap-3">
        <IconButton
          label={voted ? 'Remove vote for this lecturer' : 'Vote for this lecturer'}
          aria-pressed={voted}
          onClick={() => toggleVote(lecturer.id)}
          icon={<Heart className={voted ? 'fill-ink' : ''} aria-hidden />}
          caption={formatCount(lecturer.votes + (voted ? 1 : 0))}
        />
        <IconButton
          label={saved ? 'Remove from saved' : 'Save flashcards'}
          aria-pressed={saved}
          pressedTone="yellow"
          onClick={handleSave}
          icon={<Bookmark className={saved ? 'fill-ink' : ''} aria-hidden />}
          caption="Save"
        />
        <IconButton
          label={locked ? 'Flashcards locked' : 'Flashcards unlocked'}
          onClick={handleFlashcards}
          icon={<Layers aria-hidden />}
          caption={
            <>
              {locked && <Lock aria-hidden className="size-3" />}
              Cards
            </>
          }
        />
        <IconButton
          label="Share"
          onClick={() => onToast('Link copied (demo)')}
          icon={<Share2 aria-hidden />}
          caption="Share"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-5 bottom-14 flex flex-col items-start gap-2.5 pr-[76px]">
        <div className="flex w-full items-center gap-2">
          <span
            aria-hidden
            className="size-11 shrink-0 rounded-full border-[2.5px] border-ink"
            style={{ backgroundColor: lecturer.avatarColor }}
          />
          <Badge className="min-w-0 py-2 text-sm">
            <span className="truncate">{lecturer.name}</span>
          </Badge>
        </div>
        <Button
          tone={following ? 'cream' : 'yellow'}
          size="sm"
          aria-pressed={following}
          className="pointer-events-auto"
          onClick={() => toggleFollow(lecturer.id)}
        >
          {following ? 'Following' : 'Follow'}
        </Button>
        <h2 className="rounded-xl border-[2.5px] border-ink bg-cream px-3 py-2 text-lg leading-tight font-extrabold text-ink">
          {video.title}
        </h2>
        <Badge outlined className="py-1.5 text-sm">
          <BookOpen aria-hidden className="size-4" />
          {video.concept}
        </Badge>
      </div>

      <div className="absolute inset-x-5 bottom-3">
        <Scrubber elapsed={elapsed} duration={duration} onSeek={setElapsed} />
      </div>
    </div>
  )
}
