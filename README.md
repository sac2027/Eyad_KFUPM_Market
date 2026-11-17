# KFUPM Market · سوق البترول

A campus peer-to-peer market for KFUPM students: buy, sell, rent, request, swap skills and pass things on.
Student-built demo. It is not an official KFUPM service.

The app has no backend and takes no payments. Everything is saved in the browser's `localStorage`,
and money changes hands in person at the meetup.

## Run it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run check
```

`npm run check` runs the logic tests, the linter and the production build. The build lands in `dist/`
and is a static site with relative paths and hash routing, so it deploys to Cloudflare Pages or any
static host as is.

## What is in it

| Area | What it does |
|---|---|
| Market | Sale items, bundles and free items with category, course, condition, zone, payment and price filters |
| Rentals | Per exam, hour, day, weekend or week. Pick pickup and return times; the fee and refundable deposit update live |
| Requests | Urgent needs with a bounty and deadline. "I have this" sends an offer and can attach one of your listings |
| Hardware co-op | Parts searchable by chip, interface or spec, plus group buys with a unit target and deadline |
| Skill exchange | Services priced per hour, session or job, with optional swaps |
| Pass-It-On box | Free items from graduating seniors |
| Meetup zones | Schematic campus map with listings per zone and estimated walking time |
| Quick List | One form for all seven post types, with presets and a price range suggestion |
| My deals | Reservations, handover steps, live rental return countdowns, late fees |

Also: instant English/Arabic switch (`Alt+L`), command palette (`Ctrl+K`), Finals mode,
demo personas, a simulated `@kfupm.edu.sa` verification (demo code `590059`), pre-filled WhatsApp
messages, and "Reset demo data" in the persona menu.

## Notes for developers

- `DESIGN_SYSTEM.md` holds the brand rules the UI follows.
- `src/lib` has the pure logic (rental quotes, price suggestions, formatting, WhatsApp messages).
- `src/store/useStore.ts` is the single persisted store. Unreadable saved data falls back to the seed.
- `/?data=worst` (or "Worst-case test data" in the persona menu) adds stress-test rows that are never saved.
- All people in the seed data are fictional. WhatsApp numbers are `+966 50 000 XXXX` placeholders.
- Listing tiles are drawn placeholders, not product photos. Sellers can attach a photo in Quick List.
