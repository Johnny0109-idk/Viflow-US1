'use client'

import { useEffect } from 'react'
import { useContentStore } from '@/lib/content-store'

/**
 * Nạp nội dung người dùng từ localStorage SAU khi app đã mount.
 * (Store dùng skipHydration để server render và client render đầu tiên giống nhau.)
 */
export function ContentHydrator() {
  useEffect(() => {
    void useContentStore.persist.rehydrate()
  }, [])
  return null
}
