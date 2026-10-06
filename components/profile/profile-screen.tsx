'use client'

import { Award, Flame, Star } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getVisibleVideos, isVideoCompleted, useContentSync } from '@/lib/content'
import { profile } from '@/lib/mock-data'

function initials(name: string) {
  const parts = name.split(' ')
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ProfileScreen() {
  useContentSync()
  const answers = useAppStore((s) => s.answers)
  const masteredCount = useAppStore((s) => s.masteredFlashcardIds.length)

  const watched = getVisibleVideos().filter((v) => isVideoCompleted(v, answers)).length
  const records = Object.values(answers)
  const accuracy = records.length
    ? Math.round((records.filter((r) => r.isCorrect).length / records.length) * 100)
    : 0

  const stats = [
    { label: 'Video đã xem', value: String(watched), color: '#FFCC1A' },
    { label: 'Độ chính xác', value: `${accuracy}%`, color: '#3DC63D' },
    { label: 'Thẻ nắm vững', value: String(masteredCount), color: '#7B61FF' },
  ]

  return (
    <div className="h-full overflow-y-auto bg-cream px-5 pt-4 pb-6">
      <header className="flex flex-col items-center text-center">
        <div
          aria-hidden
          className="flex size-24 items-center justify-center rounded-full border-[2.5px] border-ink bg-pink text-3xl font-extrabold text-ink shadow-hard-sm"
        >
          {initials(profile.name)}
        </div>
        <h1 className="mt-4 text-balance text-2xl font-extrabold text-ink">
          {profile.name}
        </h1>
        <p className="text-sm text-ink/60">
          {profile.major} · {profile.school}
        </p>
      </header>

      <ul className="mt-5 grid grid-cols-3 gap-3">
        <li className="flex flex-col items-center rounded-2xl border-[2.5px] border-ink bg-white px-2 py-3 shadow-hard-sm">
          <Flame aria-hidden className="size-6 text-pink" />
          <span className="mt-1 text-xl font-extrabold text-ink">
            {profile.streakDays}
          </span>
          <span className="text-[11px] font-bold text-ink/50">Ngày liên tiếp</span>
        </li>
        <li className="flex flex-col items-center rounded-2xl border-[2.5px] border-ink bg-white px-2 py-3 shadow-hard-sm">
          <Star aria-hidden className="size-6 text-ink" />
          <span className="mt-1 text-xl font-extrabold text-ink">{profile.xp}</span>
          <span className="text-[11px] font-bold text-ink/50">XP</span>
        </li>
        <li className="flex flex-col items-center rounded-2xl border-[2.5px] border-ink bg-yellow px-2 py-3 shadow-hard-sm">
          <Award aria-hidden className="size-6 text-ink" />
          <span className="mt-1 text-xl font-extrabold text-ink">
            {profile.level}
          </span>
          <span className="text-[11px] font-bold text-ink/70">Cấp độ</span>
        </li>
      </ul>

      <section aria-labelledby="stats-title" className="mt-6">
        <h2 id="stats-title" className="text-lg font-extrabold text-ink">
          Thống kê
        </h2>
        <ul className="mt-3 flex flex-col gap-3">
          {stats.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between rounded-2xl border-[2.5px] border-ink bg-white p-3 shadow-hard-sm"
            >
              <span className="flex items-center gap-3 text-sm font-extrabold text-ink">
                <span
                  aria-hidden
                  className="size-4 rounded-md border-2 border-ink"
                  style={{ backgroundColor: s.color }}
                />
                {s.label}
              </span>
              <span className="text-2xl font-extrabold text-ink">{s.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="badges-title" className="mt-6">
        <h2 id="badges-title" className="text-lg font-extrabold text-ink">
          Huy hiệu
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {profile.badges.map((b) => (
            <li
              key={b.id}
              className="flex items-center gap-2 rounded-full border-[2.5px] border-ink px-3 py-1.5 text-sm font-extrabold text-ink shadow-[2px_2px_0_#111]"
              style={{ backgroundColor: b.color }}
            >
              <Award aria-hidden className="size-4" />
              {b.label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
