'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Compass, SquarePlay, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', label: 'Home', Icon: SquarePlay },
  { href: '/roadmap', label: 'Roadmap', Icon: Compass },
  { href: '/saved', label: 'Saved', Icon: Bookmark },
  { href: '/profile', label: 'Profile', Icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main"
      className="shrink-0 bg-butter px-4 pt-3 pb-5"
    >
      <ul className="flex items-stretch justify-between rounded-3xl border-[2.5px] border-ink bg-cream px-2 py-2 shadow-hard">
        {items.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className="flex min-h-11 flex-col items-center gap-1 rounded-2xl py-1 text-xs font-bold text-ink outline-none focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-purple"
              >
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-xl border-[2.5px]',
                    active
                      ? 'border-ink bg-yellow shadow-[2px_2px_0_#111]'
                      : 'border-transparent',
                  )}
                >
                  <Icon aria-hidden className="size-5" />
                </span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
