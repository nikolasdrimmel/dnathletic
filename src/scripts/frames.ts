// Scroll-scrubbed image sequence drawn to a <canvas>. Frames are WebP stills
// cut from a video (public/anim/<id>/f001.webp …). Drawing stills instead of
// seeking a <video> keeps scrubbing smooth in both directions on every browser.

import { framePath } from '../data/animations';

export interface Player {
  render(progress: number): void;
}

type Options = {
  id: string;
  count: number;
  focusX: number;            // horizontal focal point kept in view when cropping
  fit?: 'cover' | 'contain'; // contain: transparent clips shown whole
  span?: [number, number];   // contain: horizontal extent of the subject in the frame
  avoid?: HTMLElement;       // contain: overlay in the top-right corner the subject must clear
  onFirstFrame?: () => void;
};

const CONCURRENCY = 6;
const MAX_BACKING_PX = 1920; // the source is 720p; a bigger canvas only costs memory

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export class FrameSequence implements Player {
  private readonly frames: (HTMLImageElement | undefined)[];
  private readonly ctx: CanvasRenderingContext2D;
  private target = 0;
  private shown = -1;
  private started = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly opts: Options
  ) {
    this.frames = new Array(opts.count);
    this.ctx = canvas.getContext('2d')!;
    new ResizeObserver(() => this.resize()).observe(canvas);
  }

  // Coarse-to-fine: every 16th frame first, then 8th, 4th, 2nd, 1st — scrubbing
  // works almost immediately and gains smoothness as the rest arrives.
  load() {
    if (this.started) return;
    this.started = true;
    const { count } = this.opts;
    const order: number[] = [];
    const queued = new Set<number>();
    const add = (i: number) => {
      if (!queued.has(i)) {
        queued.add(i);
        order.push(i);
      }
    };
    add(0);
    add(count - 1);
    for (let step = 16; step >= 1; step /= 2) {
      for (let i = 0; i < count; i += step) add(i);
    }

    let next = 0;
    const pump = () => {
      const i = order[next++];
      if (i === undefined) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = framePath(this.opts.id, i + 1);
      img
        .decode()
        .then(
          () => {
            this.frames[i] = img;
            // Redraw only if this frame is closer to the wanted one than what's shown.
            if (this.shown === -1 || Math.abs(i - this.target) < Math.abs(this.shown - this.target)) {
              this.draw();
            }
          },
          () => {}
        )
        .finally(pump);
    };
    for (let k = 0; k < CONCURRENCY; k++) pump();
  }

  render(progress: number) {
    this.target = Math.round(clamp01(progress) * (this.opts.count - 1));
    this.draw();
  }

  private nearestLoaded(i: number) {
    if (this.frames[i]) return i;
    for (let d = 1; d < this.opts.count; d++) {
      if (this.frames[i - d]) return i - d;
      if (this.frames[i + d]) return i + d;
    }
    return -1;
  }

  private draw(force = false) {
    const i = this.nearestLoaded(this.target);
    if (i < 0 || (i === this.shown && !force)) return;
    const { width: cw, height: ch } = this.canvas;
    if (!cw || !ch) return;

    // object-fit: cover (keeping focusX in view) or contain.
    const img = this.frames[i]!;
    const contain = this.opts.fit === 'contain';
    let scale = (contain ? Math.min : Math.max)(cw / img.naturalWidth, ch / img.naturalHeight);
    let dx = 0;
    if (contain) {
      // Keep the subject left of the overlay: use the empty margins first,
      // shrink only as much as still needed.
      const [s0, s1] = this.opts.span ?? [0, 1];
      const avoid = this.opts.avoid;
      const px = cw / (this.canvas.clientWidth || cw);
      const room = avoid?.isConnected ? cw - (avoid.offsetWidth + 8) * px : cw;
      scale *= Math.min(1, room / ((s1 - s0) * img.naturalWidth * scale));
      const subject = (s1 - s0) * img.naturalWidth * scale;
      dx = Math.max(0, Math.min((cw - subject) / 2, room - subject)) - s0 * img.naturalWidth * scale;
    }
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    if (!contain) dx = Math.min(0, Math.max(cw - dw, cw / 2 - this.opts.focusX * dw));
    const dy = (ch - dh) / 2;

    this.ctx.clearRect(0, 0, cw, ch);
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(img, dx, dy, dw, dh);
    if (this.shown === -1) this.opts.onFirstFrame?.();
    this.shown = i;
  }

  private resize() {
    const cssW = this.canvas.clientWidth;
    const cssH = this.canvas.clientHeight;
    if (!cssW || !cssH) return;
    const k = Math.min(window.devicePixelRatio || 1, 2, MAX_BACKING_PX / Math.max(cssW, cssH));
    const w = Math.round(cssW * k);
    const h = Math.round(cssH * k);
    if (w === this.canvas.width && h === this.canvas.height) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this.draw(true);
  }
}
