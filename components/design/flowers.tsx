"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * White flowers for the studio, built in code: no free model of white tulips
 * or calla lilies was good enough. Each arrangement is a handful of merged
 * meshes (petals, stems and leaves) shaped to sit in a Poly Haven vase — the
 * caller places the vase, these take its rim height and opening as given.
 */

const PETAL_WHITE = new THREE.Color("#f7f4ec");
const THROAT_GREEN = new THREE.Color("#c9cf9c");
const TULIP_BASE = new THREE.Color("#dfe2bd");

const UP = new THREE.Vector3(0, 1, 0);

/** Small seeded generator, so the arrangement is the same on every visit. */
function random(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * A surface over a (cols × rows) grid: `at(u, v)` gives the point for u, v in
 * 0..1, `tint(u, v)` an optional vertex colour.
 */
function grid(
  cols: number,
  rows: number,
  at: (u: number, v: number) => THREE.Vector3,
  tint?: (u: number, v: number) => THREE.Color,
) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const index: number[] = [];
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      const v = j / rows;
      const p = at(u, v);
      positions.push(p.x, p.y, p.z);
      uvs.push(u, v);
      if (tint) {
        const c = tint(u, v);
        colors.push(c.r, c.g, c.b);
      }
    }
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i;
      const b = a + cols + 1;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  if (tint) g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/** A matrix that stands a head built along +Y on `base`, axis `axis`, its front (+Z) toward `facing`. */
function orient(base: THREE.Vector3, axis: THREE.Vector3, facing: THREE.Vector3) {
  const y = axis.clone().normalize();
  const z = facing.clone().sub(y.clone().multiplyScalar(facing.dot(y))).normalize();
  const x = new THREE.Vector3().crossVectors(y, z);
  return new THREE.Matrix4().makeBasis(x, y, z).setPosition(base);
}

/**
 * A strap leaf along a curve: pointed tip, a soft fold down the midrib and a
 * slow twist, so it catches the light the way a real blade does.
 */
function leaf(curve: THREE.Curve<THREE.Vector3>, side: THREE.Vector3, width: number, twist: number) {
  return grid(6, 30, (u, v) => {
    const a = u * 2 - 1;
    const p = curve.getPointAt(v);
    const t = curve.getTangentAt(v);
    const s = side.clone().sub(t.clone().multiplyScalar(side.dot(t))).normalize().applyAxisAngle(t, twist * v);
    const n = new THREE.Vector3().crossVectors(t, s);
    const w = width * Math.pow(Math.sin(Math.PI * Math.min(0.999, 0.12 + v * 0.88)), 0.75);
    return p.add(s.multiplyScalar(a * w)).add(n.multiplyScalar(a * a * w * 0.35));
  });
}

/**
 * Calla lily spathe, built along +Y and open to +Z: a slim funnel that wraps
 * round itself at the base, widens, rolls its lip outward and rises to a
 * pointed tip at the back.
 */
function spathe(length: number, radius: number) {
  return grid(
    28,
    32,
    (u, v) => {
      const a = u * 2 - 1;
      const edge = Math.abs(a);
      const half = THREE.MathUtils.lerp(Math.PI * 1.04, Math.PI * 0.6, smooth(v));
      const phi = a * half;
      const roll = Math.pow(edge, 2.4) * Math.pow(v, 2.2) * 0.65;
      // The two edges overlap at the base; one sits just outside the other.
      const r = (0.2 + 0.8 * Math.pow(v, 1.25)) * radius * (1 + 0.05 * a) * (1 + roll);
      const centre = Math.pow(1 - edge, 2);
      const y = v * length * (1 + 0.32 * centre) - roll * radius * 0.6;
      const lean = Math.pow(v, 3) * centre * length * 0.22;
      return new THREE.Vector3(r * Math.sin(phi), y, -r * Math.cos(phi) - lean);
    },
    (_, v) => THROAT_GREEN.clone().lerp(PETAL_WHITE, smooth(Math.min(1, v * 3.2))),
  );
}

/**
 * Tulip head, built along +Y: three outer and three inner petals on an egg-
 * shaped cup, closed or just opening (`open` 0..1).
 */
function tulipHead(height: number, radius: number, open: number) {
  const petals: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 6; k++) {
    const inner = k % 2 === 1;
    const theta0 = (k * Math.PI) / 3;
    const scale = inner ? 0.93 : 1;
    const span = inner ? 1.05 : 1.15;
    petals.push(
      grid(
        14,
        18,
        (u, v) => {
          const a = u * 2 - 1;
          const half = span * Math.sqrt(Math.sin(Math.PI * Math.min(0.995, v)));
          const theta = theta0 + a * half;
          let r = radius * Math.pow(Math.sin(Math.PI * (0.08 + 0.8 * v)), 0.7);
          r += radius * open * Math.pow(v, 2.5) * 1.1;
          r *= scale * (1 + 0.06 * (1 - a * a));
          const y = v * height * (inner ? 0.97 : 1);
          return new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
        },
        (_, v) => TULIP_BASE.clone().lerp(PETAL_WHITE, smooth(Math.min(1, v * 3))),
      ),
    );
  }
  const head = mergeGeometries(petals)!;
  for (const p of petals) p.dispose();
  return head;
}

/** Frees an arrangement's geometry when it is rebuilt or unmounted. */
function useDispose(geometries: Record<string, THREE.BufferGeometry>) {
  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);
}

function usePetalMaterial() {
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.55,
        sheen: 0.6,
        sheenRoughness: 0.5,
        sheenColor: new THREE.Color("#ffffff"),
        side: THREE.DoubleSide,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

/**
 * Five white calla lilies standing tall out of a bottle vase. `neck` is the
 * height the stems start from inside the vase (hidden), `rim` the height of
 * its mouth, `opening` the mouth's inner radius.
 */
export function CallaLilies({
  neck,
  rim,
  opening,
  facing = [0, 0, 1],
}: {
  neck: number;
  rim: number;
  opening: number;
  /** Rough direction of the viewer, in the vase's frame. */
  facing?: [number, number, number];
}) {
  const [fx, fy, fz] = facing;
  const petal = usePetalMaterial();
  const geo = useMemo(() => {
    const rand = random(11);
    const toward = new THREE.Vector3(fx, fy, fz).normalize().multiplyScalar(0.9);
    const heads: THREE.BufferGeometry[] = [];
    const stems: THREE.BufferGeometry[] = [];
    const spadices: THREE.BufferGeometry[] = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      const az = 0.4 + (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.5;
      const out = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
      const lean = 0.1 + rand() * 0.24;
      const top = rim + 0.42 + rand() * 0.3;
      const start = out.clone().multiplyScalar(opening * 0.25).setY(neck);
      const len = top - neck;
      const end = start
        .clone()
        .add(UP.clone().multiplyScalar(len * Math.cos(lean)))
        .add(out.clone().multiplyScalar(len * Math.sin(lean)));
      const mid = start
        .clone()
        .add(UP.clone().multiplyScalar(len * 0.55))
        .add(out.clone().multiplyScalar(len * Math.sin(lean) * 0.25));
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      stems.push(new THREE.TubeGeometry(curve, 40, 0.0055, 8));

      // The head bends a little further out than the stem, opening to the room.
      const tangent = curve.getTangentAt(1);
      const bend = 0.15 + rand() * 0.2;
      const axis = tangent.multiplyScalar(Math.cos(bend)).add(out.clone().multiplyScalar(Math.sin(bend)));
      // Mouths turn partly toward the room, so they read as trumpets, not flags.
      const m = orient(end, axis, out.clone().add(toward).add(UP.clone().multiplyScalar(0.3)));
      const length = 0.13 + rand() * 0.03;
      heads.push(spathe(length, 0.036).applyMatrix4(m));

      const spadix = new THREE.CapsuleGeometry(0.0035, length * 0.32, 4, 10);
      spadix.translate(0, length * 0.25, 0.004);
      spadices.push(spadix.applyMatrix4(m));
    }
    return {
      heads: mergeGeometries(heads)!,
      stems: mergeGeometries(stems)!,
      spadices: mergeGeometries(spadices)!,
    };
  }, [neck, rim, opening, fx, fy, fz]);
  useDispose(geo);

  return (
    <group>
      <mesh geometry={geo.heads} material={petal} castShadow />
      <mesh geometry={geo.stems} castShadow>
        <meshStandardMaterial color="#5f7a43" roughness={0.45} />
      </mesh>
      <mesh geometry={geo.spadices}>
        <meshStandardMaterial color="#e6bd4c" roughness={0.7} />
      </mesh>
    </group>
  );
}

/**
 * A loose bunch of white tulips: upright ones at the centre, outer ones
 * leaning and nodding over the rim, with grey-green leaves spilling out.
 */
export function Tulips({ neck, rim, opening }: { neck: number; rim: number; opening: number }) {
  const petal = usePetalMaterial();
  const geo = useMemo(() => {
    const rand = random(29);
    const heads: THREE.BufferGeometry[] = [];
    const green: THREE.BufferGeometry[] = [];
    const count = 9;
    for (let i = 0; i < count; i++) {
      const az = i * 2.39996 + 0.3;
      const out = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
      // Centre stems stand up; outer ones droop further over the rim.
      const ring = i === 0 ? 0 : Math.min(1, 0.35 + i / count);
      const droop = ring * (0.55 + rand() * 0.45);
      const start = out.clone().multiplyScalar(opening * (0.15 + 0.45 * ring)).setY(neck);
      const rise = rim - neck + 0.14 + (1 - droop) * 0.2 + rand() * 0.05;
      const reach = 0.04 + droop * 0.2;
      const end = start.clone().add(UP.clone().multiplyScalar(rise)).add(out.clone().multiplyScalar(reach));
      const endDir = UP.clone()
        .multiplyScalar(1 - droop * 0.8)
        .add(out.clone().multiplyScalar(0.25 + droop))
        .normalize();
      const curve = new THREE.CubicBezierCurve3(
        start,
        start.clone().add(UP.clone().multiplyScalar((rim - neck) * 0.9)),
        end.clone().sub(endDir.clone().multiplyScalar(rise * 0.35)),
        end,
      );
      green.push(new THREE.TubeGeometry(curve, 40, 0.004, 8));

      const head = tulipHead(0.058 + rand() * 0.012, 0.02, rand() * 0.3);
      heads.push(head.applyMatrix4(orient(end, curve.getTangentAt(1), out)));
    }

    // Leaves rise from the vase and fall back over the rim.
    for (let i = 0; i < 6; i++) {
      const az = (i / 6) * Math.PI * 2 + 0.9 + (rand() - 0.5) * 0.4;
      const out = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
      const reach = 0.16 + rand() * 0.08;
      const start = out.clone().multiplyScalar(opening * 0.4).setY(neck);
      const curve = new THREE.CubicBezierCurve3(
        start,
        start.clone().add(UP.clone().multiplyScalar(rim - neck + 0.08)),
        start.clone().add(UP.clone().multiplyScalar(rim - neck + 0.16)).add(out.clone().multiplyScalar(reach * 0.6)),
        start.clone().add(UP.clone().multiplyScalar(rim - neck + 0.04 - rand() * 0.06)).add(out.clone().multiplyScalar(reach)),
      );
      const side = new THREE.Vector3().crossVectors(UP, out);
      green.push(leaf(curve, side, 0.02 + rand() * 0.006, (rand() - 0.5) * 1.2));
    }

    return { heads: mergeGeometries(heads)!, green: mergeGeometries(green)! };
  }, [neck, rim, opening]);
  useDispose(geo);

  return (
    <group>
      <mesh geometry={geo.heads} material={petal} castShadow />
      <mesh geometry={geo.green} castShadow>
        <meshStandardMaterial color="#7f9764" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
