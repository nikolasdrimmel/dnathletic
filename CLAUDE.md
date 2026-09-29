# CLAUDE.md — DNAthletic

Guidance for Claude Code when working in this repository. Read this fully before touching anything.

---

## ⚠️ MANDATORY RULE — Ask before you change

**Before making ANY change to this project (code, content, files, config, styling — anything), you MUST ask the user at least FOUR (4) questions in the question panel (the `AskUserQuestion` tool).**

- This applies to every change request, large or small.
- The questions must be substantive — about scope, approach, design/style choices, trade-offs, or which files to touch — so it's clear you actually understand the task and how to do it. Do not ask filler questions.
- Wait for the answers, then proceed exactly as agreed.
- Pure investigation (reading files, inspecting the site, answering questions) does NOT require this — the rule is only for making changes.

---

## Always read these first

Every session, before proposing or making changes, read:

1. **This file** (`CLAUDE.md`) — conventions + the mandatory rule above.
2. **[`docs/PALETTE.md`](docs/PALETTE.md)** — the strict 7-color design system, canonical source.
3. **[`src/styles/global.css`](src/styles/global.css)** — where the palette tokens and all styles live.
4. **[`src/styles/theme.ts`](src/styles/theme.ts)** — the palette mirrored as TypeScript tokens.

---

## What this is

**DNAthletic** — an independent blog about strength & conditioning and the technology behind training (velocity-based training, sensor telemetry, biomechanics). Editorial, scientific, minimalist. Live at **dnathletic.com**.

## Stack

- **Astro 5** static site, hand-built (no template/UI framework).
- Posts are **Markdown** in `src/content/blog/` via a content collection (schema in `src/content.config.ts`).
- **KaTeX** for LaTeX math (`remark-math` + `rehype-katex`); KaTeX assets are **self-hosted** in `public/vendor/katex/` (matches installed `katex@0.18.7` — do not re-add a CDN link).
- Fonts are **self-hosted** in `public/fonts/` (`fonts.css` + woff2). Do not re-add Google Fonts `<link>`s.
- RSS (`src/pages/rss.xml.js`) + sitemap (`@astrojs/sitemap`).

## Run locally

```bash
npm run dev       # dev server → http://localhost:4321 (hot reload)
npm run build     # static build → dist/  (what Cloudflare runs)
npm run preview   # serve the built dist/ locally
```

## Deploy / publish loop

- **Repo:** https://github.com/nikolasdrimmel/dnathletic (`main` branch).
- **Hosting:** Cloudflare **Worker** (static assets via `ASSETS` binding). Git integration auto-builds on push (`npm run build`, output `dist/`). Node pinned to 22 via `.nvmrc`.
- **Publish:** edit/add a Markdown file → `git push` → Cloudflare rebuilds → live in ~1 min.
- **Do not commit or push unless the user asks.** The user works on `main`.

---

## 🎨 Design system — STRICT 7-color palette

Only these 7 colors (and their documented opacity tints) may be used across the entire site. **No outside hex codes, CSS color names, or unapproved gradients.** Canonical reference: [`docs/PALETTE.md`](docs/PALETTE.md). Tokens are defined on `:root` in `src/styles/global.css`.

| # | Name | Token | Value | Usage |
|---|------|-------|-------|-------|
| 1 | Deep Obsidian | `--c-bg` | `#111315` | Page background, canvas, body |
| 2 | Charcoal Panel | `--c-panel` | `#1a1d21` | Cards, panels, sticky header, hero graphics |
| 3 | Hairline Line | `--c-line` | `rgba(243, 238, 226, 0.12)` | Dividers, borders, card outlines |
| 4 | Warm Off-White Ink | `--c-ink` | `#f3eee2` | Primary text, headings, prose |
| 5 | Muted Titanium | `--c-muted` | `#9c9588` | Secondary text, timestamps, tags, descriptions |
| 6 | Warm Ivory | `--c-accent` | `#ece7dc` | Inverted primary action buttons (dark `#111315` text on top) |
| 7 | TE Amber Gold | `--c-gold` | `#e9b23c` | Kickers, active nav, hover borders, formula/accent highlights |

Derived tints already in use: `--c-gold-dim` (soft gold wash), `--c-panel-hover`, `--c-panel-subtle`, `--c-on-accent` (`#111315`, text on the ivory button).

**Rule of thumb:** reach for an existing token first. If a change seems to need a new color, stop and ask (see the mandatory rule) rather than introducing one.

## ✍️ Typography

- **Display / headings:** `Outfit` (weights 500/600/700) → `--font-display`
- **Body / prose:** `Inter` (400/500/600) → `--font-sans`
- **Mono / telemetry** (nav, dates, tags, code, badges, section/spec labels): `JetBrains Mono` (400/500/600) → `--font-mono`
- Headings use tight tracking (`letter-spacing: -0.02em` to `-0.03em`). Mono labels use wide tracking + uppercase for the "technical readout" feel.

## Layout & tone

- Dark, editorial, restrained. Generous whitespace, hairline dividers, gold mono uppercase labels for sections/specs. (The old gold-dot "kicker" mini-heading was removed site-wide — do not reintroduce it.)
- Container widths: `--maxw` 52rem (reading column), `--maxw-wide` 74rem (hero/header), plus `.wrap--editorial` 58rem for articles.
- Corner radii scale: `--radius-sm` 6px, `--radius` 10px, `--radius-lg` 14px.
- **Fully responsive** — must work cleanly at desktop AND mobile (test at 375px, no horizontal overflow). A single `overflow-x: clip` on `html` + `overflow: hidden` on the hero is the overflow guard; don't reintroduce scattered `max-width:100vw` hacks.
- Respect `prefers-reduced-motion` (already handled globally).

## Structure

```
src/
  layouts/BaseLayout.astro     # <head>, fonts, KaTeX, header/footer shell
  components/                  # Header, Footer, BrandIcon (CMJ force-time SVG logo)
  pages/
    index.astro                # one-page homepage: hero video → Articles → About
    impressum.astro            # /impressum — standalone legal notice (subpage style)
    datenschutz.astro          # /datenschutz — privacy policy (DRAFT template, review before publishing)
    blog/index.astro           # /blog full list (.post-card)
    blog/[...slug].astro       # article view (.prose)
    rss.xml.js
  content/blog/*.md            # the posts
  styles/global.css            # ALL styling + palette tokens
  styles/theme.ts              # palette as TS tokens
public/                        # dunk.mp4 hero, favicons, /fonts, /vendor/katex, article images
docs/PALETTE.md                # canonical palette doc
_source/                       # local-only (gitignored) article manuscripts, not deployed
```

## Conventions

- Keep the strict palette + font roles. Match the surrounding code's style and density.
- Article images live in `public/images/articles/<slug>/`; reference only what's used (no raw dumps).
- Don't add dependencies or external CDN calls without asking — fonts and KaTeX are deliberately self-hosted.
- New posts: add a `.md` to `src/content/blog/` with frontmatter matching the schema (`title`, `description`, `pubDate`, optional `subtitle`/`updatedDate`/`tags`/`draft`).
