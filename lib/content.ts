// /lib/content.ts
// LỚP DỮ LIỆU HỢP NHẤT: seed (mock-data.ts) + nội dung người dùng (content-store.ts).
// Mọi màn hình đọc video/quiz/flashcard/feed/roadmap QUA FILE NÀY,
// không import getVideo/videos/flashcards/roadmaps trực tiếp từ mock-data nữa.
//
// Cách dùng trong component:
//   1) Gọi useContentSync() (hoặc useFeedIds / useRoadmap) ở đầu component
//      để component tự render lại khi nội dung người dùng thay đổi / vừa nạp xong.
//   2) Gọi getVideo(id), getQuiz(id)... như cũ.

import { useMemo } from 'react'
import {
  feedOrder as seedFeedOrder,
  flashcards as seedFlashcards,
  lecturers,
  quizzes as seedQuizzes,
  roadmaps as seedRoadmaps,
  subjects,
  videos as seedVideos,
  type Flashcard,
  type Lecturer,
  type Quiz,
  type RoadmapChapter,
  type RoadmapConcept,
  type SubjectId,
  type Video,
} from '@/lib/mock-data'
import {
  useContentStore,
  type UserVideo,
  type VideoStatus,
} from '@/lib/content-store'
import type { AnswerRecord } from '@/lib/store'

export type { VideoStatus } from '@/lib/content-store'

// ------------------------------------------------------------------- Types
export type VideoSource = 'seed' | 'user'

/** Video hợp nhất: có đủ field của seed + field cho video cộng đồng. */
export interface ContentVideo extends Video {
  source: VideoSource
  status: VideoStatus // seed luôn là 'live'
  votes: number
  mediaKey?: string
  uploaderName?: string
  conceptId?: string
  createdAt?: number
  posterDataUrl?: string
}

export interface ContentConcept extends RoadmapConcept {
  community?: boolean // true nếu là video cộng đồng đã được promote
}
export interface ContentChapter {
  id: string
  title: string
  concepts: ContentConcept[]
}

export const ALT_CHAPTER_TITLE = 'Góc nhìn khác'
const COMMUNITY_POSTER_COLOR = '#BFE3FF'

// ------------------------------------------------------------------- Videos
const SEED_VIDEOS: ContentVideo[] = seedVideos.map((v) => ({
  ...v,
  source: 'seed',
  status: 'live',
  votes: 0,
}))

// Cache để cùng một UserVideo luôn trả về cùng một object (ổn định cho React).
const userVideoCache = new WeakMap<UserVideo, ContentVideo>()

function toContentVideo(u: UserVideo): ContentVideo {
  const cached = userVideoCache.get(u)
  if (cached) return cached
  const video: ContentVideo = {
    id: u.id,
    subjectId: u.subjectId,
    lecturerId: u.id, // video cộng đồng không có giảng viên: dùng id video (vote theo từng video)
    title: u.title,
    chapter: u.chapter,
    concept: u.concept,
    durationSec: u.durationSec,
    likes: 0,
    watchStatus: 'new',
    posterColor: COMMUNITY_POSTER_COLOR,
    quizIds: u.quizIds,
    flashcardIds: u.flashcardIds,
    source: 'user',
    status: u.status,
    votes: u.votes,
    mediaKey: u.mediaKey,
    uploaderName: u.uploaderName,
    conceptId: u.conceptId,
    createdAt: u.createdAt,
    posterDataUrl: u.posterDataUrl,
  }
  userVideoCache.set(u, video)
  return video
}

const userState = () => useContentStore.getState()

/** Tất cả video (seed + user), kể cả video đã bị gỡ. */
export function getAllVideos(): ContentVideo[] {
  return [...SEED_VIDEOS, ...userState().userVideos.map(toContentVideo)]
}

/** Video đang hiển thị được (loại video status = removed). */
export function getVisibleVideos(): ContentVideo[] {
  return getAllVideos().filter((v) => v.status !== 'removed')
}

export function findVideo(id: string): ContentVideo | undefined {
  return (
    SEED_VIDEOS.find((v) => v.id === id) ??
    (() => {
      const u = userState().userVideos.find((x) => x.id === id)
      return u ? toContentVideo(u) : undefined
    })()
  )
}

export function getVideo(id: string): ContentVideo {
  const video = findVideo(id)
  if (!video) throw new Error(`[content] Không tìm thấy video: ${id}`)
  return video
}

// ------------------------------------------------------------------ Lecturer
export const getSubject = (id: SubjectId) => subjects.find((s) => s.id === id)!

function communityLecturer(v: ContentVideo): Lecturer {
  return {
    id: v.id,
    name: v.uploaderName || 'Ẩn danh',
    title: 'Cộng đồng',
    avatarColor: '#59B8FF',
    votes: v.votes,
  }
}

/** Giảng viên của video: video seed -> giảng viên thật; video user -> người đăng. */
export function getLecturerOf(video: ContentVideo): Lecturer {
  if (video.source === 'user') return communityLecturer(video)
  return lecturers.find((l) => l.id === video.lecturerId)!
}

export function getLecturer(id: string): Lecturer {
  const seed = lecturers.find((l) => l.id === id)
  if (seed) return seed
  return communityLecturer(getVideo(id))
}

// ------------------------------------------------------------ Quiz / Flashcard
export const getAllQuizzes = (): Quiz[] => [...seedQuizzes, ...userState().userQuizzes]
export const getAllFlashcards = (): Flashcard[] => [
  ...seedFlashcards,
  ...userState().userFlashcards,
]

export function getQuiz(id: string): Quiz {
  const quiz =
    seedQuizzes.find((q) => q.id === id) ??
    userState().userQuizzes.find((q) => q.id === id)
  if (!quiz) throw new Error(`[content] Không tìm thấy quiz: ${id}`)
  return quiz
}

export function getFlashcard(id: string): Flashcard {
  const card =
    seedFlashcards.find((f) => f.id === id) ??
    userState().userFlashcards.find((f) => f.id === id)
  if (!card) throw new Error(`[content] Không tìm thấy flashcard: ${id}`)
  return card
}

export const getQuizzesForVideo = (videoId: string): Quiz[] =>
  getAllQuizzes().filter((q) => q.videoId === videoId)

export const getFlashcardsForVideo = (videoId: string): Flashcard[] =>
  getAllFlashcards().filter((f) => f.videoId === videoId)

/** Video đã xem xong? (seed: đánh dấu sẵn hoặc đã trả lời hết quiz). */
export function isVideoCompleted(
  video: ContentVideo,
  answers: Record<string, AnswerRecord>,
): boolean {
  return (
    video.watchStatus === 'completed' ||
    (video.quizIds.length > 0 && video.quizIds.every((id) => answers[id] !== undefined))
  )
}

// --------------------------------------------------------------------- Feed
/**
 * Thứ tự feed: video seed (theo feedOrder) rồi video cộng đồng mới nhất trước.
 * Video bị gỡ không xuất hiện. Truyền `source` để lọc (dùng cho tab ở US-05).
 */
export function getFeedIds(source?: VideoSource): string[] {
  const seedIds = source === 'user' ? [] : seedFeedOrder
  const userIds =
    source === 'seed'
      ? []
      : [...userState().userVideos]
          .filter((v) => v.status !== 'removed')
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((v) => v.id)
  return [...seedIds, ...userIds]
}

// ------------------------------------------------------------------ Roadmap
/**
 * Roadmap hợp nhất. Video user có status = 'promoted' sẽ:
 *  - lấp khái niệm "Sắp ra mắt" nếu conceptId trỏ tới khái niệm chưa có video, hoặc
 *  - được đưa vào chương "Góc nhìn khác" (gắn community = true).
 * Khi chưa có video promoted: trả về đúng roadmap seed (không thay đổi gì).
 */
export function getRoadmap(subjectId: SubjectId): ContentChapter[] {
  const base = seedRoadmaps[subjectId]
  const promoted = userState()
    .userVideos.filter((v) => v.subjectId === subjectId && v.status === 'promoted')
    .sort((a, b) => a.createdAt - b.createdAt)
  if (promoted.length === 0) return base

  const chapters: ContentChapter[] = (base as RoadmapChapter[]).map((c) => ({
    id: c.id,
    title: c.title,
    concepts: c.concepts.map((x) => ({ ...x })),
  }))
  const extras: ContentConcept[] = []

  for (const v of promoted) {
    const target = v.conceptId
      ? chapters.flatMap((c) => c.concepts).find((c) => c.id === v.conceptId)
      : undefined
    if (target && !target.videoId) {
      target.videoId = v.id
      target.community = true
    } else {
      extras.push({ id: `alt-${v.id}`, title: v.title, videoId: v.id, community: true })
    }
  }
  if (extras.length > 0) {
    chapters.push({ id: `alt-${subjectId}`, title: ALT_CHAPTER_TITLE, concepts: extras })
  }
  return chapters
}

// -------------------------------------------------------------------- Hooks
/**
 * Đăng ký theo dõi nội dung user: component tự render lại khi có video/quiz/
 * flashcard mới, hoặc khi localStorage vừa nạp xong. Trả về 3 slice để dùng làm
 * dependency cho useMemo nếu cần.
 */
export function useContentSync() {
  const userVideos = useContentStore((s) => s.userVideos)
  const userQuizzes = useContentStore((s) => s.userQuizzes)
  const userFlashcards = useContentStore((s) => s.userFlashcards)
  return { userVideos, userQuizzes, userFlashcards }
}

export function useFeedIds(source?: VideoSource): string[] {
  const userVideos = useContentStore((s) => s.userVideos)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getFeedIds(source), [userVideos, source])
}

export function useRoadmap(subjectId: SubjectId): ContentChapter[] {
  const userVideos = useContentStore((s) => s.userVideos)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getRoadmap(subjectId), [userVideos, subjectId])
}

export function useContentHydrated(): boolean {
  return useContentStore((s) => s.hydrated)
}
