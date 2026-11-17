import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { seedDeals, seedListings, seedRequests } from '../data/seed'
import { seedUsers } from '../data/users'
import type { Deal, IsoRequest, Lang, Listing, Offer, Payment, User, ZoneId } from '../lib/types'

export const STORAGE_KEY = 'kfupm-market:v1'

interface Data {
  users: User[]
  listings: Listing[]
  requests: IsoRequest[]
  deals: Deal[]
  favorites: Record<string, string[]>
  seededAt: number
}

interface Prefs {
  lang: Lang
  personaId: string
  finals: boolean
  worstCase: boolean
}

export interface ReserveInput {
  listingId: string
  zone: ZoneId
  meetAt: number
  returnAt?: number
  total: number
  deposit: number
  payment: Payment
}

interface Actions {
  setLang: (lang: Lang) => void
  setPersona: (id: string) => void
  setFinals: (on: boolean) => void
  setWorstCase: (on: boolean) => void
  verify: (userId: string) => void
  toggleFavorite: (listingId: string) => void
  addListing: (l: Listing) => void
  removeListing: (id: string) => void
  addRequest: (r: IsoRequest) => void
  addOffer: (requestId: string, offer: Omit<Offer, 'id' | 'createdAt'>) => void
  fulfilRequest: (requestId: string) => void
  reserve: (input: ReserveInput) => Deal | null
  /** Sale: reserved → completed. Rental: reserved → rented. */
  confirmHandover: (dealId: string) => void
  markReturned: (dealId: string) => void
  cancelDeal: (dealId: string) => void
  joinGroupBuy: (listingId: string, qty: number) => void
  leaveGroupBuy: (listingId: string) => void
  reset: () => void
}

export type State = Data & Prefs & Actions

function freshData(): Data {
  const now = Date.now()
  return {
    users: seedUsers(now),
    listings: seedListings(now),
    requests: seedRequests(now),
    deals: seedDeals(now),
    favorites: { eyad: ['dell-u2723', 'rent-kashta'], faisal: ['bundle-prep'], omar: [] },
    seededAt: now,
  }
}

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

const setListingStatus = (listings: Listing[], id: string, status: Listing['status']) =>
  listings.map((l) => (l.id === id ? { ...l, status } : l))

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...freshData(),
      lang: 'en',
      personaId: 'eyad',
      finals: false,
      // Dev aid: /?data=worst starts with the stress-test rows switched on.
      worstCase: typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('data') === 'worst',

      setLang: (lang) => set({ lang }),
      setPersona: (personaId) => set({ personaId }),
      setFinals: (finals) => set({ finals }),
      setWorstCase: (worstCase) => set({ worstCase }),

      verify: (userId) => set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, verified: true } : u)) })),

      toggleFavorite: (listingId) =>
        set((s) => {
          const mine = s.favorites[s.personaId] ?? []
          const next = mine.includes(listingId) ? mine.filter((x) => x !== listingId) : [...mine, listingId]
          return { favorites: { ...s.favorites, [s.personaId]: next } }
        }),

      addListing: (l) => set((s) => ({ listings: [l, ...s.listings] })),
      removeListing: (id) => set((s) => ({ listings: s.listings.filter((l) => l.id !== id) })),
      addRequest: (r) => set((s) => ({ requests: [r, ...s.requests] })),

      addOffer: (requestId, offer) =>
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === requestId ? { ...r, offers: [...r.offers, { ...offer, id: uid('of'), createdAt: Date.now() }] } : r,
          ),
        })),

      fulfilRequest: (requestId) =>
        set((s) => ({ requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'fulfilled' } : r)) })),

      reserve: (input) => {
        const s = get()
        const listing = s.listings.find((l) => l.id === input.listingId)
        if (!listing || listing.status !== 'available' || listing.sellerId === s.personaId) return null
        const deal: Deal = {
          id: uid('deal'),
          listingId: listing.id,
          buyerId: s.personaId,
          sellerId: listing.sellerId,
          type: listing.kind === 'rent' ? 'rent' : 'buy',
          zone: input.zone,
          meetAt: input.meetAt,
          returnAt: input.returnAt,
          total: input.total,
          deposit: input.deposit,
          payment: input.payment,
          status: 'reserved',
          createdAt: Date.now(),
        }
        // Services stay bookable by others; physical items lock.
        const lock = listing.kind !== 'service'
        set({ deals: [deal, ...s.deals], listings: lock ? setListingStatus(s.listings, listing.id, 'reserved') : s.listings })
        return deal
      },

      confirmHandover: (dealId) =>
        set((s) => {
          const deal = s.deals.find((d) => d.id === dealId)
          if (!deal || deal.status !== 'reserved') return s
          const listing = s.listings.find((l) => l.id === deal.listingId)
          const isService = listing?.kind === 'service'
          if (deal.type === 'rent') {
            return {
              deals: s.deals.map((d) => (d.id === dealId ? { ...d, status: 'rented' } : d)),
              listings: setListingStatus(s.listings, deal.listingId, 'rented'),
            }
          }
          return {
            deals: s.deals.map((d) => (d.id === dealId ? { ...d, status: 'completed' } : d)),
            listings: isService ? s.listings : setListingStatus(s.listings, deal.listingId, 'completed'),
            users: bump(s.users, [deal.buyerId, deal.sellerId], false),
          }
        }),

      markReturned: (dealId) =>
        set((s) => {
          const deal = s.deals.find((d) => d.id === dealId)
          if (!deal || deal.status !== 'rented') return s
          const onTime = deal.returnAt == null || Date.now() <= deal.returnAt + 15 * 60_000
          return {
            deals: s.deals.map((d) => (d.id === dealId ? { ...d, status: 'completed' } : d)),
            // A returned rental goes back on the market.
            listings: setListingStatus(s.listings, deal.listingId, 'available'),
            users: bump(s.users, [deal.buyerId, deal.sellerId], true, onTime ? deal.buyerId : undefined),
          }
        }),

      cancelDeal: (dealId) =>
        set((s) => {
          const deal = s.deals.find((d) => d.id === dealId)
          if (!deal || deal.status !== 'reserved') return s
          return {
            deals: s.deals.map((d) => (d.id === dealId ? { ...d, status: 'cancelled' } : d)),
            listings: s.listings.map((l) => (l.id === deal.listingId && l.status === 'reserved' ? { ...l, status: 'available' } : l)),
          }
        }),

      joinGroupBuy: (listingId, qty) =>
        set((s) => ({
          listings: s.listings.map((l) => {
            if (l.id !== listingId || !l.groupBuy) return l
            const others = l.groupBuy.joined.filter((j) => j.userId !== s.personaId)
            return { ...l, groupBuy: { ...l.groupBuy, joined: [...others, { userId: s.personaId, qty }] } }
          }),
        })),

      leaveGroupBuy: (listingId) =>
        set((s) => ({
          listings: s.listings.map((l) =>
            l.id === listingId && l.groupBuy
              ? { ...l, groupBuy: { ...l.groupBuy, joined: l.groupBuy.joined.filter((j) => j.userId !== s.personaId) } }
              : l,
          ),
        })),

      reset: () => set({ ...freshData(), finals: false, worstCase: false }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: ({ users, listings, requests, deals, favorites, seededAt, lang, personaId, finals }) => ({
        users,
        listings,
        requests,
        deals,
        favorites,
        seededAt,
        lang,
        personaId,
        finals,
      }),
      // Anything unreadable or from an older shape falls back to the seed.
      merge: (persisted, current) => {
        const p = persisted as Partial<State> | undefined
        const valid =
          p &&
          Array.isArray(p.users) &&
          Array.isArray(p.listings) &&
          Array.isArray(p.requests) &&
          Array.isArray(p.deals) &&
          p.users.length > 0 &&
          p.users.some((u) => u.id === p.personaId)
        if (!valid) return current
        return { ...current, ...p, lang: p.lang === 'ar' ? 'ar' : 'en' }
      },
      migrate: (state) => state as State,
    },
  ),
)

function bump(users: User[], ids: string[], rental: boolean, onTimeUser?: string): User[] {
  return users.map((u) => {
    if (!ids.includes(u.id)) return u
    const stats = { ...u.stats, deals: u.stats.deals + 1 }
    if (rental && u.id === ids[0]) {
      stats.rentals += 1
      if (onTimeUser === u.id) stats.onTime += 1
    }
    return { ...u, stats }
  })
}

// Selectors
export const usePersona = (): User => useStore((s) => s.users.find((u) => u.id === s.personaId) ?? s.users[0])
export const useUser = (id: string): User | undefined => useStore((s) => s.users.find((u) => u.id === id))
