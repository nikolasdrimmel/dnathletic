"""Green-screen clip -> transparent WebP frame sequence in the palette white.

    python scripts/key_green_frames.py <clip.mp4> <id> [--pad 16] [--sequence SPEC]

For flat two-colour clips (figure in off-white, background + contour lines in
chroma green): every pixel's alpha comes from its green excess g - max(r, b),
and its colour is snapped to the palette's Warm Off-White Ink (#f3eee2), so the
contour lines turn transparent and the page background shows through them.
Frames are cropped to the union bounding box of the subject across the clip and
written to public/anim/<id>/f001.webp ... ; the registry entry is printed.

--sequence edits the clip: comma-separated 0-based frame ranges; a leading "~"
crossfades into that range over --fade frames, e.g. "0-11,~20-78,~120-140".
"""
import argparse
import os
import sys

import cv2
import numpy as np
from PIL import Image

INK = (0xF3, 0xEE, 0xE2)  # --c-ink
LO, HI = 18.0, 80.0       # green excess: <= LO opaque, >= HI fully transparent

ap = argparse.ArgumentParser()
ap.add_argument('clip')
ap.add_argument('id')
ap.add_argument('--pad', type=int, default=16)
ap.add_argument('--sequence', help='e.g. "0-11,~20-78,~120-140"')
ap.add_argument('--fade', type=int, default=4, help='crossfade length in frames')
args = ap.parse_args()

cap = cv2.VideoCapture(args.clip)
alphas = []
while True:
    ok, bgr = cap.read()
    if not ok:
        break
    f = bgr.astype(np.float32)
    b, g, r = f[..., 0], f[..., 1], f[..., 2]
    excess = g - np.maximum(r, b)
    alphas.append(np.clip((HI - excess) / (HI - LO), 0.0, 1.0))
cap.release()
if not alphas:
    sys.exit(f'no frames read from {args.clip}')

if args.sequence:
    edited = []
    for part in args.sequence.split(','):
        fade = part.startswith('~')
        a, b = (int(v) for v in part.lstrip('~').split('-'))
        if fade and edited:
            prev, nxt = edited[-1], alphas[a]
            for k in range(1, args.fade + 1):
                t = k / (args.fade + 1)
                edited.append(prev * (1 - t) + nxt * t)
        edited.extend(alphas[a:b + 1])
    alphas = edited

H, W = alphas[0].shape
union = np.zeros((H, W), bool)
for a in alphas:
    union |= a > 0.5
ys, xs = np.nonzero(union)
x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
touch = [s for s, hit in (('left', x0 == 0), ('right', x1 == W), ('top', y0 == 0), ('bottom', y1 == H)) if hit]
x0, y0 = max(0, x0 - args.pad), max(0, y0 - args.pad)
x1, y1 = min(W, x1 + args.pad), min(H, y1 + args.pad)
cw, ch = x1 - x0, y1 - y0

out = os.path.join('public', 'anim', args.id)
os.makedirs(out, exist_ok=True)
for name in os.listdir(out):
    if name.endswith('.webp'):
        os.remove(os.path.join(out, name))

rgba = np.empty((ch, cw, 4), np.uint8)
rgba[..., :3] = INK
total = 0
for i, a in enumerate(alphas, 1):
    rgba[..., 3] = np.round(a[y0:y1, x0:x1] * 255).astype(np.uint8)
    path = os.path.join(out, f'f{i:03d}.webp')
    Image.fromarray(rgba, 'RGBA').save(path, 'WEBP', quality=82, method=6)
    total += os.path.getsize(path)

# Horizontal extent of the subject inside the cropped frame (for `span`).
sx = np.nonzero(union[y0:y1, x0:x1].any(axis=0))[0]
span = (round(sx.min() / cw, 3), round((sx.max() + 1) / cw, 3))
print(f'{len(alphas)} frames {cw}x{ch} -> {out} ({total / 1024:.0f} KB)')
if touch:
    print('WARNING: subject touches the source frame edge:', ', '.join(touch))
print(f"  count: {len(alphas)},\n  width: {cw},\n  height: {ch},\n  transparent: true,\n  span: [{span[0]}, {span[1]}],")
