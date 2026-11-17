import type { Bi, ZoneId } from '../lib/types'

export type Belt = 'academic' | 'housing' | 'hubs'

export interface Zone {
  id: ZoneId
  name: Bi
  short: Bi
  belt: Belt
  hint: Bi
  /** Position on the schematic map, 0-100 by 0-64. Not to scale. */
  x: number
  y: number
}

export const BELTS: Record<Belt, Bi> = {
  academic: { en: 'Academic belt', ar: 'الجبل' },
  housing: { en: 'Student housing', ar: 'سكن الطلاب' },
  hubs: { en: 'Gates and hubs', ar: 'البوابات والمراكز' },
}

export const ZONES: Zone[] = [
  { id: 'b59', belt: 'academic', x: 30, y: 14, name: { en: 'Bldg 59 · Computing and Engineering', ar: 'مبنى 59 · الحاسب والهندسة' }, short: { en: 'Bldg 59', ar: 'مبنى 59' }, hint: { en: 'Ground-floor lobby by the vending machines', ar: 'اللوبي الأرضي عند مكائن البيع' } },
  { id: 'b63', belt: 'academic', x: 44, y: 9, name: { en: 'Bldg 63', ar: 'مبنى 63' }, short: { en: 'Bldg 63', ar: 'مبنى 63' }, hint: { en: 'Main entrance steps', ar: 'درج المدخل الرئيسي' } },
  { id: 'b4', belt: 'academic', x: 58, y: 12, name: { en: 'Bldg 4', ar: 'مبنى 4' }, short: { en: 'Bldg 4', ar: 'مبنى 4' }, hint: { en: 'Lecture hall corridor', ar: 'ممر القاعات' } },
  { id: 'library', belt: 'academic', x: 49, y: 21, name: { en: 'Central Library', ar: 'المكتبة المركزية' }, short: { en: 'Library', ar: 'المكتبة' }, hint: { en: 'Front desk, before the gates', ar: 'عند الاستقبال قبل البوابات' } },
  { id: 'b22', belt: 'academic', x: 68, y: 18, name: { en: 'Bldg 22 / 24', ar: 'مبنى 22 / 24' }, short: { en: 'Bldg 22/24', ar: 'مبنى 22/24' }, hint: { en: 'Shaded walkway between the two', ar: 'الممر المظلل بين المبنيين' } },
  { id: 'mall', belt: 'housing', x: 46, y: 44, name: { en: 'Student Mall', ar: 'المول الطلابي' }, short: { en: 'Student Mall', ar: 'المول الطلابي' }, hint: { en: 'Seating area by the coffee shop', ar: 'الجلسات عند الكوفي' } },
  { id: 'dormA', belt: 'housing', x: 24, y: 50, name: { en: 'Dorm Zone A · Bldgs 813–830', ar: 'سكن أ · مباني 813–830' }, short: { en: 'Dorms A', ar: 'سكن أ' }, hint: { en: 'Building entrance, ground floor', ar: 'مدخل المبنى، الدور الأرضي' } },
  { id: 'dormB', belt: 'housing', x: 68, y: 52, name: { en: 'Dorm Zone B · Bldgs 831–855', ar: 'سكن ب · مباني 831–855' }, short: { en: 'Dorms B', ar: 'سكن ب' }, hint: { en: 'Building entrance, ground floor', ar: 'مدخل المبنى، الدور الأرضي' } },
  { id: 'mosque', belt: 'housing', x: 38, y: 55, name: { en: 'Mosque courtyards', ar: 'ساحات المسجد' }, short: { en: 'Mosque', ar: 'المسجد' }, hint: { en: 'After prayer, by the main door', ar: 'بعد الصلاة عند الباب الرئيسي' } },
  { id: 'parking', belt: 'housing', x: 58, y: 38, name: { en: 'Multi-storey parking', ar: 'المواقف متعددة الأدوار' }, short: { en: 'Parking', ar: 'المواقف' }, hint: { en: 'Ground level, pedestrian exit', ar: 'الدور الأرضي عند مخرج المشاة' } },
  { id: 'rec', belt: 'hubs', x: 84, y: 34, name: { en: 'Student Recreation Center · Bldg 11 / 39', ar: 'مركز الترفيه الطلابي · مبنى 11 / 39' }, short: { en: 'Rec Center', ar: 'الترفيهي' }, hint: { en: 'Reception desk', ar: 'عند الاستقبال' } },
  { id: 'gate', belt: 'hubs', x: 10, y: 32, name: { en: 'Main Gate', ar: 'البوابة الرئيسية' }, short: { en: 'Main Gate', ar: 'البوابة الرئيسية' }, hint: { en: 'Visitor parking, inside the gate', ar: 'مواقف الزوار داخل البوابة' } },
]

export const zoneById = (id: ZoneId): Zone => ZONES.find((z) => z.id === id) ?? ZONES[0]

/** Rough walking time between two zones on the schematic. An estimate, not a measurement. */
export function walkMinutes(a: ZoneId, b: ZoneId): number {
  if (a === b) return 2
  const A = zoneById(a)
  const B = zoneById(b)
  const d = Math.hypot(A.x - B.x, A.y - B.y)
  // Crossing between the hill and housing adds the climb.
  const climb = (A.belt === 'academic') !== (B.belt === 'academic') ? 3 : 0
  return Math.max(3, Math.round(d * 0.32 + climb))
}
