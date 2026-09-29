// Bar-velocity HUD for photoreal clips, driven by measured data
// (public/anim/<id>/telemetry.json: per-frame velocity in m/s, phase start
// points as 0–1 progress, mean concentric velocity). Same look as the mocap HUD.

export type Telemetry = {
  velocity: number[];
  phases: [string, number][];
  mcv: number;
};

const W = 160;
const H = 40;
let seq = 0;

export class RepHud {
  private readonly value: HTMLElement;
  private readonly phase: HTMLElement;
  private readonly mcv: HTMLElement;
  private readonly clip: SVGRectElement;
  private readonly cursor: SVGCircleElement;
  private readonly vMax: number;
  private readonly lockout: number;

  constructor(root: HTMLElement, private readonly t: Telemetry) {
    this.vMax = Math.max(...t.velocity.map(Math.abs)) || 1;
    this.lockout = t.phases.find(([name]) => name === 'Lockout')?.[1] ?? 1;
    const id = `rep-hud-clip-${++seq}`;
    const n = t.velocity.length;
    const d = t.velocity.map((v, i) => `${i ? 'L' : 'M'}${((i / (n - 1)) * W).toFixed(1)} ${this.y(v).toFixed(1)}`).join(' ');
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
      <span class="mocap-hud__meta mocap-hud__mcv" data-mcv>MCV <b>${t.mcv.toFixed(2)} m/s</b></span>`;
    this.value = root.querySelector('[data-v]')!;
    this.phase = root.querySelector('[data-phase]')!;
    this.mcv = root.querySelector('[data-mcv]')!;
    this.clip = root.querySelector('[data-clip]')!;
    this.cursor = root.querySelector('[data-cursor]')!;
  }

  private y(v: number) {
    return H / 2 - (v / this.vMax) * (H / 2 - 3);
  }

  render(progress: number) {
    const p = Math.min(1, Math.max(0, progress));
    const { velocity, phases } = this.t;
    const f = p * (velocity.length - 1);
    const i = Math.floor(f);
    const v = i >= velocity.length - 1 ? velocity[velocity.length - 1] : velocity[i] + (velocity[i + 1] - velocity[i]) * (f - i);
    const phase = [...phases].reverse().find(([, start]) => p >= start)?.[0] ?? phases[0][0];
    this.value.textContent = Math.abs(v).toFixed(2);
    this.value.classList.toggle('is-concentric', phase === 'Concentric');
    this.phase.textContent = phase;
    this.mcv.classList.toggle('is-visible', p >= this.lockout);
    this.clip.setAttribute('width', (p * W).toFixed(1));
    this.cursor.setAttribute('cx', (p * W).toFixed(1));
    this.cursor.setAttribute('cy', this.y(v).toFixed(1));
  }
}
