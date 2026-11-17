import assert from 'node:assert/strict'
import { test } from 'node:test'
import { suggestPrice, verdict } from '../src/lib/pricing.ts'
import { lowestRate, quoteRental } from '../src/lib/rental.ts'
import type { Rent } from '../src/lib/types.ts'

const H = 3_600_000
const terms = { en: '', ar: '' }
// Tuesday 17 Nov 2026, 09:00 local
const T0 = new Date(2026, 10, 17, 9, 0).getTime()

test('exam slot beats the daily rate inside 4 hours', () => {
  const rent: Rent = { rates: { exam: 15, day: 25 }, deposit: 60, lateFeePerHour: 5, terms }
  const q = quoteRental(rent, T0, T0 + 3 * H)
  assert.equal(q.ok, true)
  assert.equal(q.fee, 15)
  assert.equal(q.total, 75)
  assert.deepEqual(q.lines, [{ unit: 'exam', qty: 1, rate: 15 }])
})

test('partial days round up', () => {
  const rent: Rent = { rates: { day: 20 }, deposit: 100, lateFeePerHour: 5, terms }
  assert.equal(quoteRental(rent, T0, T0 + 25 * H).fee, 40)
})

test('picks the cheapest of hourly, daily and weekly', () => {
  const rent: Rent = { rates: { hour: 10, day: 35, week: 120 }, deposit: 150, lateFeePerHour: 10, terms }
  assert.equal(quoteRental(rent, T0, T0 + 2 * H).fee, 20) // 2 hours
  assert.equal(quoteRental(rent, T0, T0 + 6 * H).fee, 35) // a day is cheaper than 6 hours
  assert.equal(quoteRental(rent, T0, T0 + 5 * 24 * H).fee, 120) // a week is cheaper than 5 days
  assert.equal(quoteRental(rent, T0, T0 + 9 * 24 * H).fee, 190) // 1 week + 2 days
})

test('weekend rate applies only when the window touches Friday or Saturday', () => {
  const rent: Rent = { rates: { day: 70, weekend: 120 }, deposit: 200, lateFeePerHour: 10, terms }
  const thu5pm = new Date(2026, 10, 19, 17, 0).getTime()
  assert.equal(quoteRental(rent, thu5pm, thu5pm + 51 * H).fee, 120)
  // Tuesday to Thursday morning: no weekend, so 2 days
  assert.equal(quoteRental(rent, T0, T0 + 47 * H).fee, 140)
})

test('rejects a return before pickup and a window under 30 minutes', () => {
  const rent: Rent = { rates: { day: 20 }, deposit: 50, lateFeePerHour: 5, terms }
  assert.deepEqual([quoteRental(rent, T0, T0 - H).ok, quoteRental(rent, T0, T0 - H).error], [false, 'order'])
  assert.equal(quoteRental(rent, T0, T0).error, 'order')
  assert.equal(quoteRental(rent, T0, T0 + 10 * 60_000).error, 'short')
  assert.equal(quoteRental(rent, NaN, T0).ok, false)
})

test('an exam-only rental longer than a slot charges per slot', () => {
  const rent: Rent = { rates: { exam: 10 }, deposit: 30, lateFeePerHour: 3, terms }
  assert.equal(quoteRental(rent, T0, T0 + 7 * H).fee, 20)
})

test('lowestRate returns the cheapest offered unit', () => {
  assert.deepEqual(lowestRate({ rates: { day: 90, weekend: 160, week: 380 }, deposit: 0, lateFeePerHour: 0, terms }), { unit: 'day', rate: 90 })
})

test('price suggestions stay ordered and react to condition', () => {
  const likeNew = suggestPrice('academic', 'likeNew', 'sale', [])
  const worn = suggestPrice('academic', 'battle', 'sale', [])
  assert.ok(likeNew.low < likeNew.high)
  assert.ok(worn.high < likeNew.high)
  assert.equal(verdict(likeNew.low, likeNew), 'fair')
  assert.equal(verdict(1, likeNew), 'low')
  assert.equal(verdict(likeNew.high * 3, likeNew), 'high')
  const rent = suggestPrice('dorm', 'good', 'rent', [])
  assert.ok(rent.low >= 5 && rent.high > rent.low)
})
