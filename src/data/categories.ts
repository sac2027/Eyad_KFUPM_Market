import type { Bi, CategoryId, Condition, Kind, Payment, RateUnit, ReportReason, Urgency } from '../lib/types'

export const CATEGORIES: { id: CategoryId; name: Bi; icon: string }[] = [
  { id: 'academic', name: { en: 'Academic and lab', ar: 'دراسة ومعامل' }, icon: 'Calculator' },
  { id: 'hardware', name: { en: 'Hardware and SDP', ar: 'قطع ومشاريع تخرج' }, icon: 'Cpu' },
  { id: 'dorm', name: { en: 'Dorm setup', ar: 'تجهيز السكن' }, icon: 'Lamp' },
  { id: 'mobility', name: { en: 'Bikes and scooters', ar: 'سياكل وسكوترات' }, icon: 'Bike' },
  { id: 'gaming', name: { en: 'Gaming', ar: 'قيمنق' }, icon: 'Gamepad2' },
  { id: 'sports', name: { en: 'Sports', ar: 'رياضة' }, icon: 'Trophy' },
  { id: 'camping', name: { en: 'Camping and kashta', ar: 'كشتات وعزبة' }, icon: 'Tent' },
  { id: 'services', name: { en: 'Skills and services', ar: 'مهارات وخدمات' }, icon: 'Wrench' },
]

export const categoryName = (id: CategoryId): Bi => CATEGORIES.find((c) => c.id === id)?.name ?? CATEGORIES[0].name

export const CONDITIONS: Record<Condition, Bi> = {
  new: { en: 'New', ar: 'جديد' },
  likeNew: { en: 'Like new', ar: 'شبه جديد' },
  good: { en: 'Good', ar: 'نظيف' },
  battle: { en: 'Battle-tested', ar: 'مستخدم وشغّال' },
}

export const KINDS: Record<Kind, Bi> = {
  sale: { en: 'For sale', ar: 'للبيع' },
  rent: { en: 'For rent', ar: 'للإيجار' },
  bundle: { en: 'Bundle', ar: 'باقة' },
  free: { en: 'Free', ar: 'لوجه الله' },
  service: { en: 'Service', ar: 'خدمة' },
  groupbuy: { en: 'Group buy', ar: 'طلبية جماعية' },
}

export const PAYMENTS: Record<Payment, Bi> = {
  stc: { en: 'STC Pay', ar: 'STC Pay' },
  bank: { en: 'Bank transfer', ar: 'تحويل بنكي' },
  cash: { en: 'Cash at meetup', ar: 'كاش عند التسليم' },
  barter: { en: 'Barter', ar: 'مقايضة' },
  free: { en: 'Free', ar: 'لوجه الله' },
}

export const RATE_UNITS: Record<RateUnit, { per: Bi; plural: Bi }> = {
  exam: { per: { en: 'per exam', ar: 'للاختبار' }, plural: { en: 'exam slot', ar: 'اختبار' } },
  hour: { per: { en: 'per hour', ar: 'للساعة' }, plural: { en: 'hour', ar: 'ساعة' } },
  day: { per: { en: 'per day', ar: 'لليوم' }, plural: { en: 'day', ar: 'يوم' } },
  weekend: { per: { en: 'per weekend', ar: 'للويكند' }, plural: { en: 'weekend', ar: 'ويكند' } },
  week: { per: { en: 'per week', ar: 'للأسبوع' }, plural: { en: 'week', ar: 'أسبوع' } },
}

export const URGENCY: Record<Urgency, Bi> = {
  emergency: { en: 'Exam today', ar: 'اختبار اليوم' },
  week: { en: 'This week', ar: 'هذا الأسبوع' },
  flexible: { en: 'Flexible', ar: 'مو مستعجل' },
}

export const COURSE_PREFIXES = ['MATH', 'PHYS', 'CHEM', 'ICS', 'COE', 'EE', 'ME', 'SWE', 'PREP', 'SDP']

/** College accent for a major tag. Used as a small dot only (DESIGN_SYSTEM.md §1.5). */
export const MAJOR_COLOR: Record<string, string> = {
  COE: '#6BBDBE',
  ICS: '#6BBDBE',
  SWE: '#6BBDBE',
  MATH: '#6BBDBE',
  EE: '#F58220',
  ME: '#F58220',
  AE: '#F58220',
  PHYS: '#F58220',
  CHE: '#F0BA4F',
  CHEM: '#F0BA4F',
  PETE: '#A31F34',
  ISE: '#004A81',
  PREP: '#3D3C7F',
}

export const REPORT_REASONS: Record<ReportReason, Bi> = {
  scam: { en: 'Looks like a scam', ar: 'يبدو احتيال' },
  prohibited: { en: 'Item not allowed on campus', ar: 'غرض ممنوع في الجامعة' },
  wrongInfo: { en: 'Wrong price or description', ar: 'سعر أو وصف غير صحيح' },
  noShow: { en: 'Did not show up to the meetup', ar: 'ما حضر موعد التسليم' },
  abuse: { en: 'Rude or abusive messages', ar: 'رسائل مسيئة' },
  other: { en: 'Something else', ar: 'شي ثاني' },
}
