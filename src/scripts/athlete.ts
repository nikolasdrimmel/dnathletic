// Turns an <AthleteStage> element into a Player (render(progress) 0 → 1),
// picking the renderer from its data-kind.

import { framePath } from '../data/animations';
import { FrameSequence, type Player } from './frames';
import { MocapSquat } from './mocap';

export type { Player };

type MountOptions = {
  eager?: boolean; // start loading frames immediately (above the fold)
  still?: number; // reduced motion: show only this progress point, no sequence
};

export function mountAthlete(el: HTMLElement, { eager = false, still }: MountOptions = {}): Player {
  if (el.dataset.kind === 'curve') {
    // Fallback: the brand force–time curve draws itself with the scroll.
    const path = el.querySelector<SVGPathElement>('.athlete__curve-path')!;
    el.classList.add('is-ready');
    const player: Player = { render: (p) => (path.style.strokeDashoffset = String(1 - Math.min(1, Math.max(0, p)))) };
    if (still !== undefined) player.render(1);
    return player;
  }

  const canvas = el.querySelector<HTMLCanvasElement>('.athlete__canvas')!;

  if (el.dataset.kind === 'frames') {
    const count = Number(el.dataset.count);
    if (still !== undefined) {
      // One representative still instead of downloading the whole sequence.
      const poster = el.querySelector<HTMLImageElement>('.athlete__poster');
      if (poster) poster.src = framePath(el.dataset.athlete!, Math.round(still * (count - 1)) + 1);
      return { render() {} };
    }
    const seq = new FrameSequence(canvas, {
      id: el.dataset.athlete!,
      count,
      focusX: Number(el.dataset.focus ?? 0.5),
      fit: el.dataset.fit === 'contain' ? 'contain' : 'cover',
      span: el.dataset.span ? (el.dataset.span.split(',').map(Number) as [number, number]) : undefined,
      onFirstFrame: () => el.classList.add('is-ready'),
    });
    if (eager) {
      seq.load();
    } else {
      // Start fetching frames a screen before the stage scrolls into view.
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            seq.load();
            io.disconnect();
          }
        },
        { rootMargin: '100% 0px' }
      );
      io.observe(el);
    }
    return seq;
  }

  el.classList.add('is-ready');
  const mocap = new MocapSquat(canvas, el.querySelector<HTMLElement>('.mocap-hud'));
  if (still !== undefined) mocap.render(still);
  return mocap;
}
