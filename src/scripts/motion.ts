// Shared motion bootstrap, loaded on every page by BaseLayout.
// - Lenis smooth scrolling (wheel), driven by GSAP's ticker so ScrollTrigger
//   scrubs stay in lock-step with the smoothed scroll position.
// - Same-page anchor links scroll through Lenis with the header offset.
// - [data-reveal] elements fade up once as they enter the viewport.
// Everything degrades to native behaviour under prefers-reduced-motion.

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
// Don't re-measure when the mobile address bar shows/hides (avoids pin jumps).
ScrollTrigger.config({ ignoreMobileResize: true });

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const lenis: Lenis | null = reducedMotion ? null : new Lenis({ lerp: 0.11, autoRaf: false });

if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const headerHeight = () => document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;

// Full-screen pinned sections ([data-scroll-flush]) sit under the header,
// everything else lands just below it.
function scrollToTarget(target: HTMLElement, immediate = false) {
  const offset = target.hasAttribute('data-scroll-flush') ? 0 : -headerHeight();
  if (lenis) {
    lenis.scrollTo(target, { offset, immediate });
  } else {
    const y = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: 'auto' });
  }
}

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
  if (!link) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!target) return;
  event.preventDefault();
  scrollToTarget(target);
  history.pushState(null, '', url.hash);
});

// Pinned sections change the page height after load, so the browser's own
// jump to a #hash lands in the wrong place — re-apply it once pins exist.
export function syncHashScroll() {
  if (!location.hash) return;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) scrollToTarget(target, true);
}

// Subtle one-time fade-up for [data-reveal] plus article figures/equation panels.
const revealTargets = document.querySelectorAll<HTMLElement>('[data-reveal], .prose .math-panel, .prose .modalities');
if (revealTargets.length && !reducedMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('has-reveal');
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' }
  );
  revealTargets.forEach((el) => io.observe(el));
}

export { gsap, ScrollTrigger };
