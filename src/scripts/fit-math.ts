// Shrinks display formulas that are wider than their card so nothing in an
// article ever needs sideways scrolling on phones. Formulas that fit keep their
// stylesheet size; re-fits whenever the reading column changes width.

const displays = () => document.querySelectorAll<HTMLElement>('.prose .katex-display');

function fit() {
  displays().forEach((box) => {
    const math = box.querySelector<HTMLElement>(':scope > .katex');
    if (!math) return;
    math.style.fontSize = '';
    const overflow = box.scrollWidth / box.clientWidth;
    if (overflow > 1.001) {
      const px = parseFloat(getComputedStyle(math).fontSize);
      // 2% headroom: KaTeX widths don't scale perfectly linearly with font size.
      math.style.fontSize = `${Math.floor((px / overflow) * 98) / 100}px`;
    }
  });
}

export function fitMath(onChange?: () => void) {
  const prose = document.querySelector<HTMLElement>('.prose');
  if (!prose || !displays().length) return;
  let width = 0;
  const run = () => {
    fit();
    onChange?.();
  };
  // KaTeX fonts change the formula widths once they load.
  document.fonts.ready.then(run);
  new ResizeObserver(([entry]) => {
    const w = Math.round(entry!.contentRect.width);
    if (w !== width) {
      width = w;
      run();
    }
  }).observe(prose);
}
