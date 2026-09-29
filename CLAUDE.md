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
- **Scroll engine:** `gsap` (+ `ScrollTrigger`) and `lenis` from npm, bundled by Vite — no CDN (~51 KB gzipped). Bootstrapped once per page in `src/scripts/motion.ts`.

## Scroll experience & athlete animations

- **Homepage** (`src/scripts/home.ts`): ① `#home` hero is pinned and scroll scrubs the dunk frame sequence while the "DNAthletic" wordmark fades out; ② `#articles` is pinned — each article gets a scroll segment (1.25 screens) that plays its athlete animation, then crossfades + text-rolls to the next; ③ `#about`: gold ring draw, word-by-word bio, staggered credentials, photo parallax (no cursor tilt — the user disliked it).
- **Article pages** (`src/scripts/article.ts`): header with the article's athlete animation (pinned briefly on large screens), gold reading-progress bar. Cross-page CSS view transitions morph the athlete between showcase and article (`view-transition-name: athlete-<slug>`).
- **Animations registry:** `src/data/animations.ts`. An article opts in with `animation: <id>` in its frontmatter; without it the brand force–time curve (`force-curve`) is used. Kinds: `frames` (WebP sequence in `public/anim/<id>/`), `mocap` (code-drawn figure, `src/scripts/mocap.ts`), `curve`.
- **New clip → animation:** `node scripts/make-frames.mjs <clip.mp4> <id>` (needs ffmpeg), paste the printed entry into `animations.ts`, set `animation: <id>` on the post. Clips should have a locked camera, one complete rep, and dark edges (they're feathered into the page). Higgsfield is connected but the account is on the free plan, which blocks the video/image models used so far.
- `back-squat` is currently the code-drawn **mocap** placeholder for the VBT article — swap it to a `frames` entry once a photoreal clip exists.
- **Reduced motion:** no Lenis, no pinning, static frames, plain list, no view transitions. Keep that path working.
- Canvas colours are read from the palette CSS variables — don't hard-code new colours in scripts.

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
- **Fully responsive** — must work cleanly at desktop AND mobile (test at 375px, no horizontal overflow). A single `overflow-x: clip` on `html` + `overflow: hidden` on `.hero__stage` is the overflow guard; don't reintroduce scattered `max-width:100vw` hacks. Phones: the showcase stacks animation-on-top / text-below; the hero footage sits in a feathered band so athlete + rim stay in view.
- Respect `prefers-reduced-motion` (already handled globally).

## Structure

```
src/
  layouts/BaseLayout.astro     # <head>, fonts, KaTeX, header/footer shell, motion bootstrap
  components/                  # Header, Footer, BrandIcon (CMJ force-time SVG logo), AthleteStage (animation canvas)
  data/animations.ts           # athlete animation registry (frames / mocap / curve)
  scripts/                     # motion.ts (Lenis+GSAP), home.ts, article.ts, athlete.ts, frames.ts, mocap.ts
  pages/
    index.astro                # one-page homepage: pinned dunk hero → pinned article showcase → About
    impressum.astro            # /impressum — standalone legal notice (subpage style)
    datenschutz.astro          # /datenschutz — privacy policy (DRAFT template, review before publishing)
    blog/index.astro           # /blog full list (.post-card)
    blog/[...slug].astro       # article view: athlete header + .prose
    rss.xml.js
  content/blog/*.md            # the posts (optional `animation:` frontmatter)
  styles/global.css            # ALL styling + palette tokens
  styles/theme.ts              # palette as TS tokens
public/                        # anim/<id>/ frame sequences, favicons, /fonts, /vendor/katex, article images
scripts/make-frames.mjs        # video clip → public/anim/<id>/ WebP frames
docs/PALETTE.md                # canonical palette doc
_source/                       # local-only (gitignored) article manuscripts + dunk.mp4 source clip, not deployed
```

## Conventions

- Keep the strict palette + font roles. Match the surrounding code's style and density.
- Article images live in `public/images/articles/<slug>/`; reference only what's used (no raw dumps).
- Don't add dependencies or external CDN calls without asking — fonts and KaTeX are deliberately self-hosted.
- New posts: add a `.md` to `src/content/blog/` with frontmatter matching the schema (`title`, `description`, `pubDate`, optional `subtitle`/`updatedDate`/`tags`/`draft`).
