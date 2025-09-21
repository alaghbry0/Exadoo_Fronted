// src/utils/getIsLinked.ts
'use client'

import { useUserStore } from '@/stores/zustand/userStore'

export const FEATURE_FLAG_NEW_SERVICES =
  process.env.NEXT_PUBLIC_FEATURE_NEW_SERVICES === 'true' ||
  process.env.FEATURE_NEW_SERVICES === 'true'

export const TEST_MODE_ENABLED = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

export function getIsLinked(): boolean {
  return useUserStore.getState().isLinked
}
