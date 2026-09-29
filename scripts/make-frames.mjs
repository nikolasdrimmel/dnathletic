// Cut a video clip into the WebP frame sequence used by a scroll-scrubbed
// athlete animation, then print the entry for src/data/animations.ts.
//
//   node scripts/make-frames.mjs <clip.mp4> <id> [--frames 96] [--width 960] [--quality 75]
//
// Needs ffmpeg + ffprobe on PATH. Writes public/anim/<id>/f001.webp …
// (replacing any previous frames for that id).

import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [input, id, ...rest] = process.argv.slice(2);
if (!input || !id) {
  console.error('Usage: node scripts/make-frames.mjs <clip.mp4> <id> [--frames 96] [--width 960] [--quality 75]');
  process.exit(1);
}

const option = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? Number(rest[i + 1]) : fallback;
};
const frames = option('frames', 96);
const width = option('width', 960);
const quality = option('quality', 75);

const probe = (args) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', ...args, '-of', 'json']).toString());
const duration = Number(probe(['-show_entries', 'format=duration', input]).format.duration);

const outDir = join('public', 'anim', id);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execFileSync(
  'ffmpeg',
  [
    '-v', 'error',
    '-i', input,
    '-vf', `fps=${frames}/${duration},scale=${width}:-2`,
    '-frames:v', String(frames),
    '-c:v', 'libwebp',
    '-quality', String(quality),
    '-compression_level', '6',
    join(outDir, 'f%03d.webp'),
  ],
  { stdio: 'inherit' }
);

const files = readdirSync(outDir).filter((f) => f.endsWith('.webp'));
const bytes = files.reduce((sum, f) => sum + statSync(join(outDir, f)).size, 0);
const { width: w, height: h } = probe(['-show_entries', 'stream=width,height', join(outDir, 'f001.webp')]).streams[0];

console.log(`${files.length} frames, ${(bytes / 1024 / 1024).toFixed(2)} MB -> ${outDir}`);
console.log(`\nAdd to src/data/animations.ts:\n  '${id}': { kind: 'frames', label: 'Describe the movement', count: ${files.length}, width: ${w}, height: ${h} },`);
console.log(`\nThen set \`animation: ${id}\` in the article's frontmatter.`);
