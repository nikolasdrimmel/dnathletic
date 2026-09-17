/**
 * DNAthletic - Design System Color Palette
 * 
 * STRICT 7-COLOR RULE:
 * Only these 7 foundational colors (and their defined opacity tints)
 * may be used across the entire website.
 */

export const palette = {
  // 1. Deep Obsidian Charcoal Background
  bg: '#111315',

  // 2. Dark Charcoal Panels & Cards
  panel: '#1a1d21',

  // 3. Hairline Border / Dividers
  line: 'rgba(243, 238, 226, 0.12)',

  // 4. Warm Off-White Primary Ink (Headings & Body)
  ink: '#f3eee2',

  // 5. Muted Titanium (Subtitles, Metadata, Tags)
  muted: '#9c9588',

  // 6. Warm Ivory Primary Action Button
  accent: '#ece7dc',
  onAccent: '#111315', // Text on accent button

  // 7. TE Amber Gold (Signature Accent, Kickers, Formulas, Active States)
  gold: '#e9b23c',
  goldDim: 'rgba(233, 178, 60, 0.14)',
} as const;

export type ThemeColors = typeof palette;
