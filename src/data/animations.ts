// Registry of the athlete animations used by the homepage (hero + article
// showcase) and the article headers. An article opts in with
// `animation: <id>` in its frontmatter.
//
//   kind 'frames' — a scroll-scrubbed image sequence cut from a video clip
//                   (see scripts/make-frames.mjs), served from public/anim/<id>/.
//   kind 'mocap'  — a code-drawn biomechanics figure (src/scripts/mocap.ts).
//                   Stands in until a photoreal clip exists for the movement;
//                   swapping to a clip is a one-line change here.
//   kind 'curve'  — the brand CMJ force–time curve drawing itself; the
//                   fallback for articles without an `animation`.

export type FramesAnimation = {
  kind: 'frames';
  label: string;   // accessible description of the motion
  count: number;   // frames f001.webp … fNNN.webp
  width: number;
  height: number;
  focusX?: number; // horizontal focal point (0–1) kept in view when cropped
  transparent?: boolean; // alpha frames: fit whole (contain), no edge feathering
  span?: [number, number]; // transparent: horizontal extent (0–1) of the athlete across all frames
  scale?: number;          // transparent: draw the fitted frames at this fraction of the stage (default 1)
};

export type MocapAnimation = {
  kind: 'mocap';
  label: string;
  movement: 'back-squat';
};

export type CurveAnimation = {
  kind: 'curve';
  label: string;
};

export type Animation = FramesAnimation | MocapAnimation | CurveAnimation;

export const DEFAULT_ANIMATION = 'force-curve';

export const animations: Record<string, Animation> = {
  dunk: {
    kind: 'frames',
    label: 'Basketball player performing a dunk',
    count: 161, // every source frame up to where he still hangs on the rim
    width: 1280,
    height: 720,
    focusX: 0.56,
  },
  // Gemini clip on green screen, keyed to transparent WebP.
  'back-squat': {
    kind: 'frames',
    label: 'Athlete performing a barbell back squat',
    count: 72,
    width: 768,
    height: 768,
    transparent: true,
    span: [0.15, 0.91],
  },
  // Flat off-white Viking snatch: Gemini green-screen clip keyed to transparent
  // WebP in the palette ink (scripts/key_green_frames.py, source in _source/).
  'viking-snatch': {
    kind: 'frames',
    label: 'Viking athlete performing a barbell snatch',
    count: 141,
    width: 745,
    height: 856,
    transparent: true,
    span: [0.021, 0.979],
    scale: 0.7,
  },
  // Code-drawn fallback for the squat (kept for future movements/articles).
  'back-squat-mocap': {
    kind: 'mocap',
    label: 'Motion-capture figure performing a barbell back squat',
    movement: 'back-squat',
  },
  'force-curve': {
    kind: 'curve',
    label: 'Countermovement jump force–time curve',
  },
};

export function getAnimation(id: string): Animation {
  const anim = animations[id];
  if (!anim) {
    throw new Error(
      `Unknown animation "${id}". Add it to src/data/animations.ts (known: ${Object.keys(animations).join(', ')}).`
    );
  }
  return anim;
}

export const framePath = (id: string, index: number) =>
  `/anim/${id}/f${String(index).padStart(3, '0')}.webp`;
