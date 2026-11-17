# KFUPM Market Implementation Plan

**Goal:** Ship the full KFUPM Market SPA described in the spec, verified in a browser at desktop and phone widths.

**Architecture:** One zustand store (persisted) holds listings, requests, deals, users and UI prefs.
Views read the store through selectors; pure functions in `src/lib` do pricing, rental quotes,
formatting and WhatsApp links. Hash routing keeps the build host-agnostic.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind v4, zustand, Base UI, cmdk, Sonner, Motion, NumberFlow, Lucide.

**Spec:** `docs/superpowers/specs/2026-11-17-kfupm-market-design.md`, `DESIGN_SYSTEM.md`

## Global Constraints
- Colors only from `DESIGN_SYSTEM.md` §1; text pairs only from §1.7.
- Headings in KFUPM Display, everything else in IBM Plex Sans Arabic.
- Logical CSS properties only (`ms-*`, `pe-*`, `start-*`, `text-start`).
- All money in SAR, Western digits in both languages.
- No payment UI. No real names or phone numbers.

## Review Focus
1. Very long Arabic/English titles and course names must wrap or clamp without breaking cards.
2. Free (0 SAR) and 10,000+ SAR prices must format and sort correctly.
3. A rental with return before pickup, or zero duration, must show an error and block reserving.
4. Switching language or persona mid-flow (drawer open) must not lose state or mis-mirror layout.
5. Corrupt or old `localStorage` must fall back to the seed instead of crashing.

## Tasks
1. **Foundation** — `src/index.css` tokens and fonts, `src/lib/{types,i18n,format,router,cn}.ts`.
   Check: `npm run build` passes.
2. **Domain logic** — `src/lib/{pricing,rental,whatsapp}.ts` with `quoteRental(rates, start, end)`,
   `suggestPrice(category, condition, listings)`, `whatsappLink(user, text)`.
   Check: `node --test` style assertions run via `npm run check:logic`.
3. **Data and store** — `src/data/{users,zones,categories,seed}.ts`, `src/store/useStore.ts`
   (actions: reserve, confirmHandover, markReturned, complete, cancel, addListing, addRequest,
   addOffer, joinGroupBuy, toggleFavorite, verify, setLang, setPersona, setFinals, reset).
4. **UI kit and shell** — `components/ui/*`, `components/brand/*`, `components/shell/*`.
5. **Listings** — card, filters, detail drawer, reserve flow, rental calculator, bundle view.
6. **Modules** — Requests, Co-op, Skills, Pass-It-On, Zones views.
7. **Studio, deals, verify** — Quick List, Deal drawer with countdowns, verification modal.
8. **Harden** — worst-case data toggle, accessibility pass, Playwright runs at 1440 and 390, build.
