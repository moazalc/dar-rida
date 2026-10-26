# Placeholder media

Everything in `public/media/` is a stand-in until the studio shoot. Replace it
with real Dar Rida photography/footage before launch.

| File | Source | License |
|---|---|---|
| `hero-montage.mp4`, `hero-poster.jpg` | Pexels videos 4870526 (black fabric drape), 5815276 (cutting satin), 6459999 (hand sewing), 5815517 (hand beading) — trimmed, crossfaded and colour-graded into one loop | Pexels License (free commercial use, no attribution required) |
| `process-1.jpg` … `process-3.jpg` | Frames from Pexels 4870526, 5815276, 6459999, cropped 4:5 and graded to match the hero | Pexels License |
| `craft.jpg` | Pexels photo 4935559 by Brett Jordan (resized) | Pexels License |
| `lace.jpg` | Unsplash photo `Y3Oh8fF0st8` by Art Institute of Chicago (resized) | Unsplash License |

## Not licensed — must be replaced before launch

Saved from Pinterest as layout references; the owners and terms are unknown.
`rida-01.jpg` shows another label's tag ("NSAA") and `design-stand.jpg` carries an
AI-image mark. Fine for local development only.

| File | Shows |
|---|---|
| `collection-rail.jpg` | Black abayas on a rail (black and white) |
| `rida-01.jpg` | Black cape-sleeve abaya on a dress form, arched niche |
| `design-stand.jpg` | White and black embroidered abayas on a form and a stand |
| `process-sent.jpg` | Folded scarves in a kraft box with tissue paper |

## 3D models (`public/models/`)

Used in the Design Your Abaya studio. Downloaded at 1k texture resolution and
compressed to GLB (meshopt geometry, WebP textures) with `@gltf-transform/cli optimize`.

| File | Source | License |
|---|---|---|
| `potted_plant_01.glb` | Poly Haven — Potted Plant 01 | CC0 |
| `potted_plant_02.glb` | Poly Haven — Potted Plant 02 | CC0 |
| `ceramic_vase_02.glb` | Poly Haven — Ceramic Vase 02 | CC0 |
| `ceramic_vase_04.glb` | Poly Haven — Ceramic Vase 04 | CC0 |

The backdrop, floor lamp, garment rack and dress form are built in code
(`components/design/studio.tsx`, `components/design/placeholder-abaya.tsx`).

## Lighting (`public/hdri/`)

| File | Source | License |
|---|---|---|
| `studio_london_hall_1k.hdr` | Poly Haven — Photo Studio London Hall (1k) | CC0 |
