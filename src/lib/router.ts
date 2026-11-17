import { useSyncExternalStore } from 'react'

export type ViewId = 'market' | 'rent' | 'requests' | 'coop' | 'skills' | 'passiton' | 'zones'
export const VIEWS: ViewId[] = ['market', 'rent', 'requests', 'coop', 'skills', 'passiton', 'zones']

export interface Route {
  view: ViewId
  listingId?: string
}

function parse(hash: string): Route {
  const [, a, b] = hash.replace(/^#/, '').split('/')
  if (a === 'item' && b) return { view: lastView, listingId: decodeURIComponent(b) }
  const view = (VIEWS as string[]).includes(a) ? (a as ViewId) : 'market'
  lastView = view
  return { view }
}

let lastView: ViewId = 'market'
let cached: Route = parse(window.location.hash)
let cachedHash = window.location.hash

function snapshot(): Route {
  if (window.location.hash !== cachedHash) {
    cachedHash = window.location.hash
    cached = parse(cachedHash)
  }
  return cached
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, snapshot)
}

export function go(view: ViewId) {
  window.location.hash = `/${view}`
}

export function openListing(id: string) {
  window.location.hash = `/item/${encodeURIComponent(id)}`
}

export function closeListing() {
  window.location.hash = `/${lastView}`
}
