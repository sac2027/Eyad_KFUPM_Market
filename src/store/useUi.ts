import { create } from 'zustand'
import type { Kind } from '../lib/types'

export type StudioMode = Kind | 'request'

interface Ui {
  studio: { open: boolean; mode: StudioMode }
  deals: boolean
  command: boolean
  verify: boolean
  offerFor: string | null
  profileId: string | null
  reportTarget: { type: 'listing' | 'request' | 'user'; id: string } | null
  /** What to do once the persona is verified. */
  afterVerify: (() => void) | null
  openStudio: (mode?: StudioMode) => void
  closeStudio: () => void
  setDeals: (open: boolean) => void
  setCommand: (open: boolean) => void
  setVerify: (open: boolean, after?: () => void) => void
  setOfferFor: (id: string | null) => void
  setProfile: (id: string | null) => void
  setReportTarget: (t: Ui['reportTarget']) => void
}

export const useUi = create<Ui>((set) => ({
  studio: { open: false, mode: 'sale' },
  deals: false,
  command: false,
  verify: false,
  offerFor: null,
  profileId: null,
  reportTarget: null,
  afterVerify: null,
  openStudio: (mode = 'sale') => set({ studio: { open: true, mode } }),
  closeStudio: () => set((s) => ({ studio: { ...s.studio, open: false } })),
  setDeals: (deals) => set({ deals }),
  setCommand: (command) => set({ command }),
  setVerify: (verify, after) => set({ verify, afterVerify: verify ? (after ?? null) : null }),
  setOfferFor: (offerFor) => set({ offerFor }),
  setProfile: (profileId) => set({ profileId }),
  setReportTarget: (reportTarget) => set({ reportTarget }),
}))
