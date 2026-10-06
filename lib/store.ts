import { create } from 'zustand'
import { getQuiz } from '@/lib/content'
import {
  seedAnswers,
  seedDueTodayFlashcardIds,
  seedMasteredFlashcardIds,
  seedUnlockedFlashcardIds,
} from '@/lib/mock-data'

export const UNSORTED_FOLDER_ID = 'unsorted'

export interface AnswerRecord {
  quizId: string
  selectedIndex: number
  isCorrect: boolean
}

interface AppState {
  answers: Record<string, AnswerRecord>
  sessionAnsweredQuizIds: string[]
  unlockedFlashcardIds: string[]
  masteredFlashcardIds: string[]
  dueTodayFlashcardIds: string[]
  votedLecturerIds: string[]
  savedFolders: Record<string, string>
  followedLecturerIds: string[]
  demoStep: number
  resetCount: number

  completeDemoStep: (step: number) => void
  resetDemo: () => void
  answerQuiz: (quizId: string, selectedIndex: number) => void
  unlockFlashcards: (ids: string[]) => void
  toggleMastered: (flashcardId: string) => void
  toggleVote: (lecturerId: string) => void
  saveFlashcards: (ids: string[], folderId?: string) => void
  unsaveFlashcards: (ids: string[]) => void
  toggleFollow: (lecturerId: string) => void
}

const toggleIn = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id]

const initialAnswers = Object.fromEntries(
  seedAnswers.map(({ quizId, selectedIndex }) => [
    quizId,
    {
      quizId,
      selectedIndex,
      isCorrect: selectedIndex === getQuiz(quizId).correctIndex,
    } satisfies AnswerRecord,
  ]),
)

export const DEMO_STEP_COUNT = 8

const seedState = () => ({
  answers: { ...initialAnswers },
  sessionAnsweredQuizIds: [] as string[],
  unlockedFlashcardIds: [...seedUnlockedFlashcardIds],
  masteredFlashcardIds: [...seedMasteredFlashcardIds],
  dueTodayFlashcardIds: [...seedDueTodayFlashcardIds],
  votedLecturerIds: [] as string[],
  savedFolders: {} as Record<string, string>,
  followedLecturerIds: [] as string[],
  demoStep: 1,
})

export const useAppStore = create<AppState>((set) => ({
  ...seedState(),
  resetCount: 0,

  completeDemoStep: (step) =>
    set((s) => (s.demoStep <= step ? { demoStep: step + 1 } : s)),

  resetDemo: () =>
    set((s) => ({ ...seedState(), resetCount: s.resetCount + 1 })),

  answerQuiz: (quizId, selectedIndex) =>
    set((s) => ({
      sessionAnsweredQuizIds: s.sessionAnsweredQuizIds.includes(quizId)
        ? s.sessionAnsweredQuizIds
        : [...s.sessionAnsweredQuizIds, quizId],
      answers: {
        ...s.answers,
        [quizId]: {
          quizId,
          selectedIndex,
          isCorrect: selectedIndex === getQuiz(quizId).correctIndex,
        },
      },
    })),

  unlockFlashcards: (ids) =>
    set((s) => ({
      unlockedFlashcardIds: Array.from(
        new Set([...s.unlockedFlashcardIds, ...ids]),
      ),
    })),

  toggleMastered: (flashcardId) =>
    set((s) => ({
      masteredFlashcardIds: toggleIn(s.masteredFlashcardIds, flashcardId),
    })),

  toggleVote: (lecturerId) =>
    set((s) => ({ votedLecturerIds: toggleIn(s.votedLecturerIds, lecturerId) })),

  saveFlashcards: (ids, folderId = UNSORTED_FOLDER_ID) =>
    set((s) => ({
      savedFolders: {
        ...s.savedFolders,
        ...Object.fromEntries(ids.map((id) => [id, folderId])),
      },
    })),

  unsaveFlashcards: (ids) =>
    set((s) => {
      const next = { ...s.savedFolders }
      ids.forEach((id) => delete next[id])
      return { savedFolders: next }
    }),

  toggleFollow: (lecturerId) =>
    set((s) => ({
      followedLecturerIds: toggleIn(s.followedLecturerIds, lecturerId),
    })),
}))
