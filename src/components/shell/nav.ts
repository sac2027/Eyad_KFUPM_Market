import { Cpu, Gift, Handshake, type LucideIcon, Map, Megaphone, Store, Timer } from 'lucide-react'
import type { ViewId } from '../../lib/router'
import type { Bi } from '../../lib/types'

export const NAV: { id: ViewId; label: Bi; icon: LucideIcon; blurb: Bi }[] = [
  { id: 'market', label: { en: 'Market', ar: 'السوق' }, icon: Store, blurb: { en: 'Buy, bundles and free items', ar: 'شراء وباقات وأغراض مجانية' } },
  { id: 'rent', label: { en: 'Rentals', ar: 'الإيجار' }, icon: Timer, blurb: { en: 'By the exam, hour, day or week', ar: 'بالاختبار أو الساعة أو اليوم أو الأسبوع' } },
  { id: 'requests', label: { en: 'Requests', ar: 'الطلبات' }, icon: Megaphone, blurb: { en: 'Urgent needs and bounties', ar: 'احتياجات عاجلة ومكافآت' } },
  { id: 'coop', label: { en: 'Hardware co-op', ar: 'تعاونية القطع' }, icon: Cpu, blurb: { en: 'SDP parts and group buys', ar: 'قطع مشاريع التخرج والطلبيات الجماعية' } },
  { id: 'skills', label: { en: 'Skill exchange', ar: 'تبادل المهارات' }, icon: Handshake, blurb: { en: 'Services and swaps', ar: 'خدمات ومقايضات' } },
  { id: 'passiton', label: { en: 'Pass-It-On box', ar: 'صندوق الخريجين' }, icon: Gift, blurb: { en: 'Free from graduating seniors', ar: 'مجانًا من الخريجين' } },
  { id: 'zones', label: { en: 'Meetup zones', ar: 'أماكن التسليم' }, icon: Map, blurb: { en: 'Where handovers happen', ar: 'وين يصير التسليم' } },
]
