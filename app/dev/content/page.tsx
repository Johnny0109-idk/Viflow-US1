'use client'

// Trang CÔNG CỤ DEV (không có trong thanh điều hướng): /dev/content
// Dùng để thêm / đổi trạng thái / xóa video test mà không cần mở Console.
// Có thể xóa cả thư mục app/dev trước khi nộp bài.

import Link from 'next/link'
import { createUserId, useContentStore, type VideoStatus } from '@/lib/content-store'
import { useContentHydrated } from '@/lib/content'

function addTestVideo(opts: { promoted: boolean; withQuiz: boolean }) {
  const n = useContentStore.getState().userVideos.length + 1
  const videoId = createUserId('video')
  const quizId = createUserId('quiz')
  const cardIds = [createUserId('fc'), createUserId('fc')]
  useContentStore.getState().addUserContent({
    video: {
      id: videoId,
      title: `Video test #${n}: Co giãn của cầu theo giá`,
      subjectId: 'micro',
      chapter: 'Chương 2: Độ co giãn',
      concept: 'Co giãn của cầu theo giá',
      conceptId: 'm-2-1',
      uploaderName: 'Sinh viên Test',
      mediaKey: `test-media-${n}`, // chưa có file thật (US-03/04 sẽ lưu file vào IndexedDB)
      durationSec: 60,
      createdAt: Date.now(),
      status: opts.promoted ? 'promoted' : 'live',
      votes: 0,
      quizIds: opts.withQuiz ? [quizId] : [],
      flashcardIds: opts.withQuiz ? cardIds : [],
    },
    quizzes: opts.withQuiz
      ? [
          {
            id: quizId,
            videoId,
            question: 'Cầu co giãn nghĩa là gì?',
            options: [
              'Lượng cầu ít thay đổi khi giá đổi',
              'Lượng cầu thay đổi nhiều khi giá đổi',
              'Giá không ảnh hưởng đến cầu',
              'Cung luôn bằng cầu',
            ],
            correctIndex: 1,
            explanation: 'Cầu co giãn: % thay đổi lượng cầu lớn hơn % thay đổi giá.',
          },
        ]
      : [],
    flashcards: opts.withQuiz
      ? [
          { id: cardIds[0], subjectId: 'micro', videoId, term: 'Cầu co giãn', definition: 'Lượng cầu phản ứng mạnh với thay đổi giá.' },
          { id: cardIds[1], subjectId: 'micro', videoId, term: 'Cầu kém co giãn', definition: 'Lượng cầu phản ứng yếu với thay đổi giá.' },
        ]
      : [],
  })
}

const btn =
  'min-h-11 rounded-2xl border-[2.5px] border-ink bg-yellow px-4 text-sm font-bold text-ink shadow-hard-sm active:translate-y-0.5'

export default function DevContentPage() {
  const hydrated = useContentHydrated()
  const videos = useContentStore((s) => s.userVideos)
  const setStatus = useContentStore((s) => s.setVideoStatus)
  const remove = useContentStore((s) => s.removeUserVideo)
  const reset = useContentStore((s) => s.resetUserContent)

  return (
    <div className="h-full overflow-y-auto bg-cream px-5 pt-4 pb-6 text-ink">
      <h1 className="text-2xl font-extrabold">Dev: nội dung người dùng</h1>
      <p className="mt-1 text-sm text-ink/60">
        Đã nạp từ localStorage: <b>{hydrated ? 'rồi' : 'chưa'}</b> · {videos.length} video
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <button className={btn} onClick={() => addTestVideo({ promoted: false, withQuiz: true })}>
          + Video test (live, có quiz + 2 thẻ)
        </button>
        <button className={btn} onClick={() => addTestVideo({ promoted: true, withQuiz: true })}>
          + Video test (promoted, lên Roadmap)
        </button>
        <button className={btn} onClick={() => addTestVideo({ promoted: false, withQuiz: false })}>
          + Video test (không quiz, không thẻ)
        </button>
        <button className={`${btn} bg-pink`} onClick={reset}>
          Xóa toàn bộ nội dung người dùng
        </button>
      </div>

      <ul className="mt-5 flex flex-col gap-3">
        {videos.map((v) => (
          <li key={v.id} className="rounded-2xl border-[2.5px] border-ink bg-white p-3">
            <p className="text-sm font-extrabold">{v.title}</p>
            <p className="text-xs text-ink/60">
              {v.status} · {v.quizIds.length} quiz · {v.flashcardIds.length} thẻ
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href={`/?v=${v.id}`} className="rounded-xl border-2 border-ink bg-yellow px-3 py-1.5 text-xs font-bold">
                Xem trên Feed
              </Link>
              {(['live', 'promoted', 'removed'] as VideoStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatus(v.id, st)}
                  aria-pressed={v.status === st}
                  className={`rounded-xl border-2 border-ink px-3 py-1.5 text-xs font-bold ${v.status === st ? 'bg-purple text-white' : 'bg-cream'}`}
                >
                  {st}
                </button>
              ))}
              <button onClick={() => remove(v.id)} className="rounded-xl border-2 border-ink bg-pink px-3 py-1.5 text-xs font-bold">
                Xóa
              </button>
            </div>
          </li>
        ))}
        {videos.length === 0 && <li className="text-sm text-ink/50">Chưa có video nào.</li>}
      </ul>

      <p className="mt-6 text-xs text-ink/50">
        Lưu ý: giai đoạn US-01 chưa có trình phát video thật (US-02), nên Feed hiển thị khung
        màu giữ chỗ cho video test.
      </p>
    </div>
  )
}
