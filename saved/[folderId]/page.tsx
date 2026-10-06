import { FolderDetail } from '@/components/saved/folder-detail'

export default async function FolderDetailPage({
  params,
}: {
  params: Promise<{ folderId: string }>
}) {
  const { folderId } = await params
  return <FolderDetail folderId={folderId} />
}
