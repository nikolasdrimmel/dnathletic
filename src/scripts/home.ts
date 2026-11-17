// Homepage: a plain scrolling page (no pinning or scroll-scrubbed media).
//   - Hero intro video loops on its own; with reduced motion it stays on its poster.
//   - Header floats transparently over the hero, then turns solid.
//   - The nav link of the section in view is highlighted.

import { ScrollTrigger, reducedMotion, syncHashScroll } from './motion';

function initHeroVideo() {
  const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
  if (!video) return;
  const portrait = window.matchMedia('(max-aspect-ratio: 4/5)').matches;
  const mobileCut = portrait && video.dataset.srcMobile;
  video.src = mobileCut || video.dataset.src!;
  video.classList.toggle('is-portrait-cut', Boolean(mobileCut));
  if (reducedMotion) return; // first frame / poster only
  video.muted = true; // autoplay is only allowed muted
  video.play().catch(() => {}); // blocked (e.g. low-power mode) → poster stays
}

function initHeader() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const header = document.querySelector('.site-header');
  if (!hero || !header) return;
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top+=80',
    onToggle: (self) => header.classList.toggle('is-over-hero', self.isActive),
  });
}

function initNavSpy() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.nav-link[data-nav]')];
  const setActive = (id: string) => links.forEach((l) => l.classList.toggle('active', l.dataset.nav === id));
  for (const link of links) {
    const el = document.getElementById(link.dataset.nav!);
    if (!el) continue;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => self.isActive && setActive(link.dataset.nav!),
    });
  }
}

initHeroVideo();
initHeader();
initNavSpy();
ScrollTrigger.refresh();
syncHashScroll();
