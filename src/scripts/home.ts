// Homepage choreography:
//   1. Hero    — pinned; scroll scrubs the dunk, the wordmark fades out.
//   2. Articles — pinned; each article gets a scroll segment that plays its
//                 athlete animation, then crossfades/rolls to the next one.
//   3. About   — gold ring draw, word-by-word bio, staggered credentials,
//                 photo parallax.
// Under prefers-reduced-motion nothing pins: static frames, plain list.

import { gsap, ScrollTrigger, reducedMotion, syncHashScroll } from './motion';
import { mountAthlete, type Player } from './athlete';

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const DUNK_MOMENT = 0.69; // frame shown when motion is reduced: ball in the rim

function initHero() {
  const section = document.querySelector<HTMLElement>('[data-hero]');
  if (!section) return;
  const stage = section.querySelector<HTMLElement>('.hero__stage')!;
  const athleteEl = section.querySelector<HTMLElement>('.athlete')!;

  if (reducedMotion) {
    mountAthlete(athleteEl, { still: DUNK_MOMENT });
    headerOverHero(section);
    return;
  }
  const player = mountAthlete(athleteEl, { eager: true });
  player.render(0);

  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * 1.3)}`, // a quick dunk
        pin: stage,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => player.render(self.progress),
      },
    })
    .to('.hero__wordmark', { autoAlpha: 0, yPercent: -14, scale: 1.06, filter: 'blur(6px)', duration: 0.22, ease: 'power1.in' }, 0)
    .to('.hero__cue', { autoAlpha: 0, duration: 0.08 }, 0)
    .to({}, { duration: 0.78 }); // pad to 1 so tween positions read as scroll fractions

  headerOverHero(section); // after the pin, so its end includes the pinned distance
}

// Transparent header while it floats over the hero footage (not motion — runs
// with reduced motion too, so the header always turns solid below the hero).
function headerOverHero(section: HTMLElement) {
  const header = document.querySelector('.site-header');
  const overHero = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom top+=80',
    onToggle: (self) => header?.classList.toggle('is-over-hero', self.isActive),
  });
  ScrollTrigger.addEventListener('refresh', () => header?.classList.toggle('is-over-hero', overHero.isActive));
}

function initShowcase() {
  const section = document.querySelector<HTMLElement>('[data-showcase]');
  const slides = section ? [...section.querySelectorAll<HTMLElement>('.slide')] : [];
  if (!section || !slides.length) return;
  const stage = section.querySelector<HTMLElement>('.showcase__stage')!;
  const athletes = slides.map((s) => s.querySelector<HTMLElement>('.athlete')!);

  if (reducedMotion) {
    athletes.forEach((el) => mountAthlete(el, { still: 0.55 }));
    return;
  }
  const players: Player[] = athletes.map((el) => mountAthlete(el));

  section.classList.add('is-pinned');
  const parts = (s: HTMLElement) => ({
    roll: s.querySelectorAll<HTMLElement>('[data-roll]'),
    visual: s.querySelector<HTMLElement>('.slide__visual')!,
  });
  const setShown = (s: HTMLElement, shown: boolean) => {
    const { roll, visual } = parts(s);
    gsap.killTweensOf([...roll, visual]);
    gsap.set(roll, { yPercent: shown ? 0 : 110, autoAlpha: shown ? 1 : 0 });
    gsap.set(visual, { autoAlpha: shown ? 1 : 0, scale: 1, filter: 'blur(0px)' });
    s.classList.toggle('is-active', shown);
    s.inert = !shown;
  };
  slides.forEach((s, i) => setShown(s, i === 0));

  let active = 0;
  const swap = (from: number, to: number) => {
    const dir = to > from ? 1 : -1;
    // Fast scrolls can skip slides — anything not involved snaps hidden.
    slides.forEach((s, i) => i !== from && i !== to && setShown(s, false));
    const a = parts(slides[from]);
    const b = parts(slides[to]);
    gsap.killTweensOf([...a.roll, a.visual, ...b.roll, b.visual]);
    gsap
      .timeline({ defaults: { duration: 0.8, ease: 'power3.inOut' } })
      .to(a.roll, { yPercent: -110 * dir, autoAlpha: 0, stagger: 0.05 }, 0)
      .to(a.visual, { autoAlpha: 0, scale: 0.96, filter: 'blur(8px)' }, 0)
      .fromTo(b.roll, { yPercent: 110 * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.06 }, 0.14)
      .fromTo(b.visual, { autoAlpha: 0, scale: 1.04, filter: 'blur(8px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)' }, 0.1);
    slides[from].classList.remove('is-active');
    slides[from].inert = true;
    slides[to].classList.add('is-active');
    slides[to].inert = false;
  };

  const n = slides.length;
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${Math.round(window.innerHeight * 1.25 * n)}`,
    pin: stage,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const x = self.progress * n;
      const index = Math.min(n - 1, Math.floor(x));
      // Small dead zones at both ends so each rep starts/finishes cleanly.
      players[index].render(clamp01((x - index - 0.04) / 0.88));
      if (index !== active) {
        swap(active, index);
        active = index;
      }
    },
  });
}

function initAbout() {
  const root = document.querySelector<HTMLElement>('[data-about]');
  if (!root || reducedMotion) return;
  root.classList.add('is-animated');

  const photoWrap = root.querySelector<HTMLElement>('.about-me__photo-wrap')!;
  const bio = root.querySelector<HTMLElement>('.about-me__bio')!;

  // About sits right above the footer, so the page may end before these
  // points are reached — clamp() keeps them within the scrollable range.

  // Bio lights up word by word while the gold ring fills clockwise from
  // 12 o'clock — one scroll timeline, so both finish together.
  const words = bio.querySelectorAll('.w');
  const wordsDuration = 0.5 + 0.12 * (words.length - 1); // tween duration + total stagger
  gsap
    .timeline({ scrollTrigger: { trigger: bio, start: 'top 85%', end: 'clamp(bottom 55%)', scrub: true } })
    .fromTo(words, { opacity: 0.16 }, { opacity: 1, ease: 'none', duration: 0.5, stagger: 0.12 }, 0)
    .fromTo(
      root.querySelector('.about-me__ring-progress'),
      { strokeDashoffset: 100 },
      { strokeDashoffset: 0, ease: 'none', duration: wordsDuration },
      0
    );

  // Credentials slide in one by one, like a data readout.
  gsap.fromTo(
    root.querySelectorAll('[data-cred]'),
    { x: -18, autoAlpha: 0 },
    {
      x: 0,
      autoAlpha: 1,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.14,
      scrollTrigger: { trigger: root.querySelector('.about-me__id'), start: 'top 90%', toggleActions: 'play none none reverse' },
    }
  );

  // Parallax drift of the portrait.
  gsap.fromTo(
    photoWrap,
    { y: 36 },
    { y: -36, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } }
  );
}

// Highlight the nav link of the section in the middle of the viewport.
function initNavSpy() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.nav-link[data-nav]')];
  const setActive = (id: string) => links.forEach((l) => l.classList.toggle('active', l.dataset.nav === id));
  for (const id of ['home', 'articles', 'about']) {
    const el = document.getElementById(id);
    if (!el) continue;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => self.isActive && setActive(id),
    });
  }
}

// Order matters: pins must exist before later triggers measure the page.
initHero();
initShowcase();
initAbout();
initNavSpy();
ScrollTrigger.refresh();
syncHashScroll();
