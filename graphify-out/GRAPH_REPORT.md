# Graph Report - src  (2026-11-17)

## Corpus Check
- Corpus is ~42,626 words - fits in a single context window. You may not need a graph.

## Summary
- 348 nodes · 2027 edges · 7 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Reserving, rentals and meetup zones
- App shell, routing and admin
- UI kit and listing grid
- Deals, requests and offers
- Quick List studio and matrix art
- Listing cards and group buys
- Reports, profiles and overlays

## God Nodes (most connected - your core abstractions)
1. `useT()` - 96 edges
2. `useStore` - 80 edges
3. `useL()` - 63 edges
4. `cn()` - 55 edges
5. `useUi` - 51 edges
6. `Button()` - 48 edges
7. `useLang()` - 43 edges
8. `usePersona()` - 40 edges
9. `Body()` - 36 edges
10. `sar()` - 32 edges

## Surprising Connections (you probably didn't know these)
- `useActiveDeals()` --calls--> `useStore`  [EXTRACTED]
  App.tsx → store/useStore.ts
- `DealsButton()` --calls--> `useT()`  [EXTRACTED]
  App.tsx → lib/i18n.ts
- `DealsButton()` --calls--> `useUi`  [EXTRACTED]
  App.tsx → store/useUi.ts
- `Sidebar()` --calls--> `Logo()`  [EXTRACTED]
  App.tsx → components/brand/Logo.tsx
- `Sidebar()` --calls--> `cn()`  [EXTRACTED]
  App.tsx → lib/cn.ts

## Import Cycles
- None detected.

## Communities (7 total, 0 thin omitted)

### Community 0 - "Reserving, rentals and meetup zones"
Cohesion: 0.06
Nodes (62): Zones, at(), nextHalfHour(), nextWeekend(), ReservePanel(), PAYMENTS, Draft, NO_FEES (+54 more)

### Community 1 - "App shell, routing and admin"
Cohesion: 0.08
Nodes (42): Admin, App(), CommandMenu, Coop, DealDrawer, DealsButton(), MobileNav(), OfferDrawer (+34 more)

### Community 2 - "UI kit and listing grid"
Cohesion: 0.16
Nodes (41): ListingGrid(), Button(), Props, Size, sizes, Variant, variants, Chip() (+33 more)

### Community 3 - "Deals, requests and offers"
Cohesion: 0.20
Nodes (42): Art(), Countdown(), DealCard(), DealDrawer(), SarText(), Form(), OfferDrawer(), Verified() (+34 more)

### Community 4 - "Quick List studio and matrix art"
Cohesion: 0.08
Nodes (38): MatrixBars(), TONE, CATEGORY_ICON, Draft, Form(), MODES, Preset, PRESETS (+30 more)

### Community 5 - "Listing cards and group buys"
Cohesion: 0.15
Nodes (32): Emblem(), Logo(), GroupBuyPanel(), ListingCard(), AdminTools(), Body(), ListingDetail(), OwnerTools() (+24 more)

### Community 6 - "Reports, profiles and overlays"
Cohesion: 0.17
Nodes (26): Form(), REASONS, ReportDialog(), Field(), Header(), Modal(), Props, Flow() (+18 more)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useT()` connect `Reports, profiles and overlays` to `Reserving, rentals and meetup zones`, `App shell, routing and admin`, `UI kit and listing grid`, `Deals, requests and offers`, `Quick List studio and matrix art`, `Listing cards and group buys`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `Reserving, rentals and meetup zones` be split into smaller, more focused modules?**
  _Cohesion score 0.06460206460206461 - nodes in this community are weakly interconnected._
- **Why does `useStore` connect `Reports, profiles and overlays` to `Reserving, rentals and meetup zones`, `App shell, routing and admin`, `UI kit and listing grid`, `Deals, requests and offers`, `Quick List studio and matrix art`, `Listing cards and group buys`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `App shell, routing and admin` be split into smaller, more focused modules?**
  _Cohesion score 0.07756813417190776 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `Listing cards and group buys` to `Reserving, rentals and meetup zones`, `App shell, routing and admin`, `UI kit and listing grid`, `Deals, requests and offers`, `Quick List studio and matrix art`, `Reports, profiles and overlays`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Should `Quick List studio and matrix art` be split into smaller, more focused modules?**
  _Cohesion score 0.07610993657505286 - nodes in this community are weakly interconnected._
- **Should `Listing cards and group buys` be split into smaller, more focused modules?**
  _Cohesion score 0.14709851551956815 - nodes in this community are weakly interconnected._