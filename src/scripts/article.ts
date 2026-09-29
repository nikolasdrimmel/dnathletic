// Article page: gold reading-progress bar.

import { ScrollTrigger } from './motion';

const progressBar = document.querySelector<HTMLElement>('.read-progress');
const prose = document.querySelector<HTMLElement>('.prose');
if (progressBar && prose) {
  ScrollTrigger.create({
    trigger: prose,
    start: 'top 80%',
    end: 'bottom bottom',
    onUpdate: (self) => (progressBar.style.transform = `scaleX(${self.progress.toFixed(4)})`),
  });

  // Figures load lazily and change the page height — keep the bar's range in sync.
  prose.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
}
