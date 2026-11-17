# Graph Report - src  (2026-11-17)

## Corpus Check
- Corpus is ~33,518 words - fits in a single context window. You may not need a graph.

## Summary
- 302 nodes · 1645 edges · 6 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Brand art and shell chrome
- App shell and routing
- Quick List studio
- Deals, requests and offers
- UI kit and listing grid
- Seed data and domain types

## God Nodes (most connected - your core abstractions)
1. `useT()` - 72 edges
2. `useStore` - 57 edges
3. `useL()` - 48 edges
4. `cn()` - 45 edges
5. `useUi` - 40 edges
6. `Button()` - 34 edges
7. `Body()` - 33 edges
8. `useLang()` - 32 edges
9. `usePersona()` - 29 edges
10. `sar()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `useActiveDeals()` --calls--> `useStore`  [EXTRACTED]
  App.tsx → store/useStore.ts
- `DealsButton()` --calls--> `useT()`  [EXTRACTED]
  App.tsx → lib/i18n.ts
- `DealsButton()` --calls--> `useUi`  [EXTRACTED]
  App.tsx → store/useUi.ts
- `TopBar()` --calls--> `useUi`  [EXTRACTED]
  App.tsx → store/useUi.ts
- `MobileNav()` --calls--> `cn()`  [EXTRACTED]
  App.tsx → lib/cn.ts

## Import Cycles
- None detected.

## Communities (6 total, 0 thin omitted)

### Community 0 - "Brand art and shell chrome"
Cohesion: 0.13
Nodes (45): Sidebar(), TopBar(), Art(), MatrixBars(), TONE, Emblem(), Logo(), ListingCard() (+37 more)

### Community 1 - "App shell and routing"
Cohesion: 0.07
Nodes (38): App(), CommandMenu, Coop, DealDrawer, DealsButton(), MobileNav(), OfferDrawer, Overlays() (+30 more)

### Community 2 - "Quick List studio"
Cohesion: 0.08
Nodes (43): CATEGORY_ICON, Draft, MODES, Preset, PRESETS, SERVICE_UNITS, shrink(), TONES (+35 more)

### Community 3 - "Deals, requests and offers"
Cohesion: 0.16
Nodes (39): Requests, Countdown(), DealCard(), DealDrawer(), SarText(), Form(), OfferDrawer(), GroupBuyPanel() (+31 more)

### Community 4 - "UI kit and listing grid"
Cohesion: 0.19
Nodes (38): ListingGrid(), Button(), Props, Size, sizes, Variant, variants, Chip() (+30 more)

### Community 5 - "Seed data and domain types"
Cohesion: 0.08
Nodes (39): Draft, NO_FEES, seedDeals(), seedListings(), seedRequests(), TONES, PERSONAS, seedUsers() (+31 more)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useT()` connect `Brand art and shell chrome` to `App shell and routing`, `Quick List studio`, `Deals, requests and offers`, `UI kit and listing grid`, `Seed data and domain types`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `Brand art and shell chrome` be split into smaller, more focused modules?**
  _Cohesion score 0.12844611528822056 - nodes in this community are weakly interconnected._
- **Why does `useStore` connect `Seed data and domain types` to `Brand art and shell chrome`, `App shell and routing`, `Quick List studio`, `Deals, requests and offers`, `UI kit and listing grid`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `App shell and routing` be split into smaller, more focused modules?**
  _Cohesion score 0.07372549019607844 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `Brand art and shell chrome` to `App shell and routing`, `Quick List studio`, `Deals, requests and offers`, `UI kit and listing grid`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Should `Quick List studio` be split into smaller, more focused modules?**
  _Cohesion score 0.08163265306122448 - nodes in this community are weakly interconnected._
- **Should `Seed data and domain types` be split into smaller, more focused modules?**
  _Cohesion score 0.08325624421831637 - nodes in this community are weakly interconnected._