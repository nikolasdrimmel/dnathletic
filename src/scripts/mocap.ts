// Code-drawn "motion capture" barbell back squat. A biomechanically plausible
// sagittal-plane skeleton performs one rep as the scroll progresses: the bar
// stays over mid-foot (torso lean is solved for it), with a bar-path trace,
// knee/hip angle arcs and a live bar-velocity readout in an HTML HUD.
// Stands in for a photoreal clip; colours come from the palette tokens.

import type { Player } from './frames';

type Vec = { x: number; y: number };
type Pose = Record<'ankle' | 'knee' | 'hip' | 'shoulder' | 'neck' | 'head' | 'elbow' | 'hand' | 'bar', Vec>;

const rad = (d: number) => (d * Math.PI) / 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

// Segment lengths (m) for a ~1.80 m athlete, sagittal projection.
const SEG = { ankleY: 0.085, shank: 0.44, thigh: 0.45, torso: 0.5, upperArm: 0.2, neck: 0.05, head: 0.14, headR: 0.105 };
const MID_FOOT = 0.035; // bar sits over mid-foot, forward of the ankle
const BAR_BACK = 0.035; // high-bar: on the traps, just behind the shoulder joint
const BAR_UP = 0.02;
const PLATE_R = 0.225; // 450 mm bumper plate
const FACING = -1; // athlete faces left, toward the article text

// One rep (seconds). Scroll progress maps linearly onto this timeline.
const PHASES = [
  { name: 'Setup', dur: 0.45 },
  { name: 'Eccentric', dur: 1.6 },
  { name: 'Bottom', dur: 0.22 },
  { name: 'Concentric', dur: 0.85 },
  { name: 'Lockout', dur: 0.95 },
] as const;
const TOTAL = PHASES.reduce((sum, p) => sum + p.dur, 0);

// Concentric position profile from a velocity curve with a mild sticking region.
const CON_LUT = (() => {
  const n = 200;
  const lut = [0];
  let acc = 0;
  for (let i = 1; i <= n; i++) {
    const u = (i - 0.5) / n;
    acc += Math.pow(Math.sin(Math.PI * u), 1.2) * (1 - 0.22 * Math.exp(-(((u - 0.45) / 0.1) ** 2)));
    lut.push(acc);
  }
  return lut.map((v) => v / acc);
})();
const conPos = (u: number) => {
  const f = clamp01(u) * (CON_LUT.length - 1);
  const i = Math.floor(f);
  return i >= CON_LUT.length - 1 ? 1 : lerp(CON_LUT[i], CON_LUT[i + 1], f - i);
};

function phaseAt(t: number) {
  let start = 0;
  for (let i = 0; i < PHASES.length; i++) {
    const end = start + PHASES[i].dur;
    if (t <= end || i === PHASES.length - 1) return { index: i, u: clamp01((t - start) / PHASES[i].dur) };
    start = end;
  }
  return { index: 0, u: 0 };
}

// Depth (0 standing … 1 bottom) and a few mm of horizontal bar drift so the
// traced bar path forms the thin loop seen in real squat data.
function depthAt(t: number) {
  const { index, u } = phaseAt(t);
  switch (PHASES[index].name) {
    case 'Eccentric':
      return { s: (1 - Math.cos(Math.PI * u)) / 2, drift: 0.012 * Math.sin(Math.PI * u) };
    case 'Bottom':
      return { s: 1, drift: 0 };
    case 'Concentric':
      return { s: 1 - conPos(u), drift: -0.008 * Math.sin(Math.PI * u) };
    default:
      return { s: 0, drift: 0 };
  }
}

function pose(s: number, drift: number): Pose & { torsoLean: number } {
  const shankLean = rad(lerp(2, 34, s)); // ankle dorsiflexion
  const thighAngle = rad(lerp(-4, 100, s)); // knee→hip vector, from vertical (backwards +)
  const ankle = { x: 0, y: SEG.ankleY };
  const knee = { x: ankle.x + SEG.shank * Math.sin(shankLean), y: ankle.y + SEG.shank * Math.cos(shankLean) };
  const hip = { x: knee.x - SEG.thigh * Math.sin(thighAngle), y: knee.y + SEG.thigh * Math.cos(thighAngle) };

  // Solve the torso lean that keeps the bar over mid-foot.
  const target = MID_FOOT + drift;
  let lo = rad(-15);
  let hi = rad(70);
  for (let i = 0; i < 28; i++) {
    const m = (lo + hi) / 2;
    const barX = hip.x + (SEG.torso + BAR_UP) * Math.sin(m) - BAR_BACK * Math.cos(m);
    if (barX < target) lo = m;
    else hi = m;
  }
  const lean = (lo + hi) / 2;
  const up = { x: Math.sin(lean), y: Math.cos(lean) };
  const back = { x: -Math.cos(lean), y: Math.sin(lean) };
  const shoulder = { x: hip.x + SEG.torso * up.x, y: hip.y + SEG.torso * up.y };
  const bar = { x: shoulder.x + back.x * BAR_BACK + up.x * BAR_UP, y: shoulder.y + back.y * BAR_BACK + up.y * BAR_UP };
  const neck = { x: shoulder.x + up.x * SEG.neck, y: shoulder.y + up.y * SEG.neck };
  const headLean = lean * 0.4; // gaze stays neutral, head more upright than the trunk
  const head = { x: neck.x + Math.sin(headLean) * SEG.head, y: neck.y + Math.cos(headLean) * SEG.head };
  const elbowDir = lean + rad(208); // elbows point down and back under the bar
  const elbow = { x: shoulder.x + Math.sin(elbowDir) * SEG.upperArm, y: shoulder.y + Math.cos(elbowDir) * SEG.upperArm };
  const hand = { x: bar.x + 0.03, y: bar.y + 0.005 };
  return { ankle, knee, hip, shoulder, neck, head, elbow, hand, bar, torsoLean: lean };
}

const barAt = (t: number) => {
  const { s, drift } = depthAt(t);
  return pose(s, drift).bar;
};
const velocityAt = (t: number) => {
  const h = 0.004;
  return (barAt(Math.min(TOTAL, t + h)).y - barAt(Math.max(0, t - h)).y) / (Math.min(TOTAL, t + h) - Math.max(0, t - h));
};

// Precomputed rep data: bar path + velocity curve + mean concentric velocity.
const SAMPLES = Array.from({ length: 241 }, (_, i) => {
  const t = (i / 240) * TOTAL;
  return { t, bar: barAt(t), v: velocityAt(t) };
});
const V_MAX = Math.max(...SAMPLES.map((s) => Math.abs(s.v)));
const CON_START = PHASES[0].dur + PHASES[1].dur + PHASES[2].dur;
const CON_END = CON_START + PHASES[3].dur;
const MCV = (barAt(CON_END).y - barAt(CON_START).y) / PHASES[3].dur;

function readPalette() {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    ink: get('--c-ink', '#f3eee2'),
    muted: get('--c-muted', '#9c9588'),
    gold: get('--c-gold', '#e9b23c'),
    panel: get('--c-panel', '#1a1d21'),
    body: get('--c-panel-hover', '#22262b'),
  };
}

// '#rrggbb' + alpha → rgba()
function tint(hex: string, alpha: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

let hudSeq = 0;

export class MocapSquat implements Player {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly c = readPalette();
  private w = 0;
  private h = 0;
  private dpr = 1;
  private progress = 0;
  private hud: {
    value: HTMLElement;
    phase: HTMLElement;
    mcv: HTMLElement;
    clip: SVGRectElement;
    cursor: SVGCircleElement;
  } | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    hudRoot: HTMLElement | null
  ) {
    this.ctx = canvas.getContext('2d')!;
    if (hudRoot) this.hud = this.buildHud(hudRoot);
    new ResizeObserver(() => this.resize()).observe(canvas);
    // Canvas labels use JetBrains Mono — redraw once the webfont is in.
    document.fonts?.ready.then(() => this.draw());
  }

  render(progress: number) {
    this.progress = clamp01(progress);
    this.draw();
  }

  private resize() {
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.draw();
  }

  // World (metres, y up) → canvas (CSS px). Fits a 1.6 × 2.08 m box.
  private get scale() {
    return Math.min(this.w / 1.6, this.h / 2.08) * 0.92;
  }
  // Figure sits a little left of centre, clear of the HUD (top-right).
  private sx(x: number) {
    const anchor = this.w * (this.w < 520 ? 0.42 : 0.46);
    return anchor + FACING * (x - MID_FOOT) * this.scale;
  }
  private sy(y: number) {
    const top = (this.h - 2.08 * this.scale) / 2;
    return top + (2.0 - y) * this.scale;
  }
  private pt(v: Vec): Vec {
    return { x: this.sx(v.x), y: this.sy(v.y) };
  }

  private draw() {
    if (!this.w || !this.h) return;
    const { ctx, c } = this;
    const k = this.scale;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);

    const t = this.progress * TOTAL;
    const { s, drift } = depthAt(t);
    const p = pose(s, drift);
    const v = velocityAt(t);
    const phase = PHASES[phaseAt(t).index].name;

    this.drawGrid();

    // Platform
    ctx.strokeStyle = tint(c.ink, 0.22);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.sx(-0.62), this.sy(0));
    ctx.lineTo(this.sx(0.68), this.sy(0));
    ctx.stroke();

    // Full bar path (faint) + the part travelled so far (gold)
    ctx.setLineDash([2, 5]);
    ctx.strokeStyle = tint(c.gold, 0.22);
    this.polyline(SAMPLES.map((q) => q.bar));
    ctx.setLineDash([]);
    const done = SAMPLES.filter((q) => q.t <= t).map((q) => q.bar);
    done.push(p.bar);
    ctx.strokeStyle = tint(c.gold, 0.9);
    ctx.lineWidth = 1.5;
    this.polyline(done);

    // Onion-skin ghosts while the bar is moving
    if (Math.abs(v) > 0.05) {
      [0.09, 0.18].forEach((dt, i) => {
        const g = depthAt(Math.max(0, t - dt));
        this.skeleton(pose(g.s, g.drift), tint(c.ink, i ? 0.06 : 0.12), 1.25);
      });
    }

    // Body volume (opaque, so overlapping limbs don't stack alpha)
    ctx.lineCap = 'round';
    ctx.strokeStyle = c.body;
    const limb = (a: Vec, b: Vec, width: number) => {
      ctx.lineWidth = width * k;
      ctx.beginPath();
      ctx.moveTo(this.sx(a.x), this.sy(a.y));
      ctx.lineTo(this.sx(b.x), this.sy(b.y));
      ctx.stroke();
    };
    limb({ x: -0.05, y: 0.035 }, { x: 0.19, y: 0.035 }, 0.07); // shoe
    limb(p.ankle, p.knee, 0.095);
    limb(p.knee, p.hip, 0.14);
    limb(p.hip, p.shoulder, 0.21);
    limb(p.shoulder, p.elbow, 0.075);
    limb(p.elbow, p.hand, 0.065);
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.arc(this.sx(p.head.x), this.sy(p.head.y), SEG.headR * k, 0, Math.PI * 2);
    ctx.fill();

    // Skeleton
    this.skeleton(p, tint(c.ink, 0.9), 2);

    // Joint flexion arcs: between the extension of the distal segment and the
    // proximal one, so a straight joint reads 0° (knee label in front, hip behind).
    this.flexionArc(p.knee, p.ankle, p.hip, 'KNEE', FACING);
    this.flexionArc(p.hip, p.knee, p.shoulder, 'HIP', -FACING);

    // Joint markers
    for (const j of [p.ankle, p.knee, p.hip, p.shoulder, p.elbow]) this.marker(j);

    // Barbell: translucent plate (x-ray look), sleeve, velocity sensor
    const b = this.pt(p.bar);
    ctx.fillStyle = tint(c.panel, 0.45);
    ctx.strokeStyle = tint(c.ink, 0.42);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(b.x, b.y, PLATE_R * k, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = tint(c.ink, 0.14);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(b.x, b.y, PLATE_R * k * 0.62, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = tint(c.ink, 0.85);
    ctx.beginPath();
    ctx.arc(b.x, b.y, 0.025 * k, 0, Math.PI * 2);
    ctx.fill();
    const sensor = { x: b.x + FACING * -0.05 * k, y: b.y - 0.06 * k };
    ctx.fillStyle = c.gold;
    ctx.beginPath();
    ctx.roundRect(sensor.x - 0.022 * k, sensor.y - 0.014 * k, 0.044 * k, 0.028 * k, 2);
    ctx.fill();
    ctx.fillStyle = tint(c.gold, 0.35 + 0.65 * Math.abs(Math.sin(t * 6)));
    ctx.beginPath();
    ctx.arc(sensor.x, sensor.y - 0.03 * k, 2, 0, Math.PI * 2);
    ctx.fill();

    // Tracked bar point (crosshair)
    ctx.strokeStyle = c.gold;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
    ctx.moveTo(b.x - 11, b.y);
    ctx.lineTo(b.x - 3, b.y);
    ctx.moveTo(b.x + 3, b.y);
    ctx.lineTo(b.x + 11, b.y);
    ctx.stroke();

    this.updateHud(t, v, phase);
  }

  private drawGrid() {
    const { ctx, c } = this;
    const cx = this.sx(MID_FOOT);
    const cy = this.h / 2;
    const maxD = Math.hypot(this.w, this.h) / 2;
    for (let x = -0.75; x <= 0.8; x += 0.25) {
      for (let y = 0.25; y <= 2.0; y += 0.25) {
        const px = this.sx(x);
        const py = this.sy(y);
        const a = 0.2 * Math.pow(1 - Math.min(1, Math.hypot(px - cx, py - cy) / maxD), 1.6);
        ctx.fillStyle = tint(c.ink, a);
        ctx.fillRect(px - 0.75, py - 0.75, 1.5, 1.5);
      }
    }
    // Height scale on the trailing side
    ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillStyle = tint(c.muted, 0.7);
    ctx.textAlign = FACING < 0 ? 'left' : 'right';
    for (const y of [0.5, 1.0, 1.5]) ctx.fillText(`${y.toFixed(1)} m`, this.sx(-0.62), this.sy(y) + 3);
  }

  private polyline(points: Vec[]) {
    const { ctx } = this;
    ctx.beginPath();
    points.forEach((q, i) => (i ? ctx.lineTo(this.sx(q.x), this.sy(q.y)) : ctx.moveTo(this.sx(q.x), this.sy(q.y))));
    ctx.stroke();
  }

  private skeleton(p: Pose, color: string, width: number) {
    const ctx = this.ctx;
    const k = this.scale;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(this.sx(-0.05), this.sy(0.02));
    ctx.lineTo(this.sx(0.19), this.sy(0.02));
    ctx.moveTo(this.sx(p.ankle.x), this.sy(p.ankle.y));
    for (const j of [p.knee, p.hip, p.shoulder, p.neck]) ctx.lineTo(this.sx(j.x), this.sy(j.y));
    ctx.moveTo(this.sx(p.shoulder.x), this.sy(p.shoulder.y));
    ctx.lineTo(this.sx(p.elbow.x), this.sy(p.elbow.y));
    ctx.lineTo(this.sx(p.hand.x), this.sy(p.hand.y));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.sx(p.head.x), this.sy(p.head.y), SEG.headR * k, 0, Math.PI * 2);
    ctx.stroke();
  }

  private marker(j: Vec) {
    const { ctx, c } = this;
    const q = this.pt(j);
    ctx.fillStyle = c.gold;
    ctx.beginPath();
    ctx.arc(q.x, q.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = tint(c.gold, 0.35);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(q.x, q.y, 6.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Flexion at `joint`: angle between the distal segment's extension
  // (joint − distal) and the proximal segment (proximal − joint).
  private flexionArc(joint: Vec, distal: Vec, proximal: Vec, name: string, labelSide: number) {
    const { ctx, c } = this;
    const v = this.pt(joint);
    const d = this.pt(distal);
    const q = this.pt(proximal);
    const a1 = Math.atan2(v.y - d.y, v.x - d.x);
    const a2 = Math.atan2(q.y - v.y, q.x - v.x);
    const delta = ((a2 - a1 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    const flexion = Math.round((Math.abs(delta) * 180) / Math.PI);
    if (flexion > 3) {
      ctx.strokeStyle = tint(c.gold, 0.6);
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(v.x, v.y, Math.max(14, 0.085 * this.scale), a1, a1 + delta, delta < 0);
      ctx.stroke();
    }
    ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = tint(c.muted, 0.95);
    ctx.fillText(`${name} ${flexion}°`, v.x + labelSide * 52, v.y + 4);
  }

  private buildHud(root: HTMLElement) {
    const id = `mocap-clip-${++hudSeq}`;
    const W = 160;
    const H = 40;
    const y = (v: number) => H / 2 - (v / V_MAX) * (H / 2 - 3);
    const d = SAMPLES.map((q, i) => `${i ? 'L' : 'M'}${((q.t / TOTAL) * W).toFixed(1)} ${y(q.v).toFixed(1)}`).join(' ');
    root.innerHTML = `
      <span class="mocap-hud__label">Bar velocity</span>
      <span class="mocap-hud__value"><b data-v>0.00</b> m/s</span>
      <svg class="mocap-hud__spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <clipPath id="${id}"><rect data-clip x="0" y="0" width="0" height="${H}" /></clipPath>
        <line class="mocap-hud__zero" x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" />
        <path class="mocap-hud__curve" d="${d}" />
        <path class="mocap-hud__curve is-live" d="${d}" clip-path="url(#${id})" />
        <circle class="mocap-hud__cursor" data-cursor r="2.5" cx="0" cy="${H / 2}" />
      </svg>
      <span class="mocap-hud__meta">Phase <b data-phase>Setup</b></span>
      <span class="mocap-hud__meta mocap-hud__mcv" data-mcv>MCV <b>${MCV.toFixed(2)} m/s</b></span>`;
    return {
      value: root.querySelector<HTMLElement>('[data-v]')!,
      phase: root.querySelector<HTMLElement>('[data-phase]')!,
      mcv: root.querySelector<HTMLElement>('[data-mcv]')!,
      clip: root.querySelector<SVGRectElement>('[data-clip]')!,
      cursor: root.querySelector<SVGCircleElement>('[data-cursor]')!,
    };
  }

  private updateHud(t: number, v: number, phase: string) {
    if (!this.hud) return;
    const W = 160;
    const H = 40;
    const x = (t / TOTAL) * W;
    this.hud.value.textContent = Math.abs(v).toFixed(2);
    this.hud.value.classList.toggle('is-concentric', phase === 'Concentric');
    this.hud.phase.textContent = phase;
    this.hud.mcv.classList.toggle('is-visible', t >= CON_END);
    this.hud.clip.setAttribute('width', x.toFixed(1));
    this.hud.cursor.setAttribute('cx', x.toFixed(1));
    this.hud.cursor.setAttribute('cy', (H / 2 - (v / V_MAX) * (H / 2 - 3)).toFixed(1));
  }
}
