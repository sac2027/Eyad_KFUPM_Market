import { PAYMENTS } from '../data/categories'
import { zoneById } from '../data/zones'
import { dayTime, sar } from './format'
import { pick } from './i18n'
import type { Deal, IsoRequest, Lang, Listing, User } from './types'

export function waLink(user: User, text: string): string {
  return `https://wa.me/${user.whatsapp}?text=${encodeURIComponent(text)}`
}

/** "+966 50 000 0101" for display. */
export function prettyPhone(digits: string): string {
  const m = digits.match(/^966(\d{2})(\d{3})(\d{4})$/)
  return m ? `+966 ${m[1]} ${m[2]} ${m[3]}` : `+${digits}`
}

interface MeetupDraft {
  zone: Deal['zone']
  meetAt: number
  returnAt?: number
  total: number
  deposit: number
  payment: Deal['payment']
}

export function dealMessage(listing: Listing, d: MeetupDraft, buyer: User, lang: Lang): string {
  const zone = pick(zoneById(d.zone).name, lang)
  const title = pick(listing.title, lang)
  const pay = pick(PAYMENTS[d.payment], lang)
  const fee = d.total - d.deposit
  if (lang === 'ar') {
    const lines = [`السلام عليكم، معك ${buyer.name.ar} من سوق البترول.`]
    if (listing.kind === 'rent') {
      lines.push(`أبغى أستأجر: ${title}`)
      lines.push(`الاستلام: ${dayTime(d.meetAt, lang)}`)
      if (d.returnAt) lines.push(`الإرجاع: ${dayTime(d.returnAt, lang)}`)
      lines.push(`الإيجار: ${sar(fee, lang)} + تأمين مسترد ${sar(d.deposit, lang)}`)
    } else {
      lines.push(`حجزت: ${title}`)
      lines.push(listing.price === 0 ? 'السعر: لوجه الله' : `السعر: ${sar(fee, lang)}`)
      lines.push(`الموعد: ${dayTime(d.meetAt, lang)}`)
    }
    lines.push(`المكان: ${zone}`)
    lines.push(`الدفع: ${pay}`)
    lines.push('يناسبك الموعد؟')
    return lines.join('\n')
  }
  const lines = [`Salam, this is ${buyer.name.en} from KFUPM Market.`]
  if (listing.kind === 'rent') {
    lines.push(`I'd like to rent: ${title}`)
    lines.push(`Pickup: ${dayTime(d.meetAt, lang)}`)
    if (d.returnAt) lines.push(`Return: ${dayTime(d.returnAt, lang)}`)
    lines.push(`Rental: ${sar(fee, lang)} + ${sar(d.deposit, lang)} refundable deposit`)
  } else {
    lines.push(`I reserved: ${title}`)
    lines.push(listing.price === 0 ? 'Price: free' : `Price: ${sar(fee, lang)}`)
    lines.push(`Meetup: ${dayTime(d.meetAt, lang)}`)
  }
  lines.push(`Where: ${zone}`)
  lines.push(`Payment: ${pay}`)
  lines.push('Does that time work for you?')
  return lines.join('\n')
}

export function offerMessage(req: IsoRequest, helper: User, note: string, attached: Listing | undefined, lang: Lang): string {
  const title = pick(req.title, lang)
  if (lang === 'ar') {
    return [
      `السلام عليكم، معك ${helper.name.ar} من سوق البترول.`,
      `شفت طلبك: ${title}`,
      attached ? `عندي: ${pick(attached.title, lang)}` : 'أقدر أساعدك.',
      note,
      `أقرب مكان لي: ${pick(zoneById(req.zone).name, lang)}`,
    ]
      .filter(Boolean)
      .join('\n')
  }
  return [
    `Salam, this is ${helper.name.en} from KFUPM Market.`,
    `I saw your request: ${title}`,
    attached ? `I have: ${pick(attached.title, lang)}` : 'I can help.',
    note,
    `I can meet at: ${pick(zoneById(req.zone).name, lang)}`,
  ]
    .filter(Boolean)
    .join('\n')
}
