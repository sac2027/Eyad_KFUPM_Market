# KFUPM Market — Design System

Source: KFUPM Brand Guidelines v1.2 (Jun 2026), the KFUPM Visual Identity package (SVG matrix elements, seal PNG, Self-Design Guide), and the KFUPM Fonts package (KFUPM Display + IBM Plex Sans Arabic).

This file has three kinds of content. Each section is labelled:

- **[Brand]**: stated in the KFUPM guidelines. Treat as binding.
- **[Derived]**: our mapping of brand colors to UI roles. The guidelines don't define these roles.
- **[Proposed]**: a recommendation the guidelines don't cover. Needs your approval before Phase 1 relies on it.

---

## 0. Open items and source discrepancies

Resolve these before Phase 1 relies on them.

1. **Yellow RGB mismatch.** Guidelines list Yellow as `RGB 240-186-69` and `HEX F0BA4F`. F0BA4F is `240-186-79`. This file uses the **HEX** value (`#F0BA4F`), because it matches the SVG/brand palette.
2. **Sand RGB mismatch.** Web palette lists Sand as `RGB 164-138-112`. Primary palette lists `RGB 170-140-109` with `HEX AA8C6D`, which matches. This file uses `#AA8C6D`.
3. **Truncated hex values in the PDF.** White is printed as `FFFFF` and Black as `00000`. This file uses `#FFFFFF` and `#000000`, which match the RGB values.
4. **KFUPM Display license.** The guidelines offer it as a download for brand use. Confirm the license allows **web embedding** before it ships in the app.
5. **No vector logo supplied.** The package has `KFUPM-Seal.png` (4300×4300) and two matrix SVGs. There is no vector primary logo. See Section 5.
6. **Pages not fully read.** Layout guidance for web, applications, and the seal (pp. 38–40) is incomplete in this document. Read these before Phase 1 if you want the official rules, not our derivations.
7. **Official mark vs. app mark.** The brief asks for a custom "KFUPM Market" wordmark. The guidelines prohibit recreating or altering the KFUPM logo (p. 32). See Section 5.3 for the proposed approach.

---

## 1. Color tokens

### 1.1 Primary palette [Brand] (p. 53, 61)

| Token | Name | HEX | RGB | CMYK | Pantone | Role (brand) |
|---|---|---|---|---|---|---|
| `--kfupm-turquoise` | KFUPM Turquoise | `#115F66` | 17 95 102 | 86 24 33 43 | 5473 C | Dominant. Primary surface and headline color. |
| `--kfupm-green` | KFUPM Green | `#009767` | 0 151 103 | 84 16 76 3 | 7724 C | Dominant. Accent and calls to action. |
| `--kfupm-beige` | KFUPM Beige | `#ECE0C7` | 236 224 199 | 7 10 22 0 | Warm Gray 1C | Dominant. Light surfaces. |

Primary colors "should be the dominant elements in all branded materials."

### 1.2 Accent palette [Brand] (p. 53, 61)

| Token | Name | HEX | RGB | Pantone |
|---|---|---|---|---|
| `--kfupm-sand` | Sand | `#AA8C6D` | 170 140 109 | 2471 C |
| `--kfupm-yellow` | Yellow | `#F0BA4F` | 240 186 79 (see §0.1) | 4023 C |
| `--kfupm-blue` | Blue | `#71B8D4` | 113 184 212 | 2915 C |

### 1.3 Neutrals [Brand] (p. 53, 61)

| Token | Name | HEX | RGB | Pantone |
|---|---|---|---|---|
| `--kfupm-white` | White | `#FFFFFF` | 255 255 255 | — |
| `--kfupm-gray` | Gray | `#ADACAD` | 173 172 173 | Cool Gray 7C |
| `--kfupm-black` | Black | `#000000` | 0 0 0 | Black 3C |

### 1.4 Feedback colors [Brand] (p. 61, web palette)

| Token | Role | HEX | RGB |
|---|---|---|---|
| `--kfupm-success` | Success | `#2AA880` | 42 168 128 |
| `--kfupm-error` | Error | `#DE5E5E` | 222 94 94 |
| `--kfupm-warning` | Warning | `#F2C56C` | 242 197 108 |
| `--kfupm-info` | Informative | `#89C4DB` | 137 196 219 |

The guidelines do not state contrast results for these. Verify any text placed on them before use. Use dark text (Black or Turquoise) on the light ones.

### 1.5 College colors [Brand, restricted] (pp. 55–56, 58)

| College | HEX |
|---|---|
| General Studies | `#3D3C7F` |
| Business School | `#004A81` |
| Design & Built Environment | `#8D5035` |
| Chemicals & Materials | `#F0BA4F` |
| Petroleum Engineering & Geosciences | `#A31F34` |
| Computing & Mathematics | `#6BBDBE` |
| Engineering & Physics | `#F58220` |

Rules from the guidelines: college colors are accents only. Use them with the primary palette, never alone. Never use two college colors in the same design. The guidelines reserve them for internal events and college materials.

**[Proposed]** Do not use college colors anywhere in the marketplace UI. The exception would be a course or college filter, and only if you approve it.

### 1.6 Extra colors [Brand, restricted] (p. 56)

`#7577B8`, `#B9DB9F`, `#F06861`. Not part of the core system. Do not use them in the app.

### 1.7 Approved text-on-background pairs [Brand] (p. 54)

Background in rows, text in columns. "Pass" means AA-approved. "Large" means large text only.

| Background | Approved text (all sizes) | Large text only |
|---|---|---|
| KFUPM Turquoise `#115F66` | White, KFUPM Beige, Yellow | KFUPM Green, Sand, Blue |
| KFUPM Green `#009767` | White, Black | KFUPM Turquoise, KFUPM Beige |
| KFUPM Beige `#ECE0C7` | KFUPM Turquoise, KFUPM Green, Black | Sand |
| Sand `#AA8C6D` | White | KFUPM Beige, Yellow, Black |
| Yellow `#F0BA4F` | KFUPM Turquoise, Black | White |
| Blue `#71B8D4` | White, KFUPM Turquoise, Black | — |
| Gray `#ADACAD` | White, KFUPM Turquoise, Black | — |

**Not approved (fails on p. 54):** any pair not listed above. Examples: Yellow text on Beige, Gray, Blue, or Green; Gray text on Turquoise, Beige, or Green; White text on Beige or Yellow (large only on Yellow); Green text on Sand or Yellow.

Check p. 54 before using a pair that is not in this table.

**[Proposed] Single-purpose rule.** Use Turquoise-on-Beige, Beige-on-Turquoise, and Black-on-Beige for all body and UI text. Reserve Green for primary buttons with White text. Use Yellow only for large highlights (badges and large headlines) with Turquoise or Black text.

### 1.8 Derived UI roles [Derived]

| Role | Light mode | Dark mode |
|---|---|---|
| Page background | `--kfupm-beige` | `--kfupm-turquoise` |
| Surface (cards) | `--kfupm-white` | `#0E4F55` (a darker Turquoise step, see §1.9) |
| Primary text | `--kfupm-turquoise` on Beige (AA), `--kfupm-black` on White | `--kfupm-beige` on Turquoise |
| Secondary text | `--kfupm-turquoise` at reduced opacity | `--kfupm-beige` at reduced opacity |
| Primary button | `--kfupm-green` background, White text | `--kfupm-green` background, White text |
| Secondary button | Turquoise outline, Turquoise text | Beige outline, Beige text |
| Highlight badge (e.g., "Free / لوجه الله") | `--kfupm-yellow` background, Turquoise text, large or bold only | same |
| Hairline border | `--kfupm-gray` at 40% opacity | `--kfupm-beige` at 20% opacity |
| Focus ring | `--kfupm-green`, 2px offset | `--kfupm-yellow`, 2px offset |
| Success / error / warning / info | the §1.4 values (dark text on them) | same |

Verify the Turquoise-on-White pair. p. 54 does not show a White background row, so this pair is not explicitly approved.

### 1.9 Tints and shades [Proposed]

The brand publishes no tints. The only derived step is `#0E4F55` for dark-mode surfaces. Get approval before adding more. Limit the palette to the brand values in §1.1–1.4.

---

## 2. Typography

### 2.1 Typefaces [Brand] (pp. 63–71)

| Role | Typeface | Weights | Files (from KFUPM Fonts package) | Use |
|---|---|---|---|---|
| Display / headings | **KFUPM Display** (Arabic-Latin) | Regular 400, Bold 700, Black 900 | `KFUPM-Regular.ttf`, `KFUPM-Bold.ttf`, `KFUPM-Black.ttf` (family name `KFUPM`) | Headlines, subheadings, bold statements, key messages |
| Body | **IBM Plex Sans Arabic** | Thin 100, ExtraLight 200, Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700 | `IBMPlexSansArabic-*.ttf` (OFL license included) | All body copy, UI labels, forms, long passages |
| Fallback | **Segoe UI** | — | system | Only when the primary typefaces are unavailable |

Guideline limits:
- KFUPM Display is for "large headlines, impactful statements, and key messages." Do not use it in body text. It "may compromise readability in smaller sizes."
- IBM Plex Sans Arabic is for body text. Do not use it for headlines.
- Do not use Segoe UI as the fallback unless the primary typefaces fail to load.

### 2.2 Arabic and English rules [Brand]

- Both scripts use the same typeface per role. KFUPM Display covers Arabic and English. IBM Plex Sans Arabic covers both.
- Arabic headlines use KFUPM Display, the same as English headlines. Arabic body copy uses IBM Plex Sans Arabic.
- Digits: the guidelines show Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) in both typefaces. **[Proposed]** Use Western numerals for SAR amounts and dates unless you decide otherwise. This matches the brief's "SAR" usage and avoids ambiguity in prices.
- Arabic line-height needs more room than English. **[Proposed]** Set Arabic body line-height to at least 1.7.

### 2.3 OpenType [Brand] (p. 67)

KFUPM Display adds "decorative cups" to specific Arabic letters by default. These can be removed with **Stylistic Set 1 (`ss01`)** for a cleaner look and better legibility.

**[Proposed]** Use `font-feature-settings: "ss01"` for all Display text at small sizes and for UI chrome. Keep the default cups for hero headlines and the brand moments.

### 2.4 Hierarchy [Brand] (pp. 69–70)

| Level | Typeface | Notes |
|---|---|---|
| Heading | KFUPM Display (Bold or Black) | Largest. Example: "Advancing Humanity Through Research." |
| Subheading | KFUPM Display (Regular or Bold) | Smaller. Example: "Through Research." |
| Body copy | IBM Plex Sans Arabic (Regular) | Longest passages. |

The guidelines give relative sizes only. **[Proposed]** Pixel scale for the app. Confirm during Phase 1 design review:

| Token | Size (px) | Line height | Weight | Typeface |
|---|---|---|---|---|
| `text-display-xl` | 56 | 1.05 | KFUPM Black | Hero only |
| `text-display-lg` | 40 | 1.1 | KFUPM Bold | Page titles |
| `text-display-md` | 28 | 1.2 | KFUPM Bold | Section headings |
| `text-display-sm` | 20 | 1.3 | KFUPM Regular | Card headings, sub-headings |
| `text-body-lg` | 17 | 1.6 | Plex Regular | Lead paragraphs |
| `text-body` | 15 | 1.6 | Plex Regular | Default body and labels |
| `text-body-sm` | 13 | 1.5 | Plex Medium | Meta, timestamps, badges |

Use the same scale for Arabic and English. Do not shrink Arabic text by default.

### 2.5 Tracking and leading [Brand gap]

The guidelines do not define tracking or leading values. Use the values above until the brand team says otherwise.

---

## 3. Spacing and layout

### 3.1 Brand rules [Brand]

- Logo clear space is **1X** on all sides, where X is the height of the icon (p. 26). No text or images may enter it.
- The icon-to-wordmark gap is **1/4X** (p. 25).
- The brand has no UI spacing scale.

### 3.2 UI spacing [Proposed]

4px base unit. Scale: `4, 8, 12, 16, 24, 32, 48, 64`.

- Card padding: 16px on mobile, 24px on desktop.
- Section gap: 48px on desktop, 32px on mobile.
- Content gutter: 16px on phones. No horizontal page scroll.
- Touch targets: 44px minimum.

### 3.3 Radius [Proposed]

Brand gives no radius rule. The iconography is built on an octagon (p. 92), which argues against heavy rounding. **[Proposed]**:

- Buttons and inputs: 8px.
- Cards: 12px.
- Chips and badges: 999px (pill).
- Drawers and sheets: 16px on the leading corners.

### 3.4 Surfaces and depth [Brand + Proposed]

- **[Brand]** No effects on the logo: no shadows, glows, outlines, or gradients (p. 32).
- **[Brand]** No gradients in the FAST Matrix (p. 80).
- **[Proposed]** Flat color blocks for surfaces. Separate elements with a single hairline border (§1.8) before adding any shadow.
- **[Proposed]** One shadow token only, for floating elements (drawers, command palette, toasts): `0 8px 24px rgba(17, 95, 102, 0.18)`. Do not use it on cards.

### 3.5 Motion [Proposed]

The guidelines have no motion rules. Motion decisions belong to the animate and emil-design-eng skills in Phase 1. The **[Brand]** constraint is that motion must not distort the logo.

---

## 4. FAST Matrix (decorative pattern) [Brand] (pp. 73–81)

The FAST Matrix is a generative pattern built from a grid of squares skewed horizontally by **5°**. It is taken from the logotype's slant.

Construction: three units (Bold, Medium, Light). The generator is custom, so do not hand-draw the pattern.

Allowed color combinations, from the supplied SVGs:
- **Turquoise field with Green lines:** `#115F66` background, `#009767` lines (`KFUPM-2026.11.01-14.40.17.svg`).
- **Beige field with Sand lines:** `#ECE0C7` background, `#AA8C6D` lines (`KFUPM-2026.11.01-14.40.55.svg`).

The guidelines say the color combinations shown on p. 78 are "the only allowed options." I did not read p. 78 in detail. The two supplied SVGs match the primary pairs, so verify p. 78 before adding any other combination. Do not add others.

Use rules:
- One matrix pattern per medium.
- Do not overlay it fully on photography.
- Do not flip it, increase the skew, change its orientation, or add gradients.
- Use it selectively. Good spots: empty states, hero backgrounds, the Finals Mode banner, and the Pass-It-On box header.
- **[Proposed]** Keep the matrix out of forms, tables, and the rental calendar. It must not sit behind text the user needs to read.

---

## 5. Logo and marks

### 5.1 Official logo [Brand] (pp. 24–40)

- Primary logo = KFUPM Icon (octagon with tower) + KFUPM Wordmark, 1/4X gap.
- Lockups: Primary (global), Full Vertical (local), Wordmark only (small spaces), Iconmark (favicons and small icons).
- Approved colors: Turquoise on light backgrounds, White (negative) on dark backgrounds. Do not change the logo colors.
- Misuse (p. 32): do not distort, outline, add effects or gradients, recreate the wordmark, change the typeface, change the lockup, rotate, or resize the icon relative to the wordmark.

### 5.2 Seal [Brand] (pp. 38–40)

`KFUPM-Seal.png` is supplied (4300×4300 RGBA). Seal usage is not summarized here. Read pp. 38–40 before using it. **[Proposed]** Do not use the seal in the marketplace UI. It is an official crest.

### 5.3 App mark [Proposed, needs approval]

The brief asks for a custom "KFUPM Market (سوق البترول)" wordmark and emblem. The guidelines forbid recreating the KFUPM logo. A custom mark has to avoid looking like the official one.

**[Proposed approach]**
- Do not use the octagon, the tower, or the KFUPM wordmark in the app mark.
- Build the app wordmark from **KFUPM Display** text: "KFUPM Market" in Latin and "سوق البترول" in Arabic.
- Add a small emblem drawn from the FAST Matrix units (§4), not from the logo.
- Footer badge: "Student-built community platform. Not an official KFUPM service." This keeps the app clearly separate from the university.

This needs your approval because the guidelines do not address third-party or student-built products.

### 5.4 Favicon [Brand] (p. 25 and iconmark rules)

Use the iconmark only as a favicon, and only if you have permission to use the official mark. **[Proposed]** Use the FAST Matrix emblem from §5.3 as the app favicon instead.

---

## 6. Iconography [Brand] (p. 92)

- Simple, modern, built from shapes inspired by the octagon.
- The octagon influence should be "integrated naturally, without being forced."
- Icons must stay clear and functional.

**[Proposed]** Use **Lucide** icons (already in the brief) at 1.75px stroke, 20px default size, and 24px for primary actions. Do not add octagonal frames around them.

---

## 7. Imagery [Brand] (pp. 83–87)

- Photography is authentic, diverse, and shows real moments: students, faculty, campus life.
- Pure-brand photography rules (cutouts, lifestyle shots, university facilities) are in §9 of the guidelines.

**[Proposed]** Listings use product photos supplied by students. Avoid stock photos of KFUPM buildings unless the student provided them. Use a 4:3 frame and cover-fit. Show a neutral placeholder with the FAST Matrix pattern when a photo is missing.

---

## 8. Voice and microcopy [Brand] (pp. 16–22)

Voice attributes: **Forward thinking, Dynamic, Collaborative, Respectful & positive.**

Rules:
- Use visionary but not over-promising language.
- Avoid witty or very informal messaging, per the guidelines. **[Proposed]** For app microcopy, use short, plain, friendly labels, and keep jokes out of error and payment states.
- Avoid individual focus. Use "we" and "students" over "you" where it fits.
- Avoid exclusive language. Write Arabic and English with equal care.
- Arabic copy should be natural Saudi-university Arabic, not literal translation.

---

## 9. Accessibility [Brand + Proposed]

- **[Brand]** Use only the approved pairs in §1.7. Yellow text is for large text only.
- **[Proposed]** Minimum target size: 44px. Focus ring visible in both themes (§1.8).
- **[Proposed]** Respect `prefers-reduced-motion`.
- **[Proposed]** Support RTL and LTR with logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`).

---

## 10. Source file index

| File | Use in project |
|---|---|
| `KFUPM Visual Identity/KFUPM-Seal.png` | Reference only. Not used in UI. |
| `KFUPM Visual Identity/KFUPM-2026.11.01-14.40.17.svg` | FAST Matrix, Turquoise field with Green lines |
| `KFUPM Visual Identity/KFUPM-2026.11.01-14.40.55.svg` | FAST Matrix, Beige field with Sand lines |
| `KFUPM Fonts/KFUPM Font/KFUPM-{Regular,Bold,Black}.ttf` | Display typeface (confirm web license, §0.4) |
| `KFUPM Fonts/IBM Arabic font/TTF/IBMPlexSansArabic-*.ttf` | Body typeface (OFL) |
| `KFUPM Visual Identity/Guidelines.pdf` | One-page summary, reference only |
| `KFUPM Visual Identity/Self-Design Guide Using Templates.pdf` | Template guidance, not yet read |

Phase 1 will copy the font and matrix files into the project's public assets folder.
