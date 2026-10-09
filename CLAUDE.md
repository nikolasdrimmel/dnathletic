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

- **Astro 7** static site, hand-built (no template/UI framework). Markdown runs on the `unified` processor from `@astrojs/markdown-remark` (set in `astro.config.mjs`), because Astro 7's default Sätteri processor doesn't run the remark/rehype math plugins.
- Posts are **Markdown** in `src/content/blog/` via a content collection (schema in `src/content.config.ts`).
- **KaTeX** for LaTeX math (`remark-math` + `rehype-katex`); KaTeX assets are **self-hosted** in `public/vendor/katex/` (matches installed `katex@0.18.9` — do not re-add a CDN link). `package.json` `overrides` pins every KaTeX copy (incl. rehype-katex's) to that same version, so the rendered markup and the self-hosted CSS always match — when bumping KaTeX, copy `node_modules/katex/dist/katex.min.css` + `fonts/*.woff2` into `public/vendor/katex/`.
- Fonts are **self-hosted** in `public/fonts/` (`fonts.css` + woff2). Do not re-add Google Fonts `<link>`s.
- RSS (`src/pages/rss.xml.js`) + sitemap (`@astrojs/sitemap`).
- **Scroll engine:** `gsap` (+ `ScrollTrigger`) and `lenis` from npm, bundled by Vite — no CDN (~51 KB gzipped). Bootstrapped once per page in `src/scripts/motion.ts`.

## Scroll experience & athlete animations

- **Homepage** (`src/scripts/home.ts`): ① `#home` hero is pinned and scroll scrubs the dunk frame sequence while the "DNAthletic" wordmark fades out; ② `#articles` is pinned — each article gets a scroll segment (1.25 screens) that plays its athlete animation, then crossfades + text-rolls to the next; ③ `#about`: gold ring draw, word-by-word bio, staggered credentials, photo parallax (no cursor tilt — the user disliked it; the bio hover tracking "exhale" was also removed at the user's request — don't re-add hover effects there).
- **Article pages** (`src/scripts/article.ts`): text-only header (the user removed the athlete animation there), gold reading-progress bar. Equations are live KaTeX — as a titled card use `<div class="math-panel">` with `.math-label`, the `$$…$$` block and a `.math-caption` legend (blank lines around the math so Markdown still parses it); don't use formula screenshots. **Every formula and every chart sits in a gold-left-border `.math-panel` card with a `.math-label` title** (the user wants this consistent); formula cards get a short `.math-caption` legend of the symbols, never an extra explanatory note. Charts are hand-drawn inline SVG in `<figure class="math-panel chart">` (classes `chart__grid/axis/curve/bar/threshold/tick/label`, palette via CSS, labels in the KaTeX font) — no pasted chart images and no captions. Device/photo sets use `.modalities` → `.modality` (photo inside a 2px gold ring with a 4px transparent gap — the user prefers the gap + display-font label) and no card. Article body paragraphs (`.prose > p`) are **justified** on all screen sizes (last line left) — the user always wants this. **Words are never split across lines** anywhere on the site (`hyphens: none` on `body`; don't add hyphenation or `&shy;`), and brackets/punctuation never separate from an inline formula or citation — `src/plugins/rehype-nowrap.mjs` (after rehype-katex in `astro.config.mjs`) handles this automatically. If the dev server shows stale article HTML after a Markdown-plugin change, delete `node_modules/.astro/data-store.json` and restart; headings, cards, lists, notes and references keep their own alignment. Sub-headline (`subtitle`) renders as a gold mono uppercase line; articles end with the references and a centred "Return to articles" button (no tags, no promo cards).
- **Animations registry:** `src/data/animations.ts`. An article's `animation: <id>` frontmatter picks its homepage-showcase animation; without it the brand force–time curve (`force-curve`) is used. Kinds: `frames` (WebP sequence in `public/anim/<id>/`), `mocap` (code-drawn figure, `src/scripts/mocap.ts`), `curve`.
- **New clip → animation:** `node scripts/make-frames.mjs <clip.mp4> <id>` (needs ffmpeg), paste the printed entry into `animations.ts`, set `animation: <id>` on the post. Clips should have a locked camera, one complete rep, and dark edges (they're feathered into the page). Higgsfield is connected but the account is on the free plan, which blocks the video/image models used so far.
- `back-squat` (VBT article) is a photoreal Gemini clip shot on **green screen**, keyed to transparent WebP (`transparent: true` → fitted whole and centred on the athlete via `span`, no edge feather). It is shown without an overlay — the user removed the bar-velocity HUD (and its telemetry code) from the clip. For new clips ask for a plain green-screen background — a "transparent" checkerboard from AI tools is baked-in pixels and very hard to remove. The code-drawn fallback remains as `back-squat-mocap`. The VBT article's showcase currently uses `viking-snatch` instead (line-art snatch, 96 transparent frames from `scripts/generate_viking_frames.py`, source clip in `_source/`); `back-squat` stays registered.
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
    blog/[...slug].astro       # article view: text header + .prose
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

- **Language: American English** everywhere (articles, UI copy, alt text, docs) — e.g. *fiber, favor, minimize, individualization*. When touching existing text, convert British spellings; only reword beyond spelling when it's genuinely necessary and stays accurate to the meaning. **Exception: always "football", never "soccer"** (e.g. "professional football players"), with no "association football" clarification — but cited paper titles in the references stay exactly as published.
- Keep the strict palette + font roles. Match the surrounding code's style and density.
- Article images live in `public/images/articles/<slug>/`; reference only what's used (no raw dumps).
- Don't add dependencies or external CDN calls without asking — fonts and KaTeX are deliberately self-hosted.
- **Security headers** live in `public/_headers` (served by the Cloudflare Worker's static assets): a strict Content-Security-Policy (`'self'` only, no inline scripts or `<style>` elements, inline `style=""` attributes allowed), HSTS, nosniff, no framing. Anything new from another origin (embed, analytics, font, image) or an inline `<script>` will be **blocked** until the CSP is updated — check the browser console for CSP errors after such changes. The HTTP→HTTPS redirect itself is a Cloudflare dashboard setting ("Always Use HTTPS").
- **Writing style: compact.** The user likes the first two VBT chapters (The Foundation, Fatigue Detection) because they're so compact — short paragraphs, one idea each, no filler transitions or restating, every sentence carries a fact or a step of the argument. Apply this to all chapters and future articles.
- **No bold inside running paragraphs** — emphasis comes from the wording. Bold is only allowed for bullet-list labels ("Load Prescription:"), the note/callout title, the `.math-caption` legend symbols and reference author names.
- **Publishing day: Sunday.** One article per week; every post's `pubDate` is always a Sunday (the VBT article is dated Sun 2026-10-11). Future-dated posts are not hidden — the site shows them as soon as they're pushed.
- New posts: add a `.md` to `src/content/blog/` with frontmatter matching the schema (`title`, `description`, `pubDate`, optional `subtitle`/`updatedDate`/`tags`/`draft`).
