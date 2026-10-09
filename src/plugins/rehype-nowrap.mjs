// Keeps punctuation from being orphaned at a line break (runs after rehype-katex):
//   • inline formulas: an opening bracket right before and closing brackets /
//     punctuation right after are wrapped with the formula in <span class="nowrap">;
//   • citation links (href="#ref-…"): the space before them becomes a no-break
//     space, so "[2]" never starts a line on its own.

const OPEN = /[([{"“‘'«]+$/;
const CLOSE = /^[)\]}"”’'».,;:!?%]+/;

const hasClass = (node, name) => {
  const cls = node.properties?.className;
  return Array.isArray(cls) ? cls.includes(name) : cls === name;
};
const isInlineMath = (node) => node.type === 'element' && hasClass(node, 'katex');
const isCitation = (node) =>
  node.type === 'element' && node.tagName === 'a' && String(node.properties?.href ?? '').startsWith('#ref-');

function glue(parent) {
  const kids = parent.children;
  for (let i = 0; i < kids.length; i++) {
    const node = kids[i];

    if (isCitation(node)) {
      const prev = kids[i - 1];
      if (prev?.type === 'text') prev.value = prev.value.replace(/\s+$/, ' ');
      continue;
    }

    if (isInlineMath(node)) {
      const wrapped = [node];
      const prev = kids[i - 1];
      const next = kids[i + 1];
      const open = prev?.type === 'text' ? prev.value.match(OPEN) : null;
      const close = next?.type === 'text' ? next.value.match(CLOSE) : null;
      if (!open && !close) continue;
      if (open) {
        prev.value = prev.value.slice(0, -open[0].length);
        wrapped.unshift({ type: 'text', value: open[0] });
      }
      if (close) {
        next.value = next.value.slice(close[0].length);
        wrapped.push({ type: 'text', value: close[0] });
      }
      kids[i] = {
        type: 'element',
        tagName: 'span',
        properties: { className: ['nowrap'] },
        children: wrapped,
      };
      continue;
    }

    // Don't descend into rendered math; recurse everywhere else.
    if (node.type === 'element' && !hasClass(node, 'katex-display') && node.children) glue(node);
  }
}

export default function rehypeNowrap() {
  return (tree) => glue(tree);
}
