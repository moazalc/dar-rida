"use client";

import { useEffect, useMemo } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { colourHex, type ChoiceStep, type Config } from "@/lib/configurator/options";

/**
 * Stand-in abaya on a dress form, built in code so the configurator flow can
 * be tested before the real model exists.
 *
 * The real model (a GLB from CLO3D / Marvelous Designer) replaces this file
 * and keeps the same contract: it takes `config`, shows one mesh per chosen
 * option, applies the fabric/colour material, and reports taps on a part
 * through `onPartSelect`. Units are metres, the floor is y = 0, the front
 * faces +z, and the model brings its own stand.
 *
 * Every garment piece is one smooth surface of revolution: a spline
 * silhouette, an oval cross-section, and soft vertical folds that deepen
 * toward the hem. A gentle sway in the vertex shader stands in for cloth
 * simulation; every fabric and trim material shares it, so nothing drifts
 * apart.
 */

export type AbayaModelProps = {
  config: Config;
  onPartSelect?: (step: ChoiceStep) => void;
};

/** The torso is an oval, not a circle: depth relative to width. */
const DEPTH = 0.72;
/** Sleeves hang empty on a form, so they are flatter still. */
const SLEEVE_DEPTH = 0.7;
const SHOULDER_Y = 1.38;
const WAIST_Y = 1.06;
const HEM_Y = 0.04;
const NECK_Y = 1.54;
/** The form stands on a tripod: everything above is raised by this much. */
const LIFT = 0.3;

// --- Silhouettes ------------------------------------------------------------

/** Body silhouette per cut, as (radius, height) control points, hem to neck. */
const silhouettes: Record<Config["cut"], [number, number][]> = {
  classic: [
    [0.37, HEM_Y], [0.35, 0.3], [0.31, 0.65], [0.27, 0.95], [0.243, 1.15], [0.23, 1.3],
    [0.219, 1.39], [0.19, 1.455], [0.13, 1.505], [0.075, 1.533], [0.06, NECK_Y],
  ],
  butterfly: [
    [0.5, HEM_Y], [0.47, 0.3], [0.42, 0.65], [0.36, 0.95], [0.31, 1.15], [0.27, 1.3],
    [0.24, 1.39], [0.2, 1.46], [0.13, 1.508], [0.075, 1.534], [0.06, NECK_Y],
  ],
  wrap: [
    [0.38, HEM_Y], [0.35, 0.3], [0.29, 0.65], [0.22, 0.92], [0.19, WAIST_Y], [0.215, 1.2],
    [0.228, 1.3], [0.219, 1.39], [0.19, 1.455], [0.13, 1.505], [0.075, 1.533], [0.06, NECK_Y],
  ],
};

/** Fold count, depth (m) and the height they fade out at, per cut. */
const drapes: Record<Config["cut"], { count: number; depth: number; top: number }> = {
  classic: { count: 9, depth: 0.026, top: 1.2 },
  butterfly: { count: 8, depth: 0.04, top: 1.32 },
  wrap: { count: 10, depth: 0.028, top: WAIST_Y - 0.04 },
};

/** Sleeve silhouette as (radius, local height) points, cuff up to a closed shoulder cap. */
const sleeveSilhouettes: Record<Exclude<Config["sleeve"], "cape">, [number, number][]> = {
  straight: [
    [0.058, -0.6], [0.064, -0.45], [0.072, -0.25], [0.08, -0.06], [0.078, 0.01], [0.055, 0.045], [0.001, 0.06],
  ],
  bell: [
    [0.118, -0.6], [0.104, -0.54], [0.082, -0.44], [0.072, -0.25], [0.08, -0.06], [0.078, 0.01], [0.055, 0.045],
    [0.001, 0.06],
  ],
  cuffed: [
    [0.05, -0.66], [0.052, -0.6], [0.06, -0.575], [0.078, -0.52], [0.08, -0.3], [0.081, -0.06], [0.078, 0.01],
    [0.055, 0.045], [0.001, 0.06],
  ],
};

// --- Surface helpers --------------------------------------------------------

type Radius = (y: number) => number;
type Fold = (y: number, phi: number) => number;

/** Smooth a silhouette and return its radius at any height. */
function silhouette(points: [number, number][], samples = 80): { rows: [number, number][]; at: Radius } {
  const curve = new THREE.SplineCurve(points.map(([r, y]) => new THREE.Vector2(r, y)));
  const rows = curve.getPoints(samples).map((p) => [p.y, Math.max(p.x, 0.001)] as [number, number]);
  rows.sort((a, b) => a[0] - b[0]);
  const at: Radius = (y) => {
    if (y <= rows[0][0]) return rows[0][1];
    for (let i = 1; i < rows.length; i++) {
      const [y1, r1] = rows[i];
      if (y <= y1) {
        const [y0, r0] = rows[i - 1];
        return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0 || 1);
      }
    }
    return rows[rows.length - 1][1];
  };
  return { rows, at };
}

/** Soft vertical folds, deepest at `bottom` and gone by `top`. Always outward. */
function drape(count: number, depth: number, top: number, bottom: number): Fold {
  return (y, phi) => {
    const t = 1 - THREE.MathUtils.smoothstep(y, bottom, top);
    const main = 0.5 + 0.5 * Math.cos(count * phi + 0.8 * Math.sin(2 * phi + 0.5));
    const fine = 0.5 + 0.5 * Math.cos((2 * count + 1) * phi + 1.7);
    return depth * t * (0.8 * Math.pow(main, 1.4) + 0.2 * fine);
  };
}

const noFold: Fold = () => 0;

/**
 * A surface of revolution with an oval section. Rows run bottom to top so the
 * faces point outward; a partial `phiLength` leaves an opening at the front.
 */
type SurfaceOptions = { depth: number; segments?: number; phiStart?: number; phiLength?: number };

function surface(rows: [number, number][], fold: Fold, options: SurfaceOptions): THREE.BufferGeometry {
  return sweep(rows.length, (i, phi) => {
    const [y, r] = rows[i];
    return [y, r + fold(y, phi)];
  }, options);
}

/**
 * The general form: `point(row, phi)` gives height and radius for every
 * vertex, so a hem can rise and fall round the body.
 */
function sweep(
  rowCount: number,
  point: (row: number, phi: number) => [number, number],
  { depth, segments = 144, phiStart = 0, phiLength = Math.PI * 2 }: SurfaceOptions,
): THREE.BufferGeometry {
  const closed = phiLength >= Math.PI * 2 - 1e-6;
  const cols = closed ? segments : segments + 1;
  const positions = new Float32Array(rowCount * cols * 3);
  for (let i = 0; i < rowCount; i++) {
    for (let j = 0; j < cols; j++) {
      const phi = phiStart + (j / segments) * phiLength;
      const [y, r] = point(i, phi);
      const k = (i * cols + j) * 3;
      positions[k] = r * Math.sin(phi);
      positions[k + 1] = y;
      positions[k + 2] = r * Math.cos(phi) * depth;
    }
  }
  const index: number[] = [];
  for (let i = 0; i < rowCount - 1; i++) {
    for (let j = 0; j < segments; j++) {
      const next = closed ? (j + 1) % cols : j + 1;
      const a = i * cols + j;
      const b = (i + 1) * cols + j;
      const c = (i + 1) * cols + next;
      const d = i * cols + next;
      index.push(a, d, b, d, c, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/** Evenly spaced rows of a radius function between two heights. */
function rowsBetween(from: number, to: number, count: number, at: Radius, offset = 0): [number, number][] {
  return Array.from({ length: count }, (_, i) => {
    const y = from + ((to - from) * i) / (count - 1);
    return [y, at(y) + offset];
  });
}

/** The tilt that lets a sleeve hang clear of the body all the way down. */
function sleeveTilt(sleeve: Radius, length: number, x0: number, body: Radius, bodyFold: number): number {
  for (let tilt = 0.06; tilt < 0.6; tilt += 0.01) {
    let clear = true;
    for (let t = 0.16; t <= length; t += 0.02) {
      const cx = x0 + t * Math.sin(tilt);
      const cy = SHOULDER_Y - t * Math.cos(tilt);
      if (cx - sleeve(-t) < body(cy) + bodyFold + 0.012) {
        clear = false;
        break;
      }
    }
    if (clear) return tilt;
  }
  return 0.6;
}

// --- Materials --------------------------------------------------------------

const fabrics: Record<
  Config["fabric"],
  { roughness: number; sheen: number; sheenRoughness: number; clearcoat: number; opacity: number }
> = {
  crepe: { roughness: 0.92, sheen: 0.35, sheenRoughness: 0.8, clearcoat: 0, opacity: 1 },
  nida: { roughness: 0.7, sheen: 0.8, sheenRoughness: 0.5, clearcoat: 0, opacity: 1 },
  silk: { roughness: 0.32, sheen: 1, sheenRoughness: 0.25, clearcoat: 0.3, opacity: 1 },
  chiffon: { roughness: 0.6, sheen: 0.6, sheenRoughness: 0.4, clearcoat: 0, opacity: 0.6 },
};

const LACE = "#e8dfcf";
const GOLD = "#c9a45c";
const FORM_WHITE = "#efeae2";

type SwayUniforms = { uTime: { value: number } };

/** One clock for every swaying material, advanced each frame by the model. */
const swayClock: SwayUniforms = { uTime: { value: 0 } };

/**
 * Adds the shared cloth sway to a material: nothing moves above the chest,
 * the hem moves most. Driven by world height so every piece moves together.
 */
function withSway<M extends THREE.Material>(material: M, uniforms: SwayUniforms): M {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vec4 swayWorld = modelMatrix * vec4(transformed, 1.0);
        float swayAmount = clamp((${(LIFT + 1.15).toFixed(2)} - swayWorld.y) / 1.1, 0.0, 1.0);
        swayAmount *= swayAmount;
        transformed.x += sin(uTime * 0.7 + swayWorld.y * 2.6) * 0.007 * swayAmount;
        transformed.z += sin(uTime * 0.55 + swayWorld.y * 1.9 + 1.3) * 0.005 * swayAmount;`,
      );
  };
  material.customProgramCacheKey = () => "dar-rida-sway";
  return material;
}

/** Free GPU memory for everything in a list once it is replaced or unmounted. */
function useDisposeAll(items: { dispose(): void }[]) {
  useEffect(() => () => items.forEach((i) => i.dispose()), [items]);
}

/** Pointer handlers that make a part tappable and show it as clickable. */
function tappable(step: ChoiceStep, onPartSelect?: (step: ChoiceStep) => void) {
  if (!onPartSelect) return {};
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onPartSelect(step);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      document.body.style.cursor = "";
    },
  };
}

// --- Model ------------------------------------------------------------------

export function PlaceholderAbaya({ config, onPartSelect }: AbayaModelProps) {
  useFrame((_, delta) => {
    swayClock.uTime.value += delta;
  });
  const uniforms = swayClock;

  const materials = useMemo(() => {
    const f = fabrics[config.fabric];
    const base = new THREE.Color(colourHex[config.colour]);
    return {
      fabric: withSway(
        new THREE.MeshPhysicalMaterial({
          color: base,
          roughness: f.roughness,
          sheen: f.sheen,
          sheenRoughness: f.sheenRoughness,
          sheenColor: base.clone().lerp(new THREE.Color("#ffffff"), 0.45),
          clearcoat: f.clearcoat,
          clearcoatRoughness: 0.4,
          transparent: f.opacity < 1,
          opacity: f.opacity,
          depthWrite: f.opacity === 1,
          side: THREE.DoubleSide,
        }),
        uniforms,
      ),
      lining: withSway(
        new THREE.MeshStandardMaterial({ color: base, roughness: 0.85, side: THREE.DoubleSide }),
        uniforms,
      ),
      lace: withSway(
        new THREE.MeshStandardMaterial({ color: LACE, roughness: 0.9, side: THREE.DoubleSide }),
        uniforms,
      ),
      gold: withSway(new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.85, roughness: 0.32 }), uniforms),
      crystal: withSway(
        new THREE.MeshPhysicalMaterial({
          color: "#ffffff",
          metalness: 0.1,
          roughness: 0.04,
          clearcoat: 1,
          emissive: "#fff6e6",
          emissiveIntensity: 0.35,
        }),
        uniforms,
      ),
    };
  }, [config.fabric, config.colour, uniforms]);
  useDisposeAll(useMemo(() => Object.values(materials), [materials]));

  const geo = useMemo(() => buildGeometry(config), [config]);
  useDisposeAll(geo.all);

  return (
    <group position={[0, LIFT, 0]}>
      <DressForm />

      <mesh geometry={geo.body} material={materials.fabric} castShadow {...tappable("cut", onPartSelect)} />
      {config.fabric === "chiffon" && <mesh geometry={geo.lining} material={materials.lining} />}
      {geo.sash && <mesh geometry={geo.sash} material={materials.fabric} castShadow />}

      {geo.cape && (
        <mesh geometry={geo.cape} material={materials.fabric} castShadow {...tappable("sleeve", onPartSelect)} />
      )}
      {geo.sleeves.map((s, i) => (
        <group key={i} position={s.position} rotation={s.rotation}>
          <mesh geometry={s.geometry} material={materials.fabric} castShadow {...tappable("sleeve", onPartSelect)} />
          {s.cuff && config.finishing === "lace" && <mesh geometry={s.cuff} material={materials.lace} />}
          {s.cuff && config.finishing === "embroidery" && <mesh geometry={s.cuff} material={materials.gold} />}
        </group>
      ))}

      <group {...tappable("finishing", onPartSelect)}>
        {config.finishing === "lace" && (
          <>
            <mesh geometry={geo.hemBand} material={materials.lace} />
            {geo.capeBand && <mesh geometry={geo.capeBand} material={materials.lace} />}
          </>
        )}
        {config.finishing === "embroidery" && (
          <>
            <mesh geometry={geo.frontBand} material={materials.gold} />
            {geo.capeBand && <mesh geometry={geo.capeBand} material={materials.gold} />}
          </>
        )}
        {config.finishing === "crystals" &&
          geo.crystals.map((p, i) => (
            <mesh key={i} position={p} geometry={geo.crystal} material={materials.crystal} />
          ))}
      </group>
    </group>
  );
}

type Sleeve = {
  geometry: THREE.BufferGeometry;
  cuff?: THREE.BufferGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
};

/** Every piece of geometry for one configuration. */
function buildGeometry(config: Config) {
  const body = silhouette(silhouettes[config.cut]);
  const d = drapes[config.cut];
  const bodyFold = drape(d.count, d.depth, d.top, HEM_Y);
  const front = (y: number) => body.at(y) + bodyFold(y, 0);

  const geometries: Record<string, THREE.BufferGeometry> = {
    body: surface(body.rows, bodyFold, { depth: DEPTH }),
    lining: surface(
      body.rows.map(([y, r]) => [y + 0.02, r * 0.95] as [number, number]),
      noFold,
      { depth: DEPTH, segments: 64 },
    ),
    hemBand: surface(rowsBetween(HEM_Y, HEM_Y + 0.09, 6, body.at, 0.004), bodyFold, { depth: DEPTH }),
    frontBand: new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(
        rowsBetween(HEM_Y + 0.01, NECK_Y - 0.02, 40, front, 0.004).map(([y, z]) => new THREE.Vector3(0, y, z * DEPTH)),
      ),
      160,
      0.01,
      8,
    ),
    crystal: new THREE.OctahedronGeometry(0.0085, 1),
  };

  // Sash for the wrap cut: a band round the waist and two ribbons hanging at the front
  if (config.cut === "wrap") {
    const band = surface(rowsBetween(WAIST_Y - 0.03, WAIST_Y + 0.03, 4, body.at, 0.012), noFold, { depth: DEPTH });
    const z = (body.at(WAIST_Y) + 0.012) * DEPTH;
    const ribbon = (dx: number) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.05, WAIST_Y, z),
          new THREE.Vector3(0.06 + dx * 0.4, WAIST_Y - 0.1, z + 0.015),
          new THREE.Vector3(0.065 + dx, WAIST_Y - 0.36, z + 0.03),
        ]),
        24,
        0.011,
        8,
      );
    geometries.sash = mergeAll([band, ribbon(0), ribbon(0.05)]);
  }

  // Cape: a wide, open-fronted layer over the shoulders, falling to the hips
  const sleeves: Sleeve[] = [];
  if (config.sleeve === "cape") {
    const top = NECK_Y - 0.005;
    // Longer at the sides, where the arms would be, shorter front and back.
    const hemAt = (phi: number) => 0.9 - 0.12 * Math.pow(Math.sin(phi), 2);
    // Eases off the shoulder, then hangs nearly straight, like cloth over an arm.
    // Above the shoulder point it simply lies on the shoulders.
    const capeAt: Radius = (y) => {
      const onShoulders = body.at(y) + (y > 1.2 ? 0.012 : d.depth + 0.014);
      if (y >= 1.47) return onShoulders;
      const flare = 0.205 + 0.27 * (1 - Math.exp(-(1.47 - y) * 3.4));
      return Math.max(onShoulders, flare);
    };
    const capeFold = drape(11, 0.045, 1.32, 0.78);
    const opening = { depth: DEPTH, phiStart: 0.26, phiLength: Math.PI * 2 - 0.52 };
    const capePoint = (u: number, offset: number) => (_: number, phi: number): [number, number] => {
      const y = hemAt(phi) + (top - hemAt(phi)) * u;
      return [y, capeAt(y) + capeFold(y, phi) + offset];
    };
    const rows = 56;
    geometries.cape = sweep(rows, (i, phi) => capePoint(Math.pow(i / (rows - 1), 1.3), 0)(i, phi), opening);
    geometries.capeBand = sweep(5, (i, phi) => capePoint((i / 4) * 0.09, 0.004)(i, phi), opening);
  } else {
    const sleeve = silhouette(sleeveSilhouettes[config.sleeve], 60);
    const length = -sleeve.rows[0][0];
    const x0 = body.at(SHOULDER_Y) - 0.035;
    const tilt = sleeveTilt(sleeve.at, length, x0, body.at, d.depth);
    const sleeveFold = drape(5, 0.008, -0.2, -length);
    const geometry = surface(sleeve.rows, sleeveFold, { depth: SLEEVE_DEPTH, segments: 64 });
    // The cuff trim follows the same folds, just proud of them, so the two never fight.
    const cuff = surface(rowsBetween(-length, -length + 0.06, 4, sleeve.at, 0.004), sleeveFold, {
      depth: SLEEVE_DEPTH,
      segments: 64,
    });
    geometries.sleeve = geometry;
    geometries.cuff = cuff;
    for (const side of [1, -1]) {
      sleeves.push({
        geometry,
        cuff,
        position: [side * x0, SHOULDER_Y, 0],
        rotation: [0, 0, side * tilt],
      });
    }
  }

  const crystals = rowsBetween(0.55, 1.47, 24, front, 0.006).map(
    ([y, z]) => [0, y, z * DEPTH] as [number, number, number],
  );

  return {
    body: geometries.body,
    lining: geometries.lining,
    hemBand: geometries.hemBand,
    frontBand: geometries.frontBand,
    crystal: geometries.crystal,
    sash: geometries.sash,
    cape: geometries.cape,
    capeBand: geometries.capeBand,
    sleeves,
    crystals,
    all: Object.values(geometries),
  };
}

/** Merge geometries that share a material into one draw call. */
function mergeAll(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  const index: number[] = [];
  let offset = 0;
  for (const part of parts) {
    const pos = part.getAttribute("position");
    const nor = part.getAttribute("normal");
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      normals.push(nor.getX(i), nor.getY(i), nor.getZ(i));
    }
    const idx = part.index;
    if (idx) for (let i = 0; i < idx.count; i++) index.push(idx.getX(i) + offset);
    else for (let i = 0; i < pos.count; i++) index.push(i + offset);
    offset += pos.count;
    part.dispose();
  }
  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  merged.setIndex(index);
  return merged;
}

/**
 * A tailor's dress form: neck with a flat cap and turned finial above the
 * neckline, and below the hem a white tripod stand reaching the floor.
 */
function DressForm() {
  const parts = useMemo(() => {
    const leg = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -LIFT + 0.17, 0),
        new THREE.Vector3(0.09, -LIFT + 0.11, 0),
        new THREE.Vector3(0.17, -LIFT + 0.04, 0),
        new THREE.Vector3(0.22, -LIFT + 0.012, 0),
      ]),
      24,
      0.016,
      10,
    );
    const material = new THREE.MeshStandardMaterial({ color: FORM_WHITE, roughness: 0.4 });
    return { leg, material };
  }, []);
  useDisposeAll(useMemo(() => [parts.leg, parts.material], [parts]));
  const m = parts.material;

  return (
    <group>
      <mesh position={[0, 1.6, 0]} material={m} castShadow>
        <cylinderGeometry args={[0.05, 0.058, 0.14, 32]} />
      </mesh>
      <mesh position={[0, 1.675, 0]} material={m} castShadow>
        <cylinderGeometry args={[0.056, 0.05, 0.014, 32]} />
      </mesh>
      <mesh position={[0, 1.7, 0]} material={m} castShadow>
        <cylinderGeometry args={[0.008, 0.012, 0.04, 16]} />
      </mesh>
      <mesh position={[0, 1.728, 0]} material={m} castShadow>
        <sphereGeometry args={[0.016, 20, 16]} />
      </mesh>

      {/* Stand: pole from inside the abaya down to a three-legged base */}
      <mesh position={[0, (0.4 - LIFT + 0.17) / 2, 0]} material={m} castShadow>
        <cylinderGeometry args={[0.017, 0.02, 0.4 + LIFT - 0.17, 16]} />
      </mesh>
      <mesh position={[0, -LIFT + 0.17, 0]} material={m} castShadow>
        <sphereGeometry args={[0.03, 20, 16]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          geometry={parts.leg}
          material={m}
          rotation={[0, (i * Math.PI * 2) / 3 + Math.PI / 6, 0]}
          castShadow
        />
      ))}
    </group>
  );
}
