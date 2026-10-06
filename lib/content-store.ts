// /lib/content-store.ts
// Kho dữ liệu cho NỘI DUNG DO NGƯỜI DÙNG TẠO (video, quiz, flashcard).
// - Metadata lưu bằng Zustand persist -> localStorage (key "na-content-v1").
// - File video lưu riêng trong IndexedDB (xem video-db.ts), liên kết qua `mediaKey`.
// Dữ liệu seed vẫn nằm trong mock-data.ts. Màn hình KHÔNG đọc file này trực tiếp:
// hãy dùng các selector trong lib/content.ts.

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Flashcard, Quiz, SubjectId } from '@/lib/mock-data'
import { clearVideoBlobs, deleteVideoBlob } from '@/lib/video-db'

export type VideoStatus = 'live' | 'promoted' | 'removed'

export interface UserVideo {
  id: string
  title: string
  subjectId: SubjectId
  chapter: string // tên chương (khớp roadmaps[subjectId][].title)
  concept: string // tên khái niệm
  conceptId?: string // id khái niệm trong roadmaps (dùng cho US-08 khi lên Roadmap)
  uploaderName: string
  mediaKey: string // khóa file video trong IndexedDB
  posterDataUrl?: string // ảnh poster chụp bằng canvas (US-03), nhỏ nên lưu thẳng ở đây
  durationSec: number
  createdAt: number // Date.now()
  status: VideoStatus
  votes: number // số vote (US-08)
  quizIds: string[]
  flashcardIds: string[]
}

export interface NewUserContent {
  video: UserVideo
  quizzes: Quiz[]
  flashcards: Flashcard[]
}

interface ContentState {
  userVideos: UserVideo[]
  userQuizzes: Quiz[]
  userFlashcards: Flashcard[]
  hydrated: boolean // true sau khi đã đọc xong từ localStorage

  addUserContent: (input: NewUserContent) => void
  setVideoStatus: (videoId: string, status: VideoStatus) => void
  setVideoVotes: (videoId: string, votes: number) => void
  removeUserVideo: (videoId: string) => void
  resetUserContent: () => void
}

/** Tạo id duy nhất cho nội dung người dùng, ví dụ "u-video-3f9a...". */
export function createUserId(kind: 'video' | 'quiz' | 'fc'): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `u-${kind}-${rand}`
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      userVideos: [],
      userQuizzes: [],
      userFlashcards: [],
      hydrated: false,

      addUserContent: ({ video, quizzes, flashcards }) =>
        set((s) => ({
          userVideos: [...s.userVideos, video],
          userQuizzes: [...s.userQuizzes, ...quizzes],
          userFlashcards: [...s.userFlashcards, ...flashcards],
        })),

      setVideoStatus: (videoId, status) =>
        set((s) => ({
          userVideos: s.userVideos.map((v) =>
            v.id === videoId ? { ...v, status } : v,
          ),
        })),

      setVideoVotes: (videoId, votes) =>
        set((s) => ({
          userVideos: s.userVideos.map((v) =>
            v.id === videoId ? { ...v, votes } : v,
          ),
        })),

      removeUserVideo: (videoId) => {
        const target = get().userVideos.find((v) => v.id === videoId)
        if (!target) return
        set((s) => ({
          userVideos: s.userVideos.filter((v) => v.id !== videoId),
          userQuizzes: s.userQuizzes.filter((q) => q.videoId !== videoId),
          userFlashcards: s.userFlashcards.filter((f) => f.videoId !== videoId),
        }))
        // Xóa file video; lỗi IndexedDB không được làm hỏng UI.
        deleteVideoBlob(target.mediaKey).catch(() => {})
      },

      resetUserContent: () => {
        set({ userVideos: [], userQuizzes: [], userFlashcards: [] })
        clearVideoBlobs().catch(() => {})
      },
    }),
    {
      name: 'na-content-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Chỉ lưu dữ liệu, không lưu cờ `hydrated` và các hàm.
      partialize: (s) => ({
        userVideos: s.userVideos,
        userQuizzes: s.userQuizzes,
        userFlashcards: s.userFlashcards,
      }),
      // Hydrate thủ công sau khi mount (xem ContentHydrator) để tránh lỗi
      // hydration mismatch giữa server render và dữ liệu localStorage.
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useContentStore.setState({ hydrated: true })
      },
    },
  ),
)
