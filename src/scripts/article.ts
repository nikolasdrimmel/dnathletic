// Article page: the athlete header plays one rep as you scroll into the post
// (briefly pinned on large screens), plus a gold reading-progress bar.

import { gsap, ScrollTrigger, reducedMotion } from './motion';
import { mountAthlete } from './athlete';

const hero = document.querySelector<HTMLElement>('[data-article-hero]');
const stageEl = hero?.querySelector<HTMLElement>('.athlete');

if (hero && stageEl) {
  const headerOffset = () => document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;

  if (reducedMotion) {
    mountAthlete(stageEl, { still: 0.55 });
  } else {
    const player = mountAthlete(stageEl, { eager: true });
    player.render(0);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (min-height: 640px)', () => {
      ScrollTrigger.create({
        trigger: hero,
        start: () => `top ${headerOffset()}px`,
        end: () => `+=${Math.round(window.innerHeight * 0.7)}`,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => player.render(self.progress),
      });
    });
    mm.add('(max-width: 899px), (max-height: 639px)', () => {
      ScrollTrigger.create({
        trigger: hero,
        start: () => `top ${headerOffset()}px`,
        end: 'bottom top',
        invalidateOnRefresh: true,
        onUpdate: (self) => player.render(self.progress),
      });
    });
  }
}

const progressBar = document.querySelector<HTMLElement>('.read-progress');
const prose = document.querySelector<HTMLElement>('.prose');
if (progressBar && prose) {
  ScrollTrigger.create({
    trigger: prose,
    start: 'top 80%',
    end: 'bottom bottom',
    onUpdate: (self) => (progressBar.style.transform = `scaleX(${self.progress.toFixed(4)})`),
  });
}
