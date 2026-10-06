// /lib/video-db.ts
// Lưu FILE video (Blob) trong IndexedDB. Metadata video nằm ở content-store (localStorage).
// Lý do: localStorage giới hạn ~5MB, còn video tới 50MB -> phải dùng IndexedDB.
// Không cần cài thêm thư viện: dùng IndexedDB gốc của trình duyệt.

const DB_NAME = 'na-media'
const STORE = 'videos'
const VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Trình duyệt không hỗ trợ IndexedDB'))
      return
    }
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Không mở được IndexedDB'))
  })
}

async function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = action(tx.objectStore(STORE))
    tx.oncomplete = () => {
      db.close()
      resolve(req.result)
    }
    const fail = () => {
      db.close()
      reject(tx.error ?? new Error('Giao dịch IndexedDB thất bại'))
    }
    tx.onerror = fail
    tx.onabort = fail
  })
}

/** Lưu file video theo mediaKey (ghi đè nếu trùng). */
export async function saveVideoBlob(mediaKey: string, blob: Blob): Promise<void> {
  await run('readwrite', (s) => s.put(blob, mediaKey))
}

/** Lấy file video; trả về undefined nếu không có. */
export async function getVideoBlob(mediaKey: string): Promise<Blob | undefined> {
  return run<Blob | undefined>('readonly', (s) => s.get(mediaKey))
}

export async function deleteVideoBlob(mediaKey: string): Promise<void> {
  await run('readwrite', (s) => s.delete(mediaKey))
}

/** Xóa toàn bộ file video (dùng cho nút reset demo - US-11). */
export async function clearVideoBlobs(): Promise<void> {
  await run('readwrite', (s) => s.clear())
}
