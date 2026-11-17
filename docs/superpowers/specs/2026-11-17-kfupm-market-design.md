# KFUPM Market — design

## Intent
A campus peer-to-peer web app where KFUPM students buy, sell, rent, request, barter and pass on
essentials. It must feel built for KFUPM: course codes, dorm buildings, exam cycles, graduation
move-outs. It is a front-end demo with no backend and no payments.

## Goals
- Core engines: buy/sell, bundles, short-term rentals, urgent requests (ISO), Quick List studio.
- Campus modules: Finals mode, hardware co-op and group buys, skill exchange, Pass-It-On box,
  meetup zone explorer, deal drawer with rental countdowns.
- Trust: simulated `@kfupm.edu.sa` verification, persona switcher, reliability stats.
- Bilingual: instant EN (LTR) / العربية (RTL) with natural Saudi-campus Arabic.
- Everything persists in `localStorage`; one "Reset demo data" action restores the seed.

## Non-goals
Payments, wallets, real authentication, real messaging, server sync, dark mode.

## Anti-goals
- Looking like an official KFUPM service. No octagon, tower or seal; footer states it is student-built.
- Any in-app checkout. Money changes hands at the meetup; the app only records the agreed method.
- Real personal data. Seed people are fictional; WhatsApp numbers are `+966 50 000 XXXX` placeholders.

## Constraints
- Brand: `DESIGN_SYSTEM.md` is binding for color, type, matrix and logo rules.
- Static SPA: `npm run build` output deploys to any static host (hash routing, relative base).
- No network at runtime: fonts and brand media are self-hosted.

## Approaches considered
1. **One listing model with a `kind` field, one store** (chosen). Sale, rent, bundle, free, service and
   group-buy items share cards, filters, reserve flow and search. Less code, consistent behaviour.
2. Separate models and stores per module. Cleaner types per module, but six parallel card/detail/filter
   stacks and cross-module search become glue code.
3. Multi-page site per module. Simple pages, but loses the drawer-based flows the brief asks for.

## Decisions (builder's calls)
- Stack: Vite, React 19, TypeScript, Tailwind v4, zustand (persist), Base UI (dialog, drawer, tabs,
  select, menu, OTP), cmdk, Sonner, Motion, NumberFlow, Lucide.
- Date/time for rentals: native `datetime-local` inputs plus presets. The curated library list has no
  date picker; native inputs are accessible, RTL-safe and good on phones.
- Primary button is Turquoise with white text (7.3:1). Green with white is brand-approved but only
  3.6:1, so Green is kept for marks and large elements.
- IBM Plex Sans Arabic is self-hosted from the supplied files instead of Google Fonts, so the app
  works offline and sends no font requests to a third party.
- No product photos could be fetched (network policy). Listings without a photo show a drawn tile
  in brand colors; sellers can attach a photo in Quick List.
- App shell follows the "framed sheet" pattern: beige frame, white work sheet. Finals mode turns the
  frame Turquoise so the state is visible on every screen.
- Reserving and listing require a verified persona; browsing does not.

## Left to the builder
Component boundaries, seed copy, motion values (from the animate skill tables).
