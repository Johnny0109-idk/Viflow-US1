import type { ReactNode } from 'react'
import Link from 'next/link'

export interface SavedFolderTileProps {
  href?: string
  name: string
  color: string
  icon: ReactNode
  countLabel: string
  detailLabel: string
  isNew?: boolean
}

export function SavedFolderTile({
  href,
  name,
  color,
  icon,
  countLabel,
  detailLabel,
  isNew,
}: SavedFolderTileProps) {
  const className =
    'relative flex min-h-32 w-full flex-col rounded-2xl rounded-tl-none border-[2.5px] border-ink bg-white p-3 text-left text-ink shadow-[4px_4px_0_#111] outline-none transition-[transform,box-shadow] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-purple active:translate-x-1 active:translate-y-1 active:shadow-none'
  const Wrapper = ({ children }: { children: ReactNode }) =>
    href ? (
      <Link href={href} className={className}>
        {children}
      </Link>
    ) : (
      <button type="button" className={className}>
        {children}
      </button>
    )

  return (
    <li className="relative pt-3">
      <Wrapper>
        <span
          aria-hidden
          className="absolute -top-[14px] -left-[2.5px] h-3 w-14 rounded-t-lg border-[2.5px] border-b-0 border-ink"
          style={{ backgroundColor: color }}
        />
        <span className="flex items-start justify-between gap-2">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5"
            style={{ backgroundColor: `${color}33`, color }}
          >
            {icon}
          </span>
          <span className="flex flex-col items-end text-right">
            <span className="text-[13px] font-extrabold leading-tight">
              {countLabel}
            </span>
            <span className="text-[11px] font-medium leading-tight text-ink/50">
              {detailLabel}
            </span>
          </span>
        </span>
        <span className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="text-[15px] font-extrabold leading-tight">
            {name}
          </span>
          {isNew ? (
            <span className="shrink-0 rounded-full border-[2.5px] border-ink bg-[#FF5A87] px-2 py-0.5 text-[11px] font-extrabold leading-none">
              NEW
            </span>
          ) : null}
        </span>
      </Wrapper>
    </li>
  )
}
