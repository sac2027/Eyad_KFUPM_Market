import { useCallback } from 'react'
import { useStore } from '../store/useStore'
import type { Bi, Lang } from './types'

/** Copy lives next to where it is used: t('Reserve', 'احجز'). */
export function useT() {
  const lang = useStore((s) => s.lang)
  return useCallback((en: string, ar: string) => (lang === 'ar' ? ar : en), [lang])
}

export function useLang(): Lang {
  return useStore((s) => s.lang)
}

export function pick(bi: Bi, lang: Lang): string {
  return lang === 'ar' ? bi.ar || bi.en : bi.en || bi.ar
}

/** Returns a function that picks the right side of a bilingual value. */
export function useL() {
  const lang = useStore((s) => s.lang)
  return useCallback((bi: Bi) => pick(bi, lang), [lang])
}
