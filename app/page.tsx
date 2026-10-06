import { Feed } from '@/components/feed/feed'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>
}) {
  const { v } = await searchParams
  return <Feed initialVideoId={v} />
}
