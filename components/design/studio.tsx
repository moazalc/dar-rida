"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { Billboard, RoundedBox, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { CallaLilies, Tulips } from "./flowers";

/**
 * The atelier the mannequin stands in, after the "Design your own" photo:
 * a seamless ivory backdrop, a brass floor lamp glowing warm beside the
 * mannequin, a black arched garment rack, and white flowers in ceramics.
 *
 * Vases are CC0 models from Poly Haven (see docs/media-credits.md), compressed
 * into public/models. The backdrop, lamp, rack and flowers are built in code.
 */

const MODELS = {
  bottle: "/models/ceramic_vase_01.glb",
  bowl: "/models/ceramic_vase_02.glb",
  jug: "/models/ceramic_vase_04.glb",
} as const;

const WALL = "#ebe5da";
const BLACK_METAL = "#1c1a19";
const BRASS = "#b8ab90";

/** The lamp stands left of the mannequin; its arm and shade turn toward her. */
const LAMP_AT = { x: -1.35, z: -0.8, height: 1.75, turn: -0.6, arm: 0.16, tilt: 0.95 };

/** Where the lamp's bulb sits, for the warm light the scene places there. */
export const LAMP_BULB = new THREE.Vector3(0, -0.11, 0)
  .applyEuler(new THREE.Euler(0, 0, LAMP_AT.tilt))
  .add(new THREE.Vector3(LAMP_AT.arm, LAMP_AT.height, 0))
  .applyEuler(new THREE.Euler(0, LAMP_AT.turn, 0))
  .add(new THREE.Vector3(LAMP_AT.x, 0, LAMP_AT.z))
  .toArray();

/** Ceramic Vase 01 is a 40 cm bottle; shown at floor-vase size. */
const BOTTLE_SCALE = 1.8;
const PLINTH = { width: 0.36, height: 0.52 };

export function Studio() {
  return (
    <group>
      <Cyclorama />
      <FloorLamp />
      <GarmentRack position={[1.1, 0, -1.05]} rotation={[0, -0.3, 0]} />

      {/* Calla lilies in a tall white bottle, back left */}
      <group position={[-1.8, 0, -1.25]}>
        <Prop url={MODELS.bottle} scale={BOTTLE_SCALE} rotation={0.6} />
        <CallaLilies neck={0.3 * BOTTLE_SCALE} rim={0.4 * BOTTLE_SCALE} opening={0.035 * BOTTLE_SCALE} />
      </group>

      {/* White tulips in a round vase on a stone plinth, right */}
      <group position={[1.85, 0, -0.8]} rotation={[0, -0.4, 0]}>
        <RoundedBox
          args={[PLINTH.width, PLINTH.height, PLINTH.width]}
          radius={0.008}
          position={[0, PLINTH.height / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#ddd3c4" roughness={0.85} />
        </RoundedBox>
        <group position={[0, PLINTH.height, 0]}>
          <Prop url={MODELS.bowl} rotation={0.4} />
          <Tulips neck={0.22} rim={0.31} opening={0.06} />
        </group>
      </group>
      <Prop url={MODELS.jug} position={[1.5, 0, -0.05]} rotation={2.2} />
    </group>
  );
}

/**
 * A photographer's infinity curve: floor sweeping up into the wall with no
 * visible corner, all the way round, so every camera angle stays in studio.
 * Centred on the mannequin and wider than the camera's furthest orbit
 * (`STUDIO_RADIUS` vs the scene's maxDistance), so turning round to see the
 * back never takes the camera through the wall.
 */
export const STUDIO_RADIUS = 7;

function Cyclorama() {
  const geometry = useMemo(() => {
    const radius = STUDIO_RADIUS;
    const cove = 0.8;
    const height = 8;
    const points = [new THREE.Vector2(0, 0), new THREE.Vector2(radius - cove, 0)];
    for (let i = 1; i <= 16; i++) {
      const a = (i / 16) * (Math.PI / 2);
      points.push(new THREE.Vector2(radius - cove + Math.sin(a) * cove, cove - Math.cos(a) * cove));
    }
    points.push(new THREE.Vector2(radius, height));
    return new THREE.LatheGeometry(points, 96);
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color={WALL} roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
}

/**
 * A slim brushed-brass floor lamp: a short arm off the top of the stem holds
 * a cone shade by its closed end, tipped down toward the mannequin, so the
 * stem stays clear of the shade.
 */
function FloorLamp() {
  const { x, z, height, turn, arm, tilt } = LAMP_AT;
  // A soft radial glow round the bulb, drawn once into a small texture.
  const glow = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255, 214, 150, 0.7)");
    g.addColorStop(0.25, "rgba(255, 200, 130, 0.35)");
    g.addColorStop(1, "rgba(255, 190, 120, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => glow.dispose(), [glow]);

  return (
    <group position={[x, 0, z]} rotation={[0, turn, 0]}>
      <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.16, 0.024, 48]} />
        <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.32} />
      </mesh>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, height, 16]} />
        <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Knuckle at the top of the stem, a short arm, and a pivot at its end */}
      <mesh position={[0, height, 0]}>
        <sphereGeometry args={[0.017, 20, 12]} />
        <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[arm / 2, height, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, arm, 12]} />
        <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.3} />
      </mesh>

      {/* The shade hangs from the pivot by its domed back, mouth toward her */}
      <group position={[arm, height, 0]} rotation={[0, 0, tilt]}>
        <mesh>
          <sphereGeometry args={[0.015, 20, 12]} />
          <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.03, 0]} castShadow>
          <sphereGeometry args={[0.036, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.13, 0]} castShadow>
          <cylinderGeometry args={[0.036, 0.11, 0.2, 40, 1, true]} />
          <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.28} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.11, 0]}>
          <sphereGeometry args={[0.032, 24, 16]} />
          <meshStandardMaterial color="#fff1d6" emissive="#ffd08a" emissiveIntensity={4} toneMapped={false} />
        </mesh>
        <Billboard position={[0, -0.2, 0]}>
          <mesh>
            <planeGeometry args={[0.32, 0.32]} />
            <meshBasicMaterial
              map={glow}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </Billboard>
      </group>
    </group>
  );
}

/** Points along a straight line, for building tube paths. */
function line(a: THREE.Vector3, b: THREE.Vector3, steps: number) {
  return Array.from({ length: steps }, (_, i) => a.clone().lerp(b, i / steps));
}

/**
 * Black arched garment rack with an oak hanger. The posts stand in two floor
 * bars, and the hanger's hook curls over the top of the arch and rests on it.
 */
function GarmentRack(props: { position: [number, number, number]; rotation: [number, number, number] }) {
  const width = 0.78;
  const postTop = 1.42;
  const half = width / 2;
  const tube = 0.013;
  const foot = 0.014;
  /** Centre of the rail at the crown of the arch, where the hook rests. */
  const crown = postTop + half;

  const geo = useMemo(() => {
    const frame = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(
        [
          ...line(new THREE.Vector3(-half, foot, 0), new THREE.Vector3(-half, postTop, 0), 12),
          ...Array.from({ length: 33 }, (_, i) => {
            const a = Math.PI - (i / 32) * Math.PI;
            return new THREE.Vector3(Math.cos(a) * half, postTop + Math.sin(a) * half, 0);
          }),
          ...line(new THREE.Vector3(half, postTop, 0), new THREE.Vector3(half, foot, 0), 12).slice(1),
          new THREE.Vector3(half, foot, 0),
        ],
        false,
        "catmullrom",
        0.1,
      ),
      220,
      tube,
      10,
    );

    // The hook wire: up from the hanger's neck, round over the rail (which
    // runs along X here) and down the far side.
    const wire = 0.0035;
    const over = tube + wire; // wire centre when touching the rail
    const neckTop = crown - 0.075;
    const hook = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, neckTop, 0),
        new THREE.Vector3(0, crown - 0.035, -0.006),
        new THREE.Vector3(0, crown - 0.008, -over),
        new THREE.Vector3(0, crown + over * 0.75, -over * 0.7),
        new THREE.Vector3(0, crown + over, 0),
        new THREE.Vector3(0, crown + over * 0.7, over * 0.75),
        new THREE.Vector3(0, crown - 0.006, over),
        new THREE.Vector3(0, crown - 0.02, over * 0.75),
      ]),
      48,
      wire,
      8,
    );

    // Classic shoulder hanger: a curved oak bar with a fine bar below.
    const shoulderTop = neckTop - 0.008;
    const hanger = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.21, shoulderTop - 0.08, 0),
        new THREE.Vector3(-0.1, shoulderTop - 0.03, 0),
        new THREE.Vector3(0, shoulderTop, 0),
        new THREE.Vector3(0.1, shoulderTop - 0.03, 0),
        new THREE.Vector3(0.21, shoulderTop - 0.08, 0),
      ]),
      48,
      0.012,
      10,
    );
    const bar = new THREE.CylinderGeometry(0.004, 0.004, 0.4, 8)
      .rotateZ(Math.PI / 2)
      .translate(0, shoulderTop - 0.076, 0);
    return { frame, hook, hanger, bar };
  }, [half, crown]);
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  return (
    <group {...props}>
      <mesh geometry={geo.frame} castShadow>
        <meshStandardMaterial color={BLACK_METAL} metalness={0.6} roughness={0.45} />
      </mesh>
      {/* Feet: a bar on the floor under each post */}
      {[-half, half].map((px) => (
        <mesh key={px} position={[px, foot, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[foot, foot, 0.42, 12]} />
          <meshStandardMaterial color={BLACK_METAL} metalness={0.6} roughness={0.45} />
        </mesh>
      ))}
      <mesh geometry={geo.hook} castShadow>
        <meshStandardMaterial color="#9a958d" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh geometry={geo.hanger} castShadow>
        <meshStandardMaterial color="#b88c5e" roughness={0.55} />
      </mesh>
      <mesh geometry={geo.bar}>
        <meshStandardMaterial color="#9a958d" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** A Poly Haven model, standing on the floor and casting soft shadows. */
function Prop({
  url,
  position,
  rotation,
  scale = 1,
}: {
  url: string;
  position?: [number, number, number];
  rotation: number;
  scale?: number;
}) {
  const { scene } = useGLTF(url);
  useLayoutEffect(() => {
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }, [scene]);
  return <primitive object={scene} position={position} rotation={[0, rotation, 0]} scale={scale} />;
}

for (const url of Object.values(MODELS)) useGLTF.preload(url);
