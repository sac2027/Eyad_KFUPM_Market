export type Lang = 'en' | 'ar'
export type Bi = { en: string; ar: string }

export type Kind = 'sale' | 'rent' | 'bundle' | 'free' | 'service' | 'groupbuy'
export type CategoryId =
  | 'academic'
  | 'hardware'
  | 'dorm'
  | 'mobility'
  | 'gaming'
  | 'sports'
  | 'camping'
  | 'services'
export type Condition = 'new' | 'likeNew' | 'good' | 'battle'
export type Payment = 'stc' | 'bank' | 'cash' | 'barter' | 'free'
export type ListingStatus = 'available' | 'reserved' | 'rented' | 'completed'
export type ZoneId =
  | 'b59'
  | 'b63'
  | 'b4'
  | 'library'
  | 'b22'
  | 'mall'
  | 'dormA'
  | 'dormB'
  | 'mosque'
  | 'parking'
  | 'rec'
  | 'gate'
export type RateUnit = 'exam' | 'hour' | 'day' | 'weekend' | 'week'
export type Tone = 'turquoise' | 'green' | 'beige' | 'sand' | 'yellow' | 'blue'

export interface Rent {
  rates: Partial<Record<RateUnit, number>>
  deposit: number
  lateFeePerHour: number
  terms: Bi
}

export interface BundleItem {
  name: Bi
  price: number
}

export interface GroupBuy {
  unitPrice: number
  retailPrice: number
  target: number
  joined: { userId: string; qty: number }[]
  deadline: number
  supplier: string
}

export interface Listing {
  id: string
  kind: Kind
  title: Bi
  desc: Bi
  category: CategoryId
  course?: string
  condition: Condition
  /** SAR. 0 means free. For rent this is the lowest rate, for group buys the unit price. */
  price: number
  rent?: Rent
  bundle?: { items: BundleItem[] }
  specs?: { k: string; v: string }[]
  groupBuy?: GroupBuy
  service?: { unit: Bi; barterFor?: Bi }
  zone: ZoneId
  payment: Payment[]
  sellerId: string
  status: ListingStatus
  createdAt: number
  /** Seller can hand over within about 15 minutes. */
  instant?: boolean
  /** Dropped in the graduating seniors' Pass-It-On box. */
  passItOn?: boolean
  icon: string
  tone: Tone
  photo?: string
  /** Taken down by an admin. Only the seller and admins still see it. */
  hidden?: boolean
}

export type Urgency = 'emergency' | 'week' | 'flexible'

export interface Offer {
  id: string
  userId: string
  note: string
  listingId?: string
  createdAt: number
}

export interface IsoRequest {
  id: string
  title: Bi
  desc: Bi
  urgency: Urgency
  budget: number
  bounty: 'rent' | 'buy' | 'favor'
  neededBy: number
  zone: ZoneId
  course?: string
  category: CategoryId
  requesterId: string
  offers: Offer[]
  status: 'open' | 'fulfilled'
  createdAt: number
}

export type DealStatus = 'reserved' | 'rented' | 'completed' | 'cancelled'

export interface Deal {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  type: 'buy' | 'rent'
  zone: ZoneId
  meetAt: number
  returnAt?: number
  total: number
  deposit: number
  payment: Payment
  status: DealStatus
  createdAt: number
  /** The buyer endorsed the seller after the deal completed. */
  endorsed?: boolean
}

export interface User {
  id: string
  name: Bi
  major: string
  level: Bi
  bldg: number
  home: ZoneId
  verified: boolean
  graduating?: boolean
  role?: 'admin'
  /** Suspended by an admin: cannot list or reserve, and their listings are hidden. */
  suspended?: boolean
  whatsapp: string
  joined: number
  stats: { responseMins: number; deals: number; onTime: number; rentals: number; endorsements: number }
}

export type ReportReason = 'scam' | 'prohibited' | 'wrongInfo' | 'noShow' | 'abuse' | 'other'

export interface Report {
  id: string
  targetType: 'listing' | 'request' | 'user'
  targetId: string
  reason: ReportReason
  note: string
  reporterId: string
  createdAt: number
  status: 'open' | 'dismissed' | 'actioned'
  /** What the admin did, in plain words. */
  resolution?: Bi
  resolvedAt?: number
}

export interface Announcement {
  id: string
  text: Bi
  tone: 'info' | 'warning'
  createdAt: number
}

export interface AuditEntry {
  id: string
  at: number
  adminId: string
  action: Bi
  target: string
}
