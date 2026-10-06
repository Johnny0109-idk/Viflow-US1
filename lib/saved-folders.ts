import { getQuiz, getVideo } from '@/lib/content'
import { folderColors, subjects, type SubjectId } from '@/lib/mock-data'
import { UNSORTED_FOLDER_ID, type AnswerRecord } from '@/lib/store'

export const WRONG_FOLDER_ID = 'wrong'

export type FolderKind = 'subject' | 'wrong' | 'unsorted'

export interface FolderInfo {
  id: string
  name: string
  color: string
  kind: FolderKind
}

export function resolveFolder(folderId: string): FolderInfo | null {
  if (folderId === WRONG_FOLDER_ID) {
    return { id: folderId, name: 'Câu trả lời sai', color: folderColors.wrong, kind: 'wrong' }
  }
  if (folderId === UNSORTED_FOLDER_ID) {
    return { id: folderId, name: 'Chưa phân loại', color: folderColors.unsorted, kind: 'unsorted' }
  }
  const subject = subjects.find((s) => s.id === folderId)
  return subject
    ? { id: subject.id, name: subject.name, color: subject.color, kind: 'subject' }
    : null
}

export function recordsForFolder(
  folder: FolderInfo,
  answers: Record<string, AnswerRecord>,
  sessionIds: string[],
): AnswerRecord[] {
  const all = Object.values(answers)
  if (folder.kind === 'wrong') return all.filter((r) => !r.isCorrect)
  if (folder.kind === 'unsorted') return all.filter((r) => sessionIds.includes(r.quizId))
  return all.filter(
    (r) => getVideo(getQuiz(r.quizId).videoId).subjectId === (folder.id as SubjectId),
  )
}
