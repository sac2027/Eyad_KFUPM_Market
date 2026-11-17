import { useEffect, useMemo, useState } from 'react'
import { WORST_LISTINGS, WORST_REQUESTS } from '../data/worst'
import { useStore, usePersona } from '../store/useStore'
import { useUi } from '../store/useUi'
import type { IsoRequest, Listing } from './types'

/** Current time, refreshed on an interval. Countdowns use 1s, lists 30s. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

/** Listings to render. The worst-case toggle prepends stress-test rows. */
export function useListings(): Listing[] {
  const listings = useStore((s) => s.listings)
  const worst = useStore((s) => s.worstCase)
  return useMemo(() => (worst ? [...WORST_LISTINGS, ...listings] : listings), [listings, worst])
}

export function useRequests(): IsoRequest[] {
  const requests = useStore((s) => s.requests)
  const worst = useStore((s) => s.worstCase)
  return useMemo(() => (worst ? [...WORST_REQUESTS, ...requests] : requests), [requests, worst])
}

/** Runs `fn` if the persona is verified, otherwise opens the verification modal first. */
export function useVerifiedAction() {
  const me = usePersona()
  const setVerify = useUi((s) => s.setVerify)
  return (fn: () => void) => {
    if (me.verified) fn()
    else setVerify(true, fn)
  }
}

export function useIsFavorite(id: string): boolean {
  return useStore((s) => (s.favorites[s.personaId] ?? []).includes(id))
}

export function useDebounced<T>(value: T, ms = 150): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), ms)
    return () => window.clearTimeout(id)
  }, [value, ms])
  return v
}
