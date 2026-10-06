import { StudyScreen } from '@/components/study/study-screen'

export default async function StudyPage({
  params,
}: {
  params: Promise<{ folderId: string }>
}) {
  const { folderId } = await params
  return <StudyScreen folderId={folderId} />
}
