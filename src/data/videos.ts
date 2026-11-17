// Videos shown in the homepage "Videos" section, newest first.
//
// To publish one: set `youtubeId` (the part after `watch?v=` in the YouTube URL)
// and put a 16:9 thumbnail at `public/images/videos/<youtubeId>.webp`
// (1280×720 is plenty). The CSP only allows images from this site, so
// thumbnails are self-hosted instead of loaded from YouTube.
// Entries without a `youtubeId` show as "Coming soon" and aren't linked.

export interface Video {
  title: string;
  description: string;
  youtubeId?: string;
  /** Running time shown on the card, e.g. "8:42". */
  duration?: string;
}

export const videos: Video[] = [
  // Placeholders — replace with the real videos.
  {
    title: 'Measure your vertical jump with your phone',
    description: 'How Max Your Vertical turns a 240 fps clip into jump height, and how to film it right.',
  },
  {
    title: 'Countermovement jump: ready or fatigued?',
    description: 'What a daily jump test says about readiness, and when a drop means reducing load.',
  },
  {
    title: 'Velocity-based training explained',
    description: 'Bar speed as a live readout of effort, fatigue and daily strength.',
  },
];

export const youtubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const videoThumb = (id: string) => `/images/videos/${id}.webp`;
