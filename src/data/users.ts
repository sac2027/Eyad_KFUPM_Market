import type { User } from '../lib/types'

const DAY = 86_400_000

/** Fictional students. WhatsApp numbers are placeholders in the +966 50 000 XXXX range. */
export function seedUsers(now: number): User[] {
  const u = (
    id: string,
    en: string,
    ar: string,
    major: string,
    levelEn: string,
    levelAr: string,
    bldg: number,
    n: number,
    stats: User['stats'],
    extra: Partial<User> = {},
  ): User => ({
    id,
    name: { en, ar },
    major,
    level: { en: levelEn, ar: levelAr },
    bldg,
    home: bldg <= 830 ? 'dormA' : 'dormB',
    verified: true,
    whatsapp: `96650000${String(n).padStart(4, '0')}`,
    joined: now - (120 + n * 3) * DAY,
    stats,
    ...extra,
  })
  return [
    u('eyad', 'Eyad Al-Harbi', 'إياد الحربي', 'COE', 'Senior', 'سنة رابعة', 838, 101, { responseMins: 6, deals: 23, onTime: 11, rentals: 11, endorsements: 14 }),
    u('faisal', 'Faisal Al-Qahtani', 'فيصل القحطاني', 'PREP', 'Prep year', 'تحضيري (أوريا)', 815, 102, { responseMins: 0, deals: 0, onTime: 0, rentals: 0, endorsements: 0 }, { verified: false }),
    u('omar', 'Omar Al-Ghamdi', 'عمر الغامدي', 'ME', 'Graduating senior', 'خريج هذا الترم', 845, 103, { responseMins: 12, deals: 31, onTime: 9, rentals: 9, endorsements: 22 }, { graduating: true }),
    u('abdullah', 'Abdullah Al-Dossari', 'عبدالله الدوسري', 'EE', 'Junior', 'سنة ثالثة', 842, 104, { responseMins: 4, deals: 18, onTime: 15, rentals: 16, endorsements: 12 }),
    u('khalid', 'Khalid Al-Otaibi', 'خالد العتيبي', 'ICS', 'Sophomore', 'سنة ثانية', 820, 105, { responseMins: 15, deals: 7, onTime: 4, rentals: 4, endorsements: 3 }),
    u('yousef', 'Yousef Al-Zahrani', 'يوسف الزهراني', 'SWE', 'Senior', 'سنة رابعة', 851, 106, { responseMins: 9, deals: 14, onTime: 6, rentals: 6, endorsements: 9 }),
    u('saud', 'Saud Al-Mutairi', 'سعود المطيري', 'PETE', 'Junior', 'سنة ثالثة', 826, 107, { responseMins: 25, deals: 9, onTime: 7, rentals: 8, endorsements: 5 }),
    u('turki', 'Turki Al-Shehri', 'تركي الشهري', 'ME', 'Sophomore', 'سنة ثانية', 833, 108, { responseMins: 18, deals: 5, onTime: 3, rentals: 3, endorsements: 2 }),
    u('nawaf', 'Nawaf Al-Shammari', 'نواف الشمري', 'CHE', 'Graduating senior', 'خريج هذا الترم', 847, 109, { responseMins: 8, deals: 20, onTime: 12, rentals: 12, endorsements: 11 }, { graduating: true }),
    u('rayan', 'Rayan Bukhari', 'ريان بخاري', 'AE', 'Junior', 'سنة ثالثة', 829, 110, { responseMins: 11, deals: 12, onTime: 10, rentals: 10, endorsements: 8 }),
    u('majed', 'Majed Al-Anazi', 'ماجد العنزي', 'ISE', 'Senior', 'سنة رابعة', 836, 111, { responseMins: 30, deals: 4, onTime: 2, rentals: 2, endorsements: 1 }),
  ]
}

export const PERSONAS = ['eyad', 'faisal', 'omar'] as const
