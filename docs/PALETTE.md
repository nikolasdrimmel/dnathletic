# DNAthletic - Design System & Color Palette Rules

> **STRICT RULE**: Only the following **7 foundational colors** (and their documented opacity tints) are permitted in this website. No outside hex codes, random CSS color names, or unapproved gradients may be introduced.

---

## 🎨 The 7-Color Palette

| # | Name | Token / CSS Variable | Hex / RGBA | Usage Guide |
|---|---|---|---|---|
| **1** | **Deep Obsidian** | `--c-bg` | `#111315` | Main site background, canvas, body |
| **2** | **Charcoal Panel** | `--c-panel` | `#1a1d21` | Card surfaces, hero graphics, panels, sticky header |
| **3** | **Hairline Line** | `--c-line` | `rgba(243, 238, 226, 0.12)` | Dividers, section borders, card outlines |
| **4** | **Warm Off-White Ink** | `--c-ink` | `#f3eee2` | Primary typography, headers, readable prose |
| **5** | **Muted Titanium** | `--c-muted` | `#9c9588` | Secondary text, timestamps, tags, article descriptions |
| **6** | **Warm Ivory** | `--c-accent` | `#ece7dc` | Inverted primary action buttons (with `#111315` dark text) |
| **7** | **TE Amber Gold** | `--c-gold` | `#e9b23c` | Kicker tags, active nav links, hover borders, formula accents |

---

## 📂 Source Code Location
- **CSS Variables**: Defined in [`src/styles/global.css`](file:///c:/Users/nikol/OneDrive/Desktop/Blog/src/styles/global.css) under `:root`.
- **TypeScript Tokens**: Exported in [`src/styles/theme.ts`](file:///c:/Users/nikol/OneDrive/Desktop/Blog/src/styles/theme.ts).
