import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
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

/**
 * Listings to render. The worst-case toggle prepends stress-test rows.
 * Listings an admin hid, or whose seller is suspended, are left out for everyone but the seller and admins.
 */
export function useListings(): Listing[] {
  const listings = useStore((s) => s.listings)
  const users = useStore((s) => s.users)
  const personaId = useStore((s) => s.personaId)
  const worst = useStore((s) => s.worstCase)
  return useMemo(() => {
    const me = users.find((u) => u.id === personaId)
    const suspended = new Set(users.filter((u) => u.suspended).map((u) => u.id))
    const visible = me?.role === 'admin' ? listings : listings.filter((l) => l.sellerId === personaId || (!l.hidden && !suspended.has(l.sellerId)))
    return worst ? [...WORST_LISTINGS, ...visible] : visible
  }, [listings, users, personaId, worst])
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
  const lang = useStore((s) => s.lang)
  return (fn: () => void) => {
    if (me.suspended) {
      toast.error(lang === 'ar' ? 'حسابك موقوف. تواصل مع مشرف السوق.' : 'Your account is suspended. Contact the market admin.')
      return
    }
    if (me.role === 'admin') {
      toast(lang === 'ar' ? 'حساب المشرف للإشراف فقط. بدّل لشخصية طالب عشان تنشر أو تحجز.' : 'The admin account only moderates. Switch to a student persona to list or reserve.')
      return
    }
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
