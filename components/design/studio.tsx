"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { Billboard, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * The atelier the mannequin stands in, after the "Design your own" photo:
 * a seamless ivory backdrop, a brass floor lamp glowing warm beside the
 * mannequin, a black arched garment rack, ceramics and plants.
 *
 * Plants and vases are CC0 models from Poly Haven (see docs/media-credits.md),
 * compressed into public/models. The backdrop, lamp and rack are built here.
 */

const MODELS = {
  tree: "/models/potted_plant_01.glb",
  plant: "/models/potted_plant_02.glb",
  vaseTall: "/models/ceramic_vase_04.glb",
  vaseRound: "/models/ceramic_vase_02.glb",
} as const;

/** Exported for the lamp's light, which the scene places. */
export const LAMP = { x: -1.35, z: -0.8, height: 1.5 };

const WALL = "#ebe5da";
const BLACK_METAL = "#1c1a19";

export function Studio() {
  return (
    <group>
      <Cyclorama />
      <FloorLamp />
      <GarmentRack position={[1.3, 0, -0.95]} rotation={[0, -0.3, 0]} />
      <Prop url={MODELS.tree} position={[-1.95, 0, -0.95]} rotation={0.6} />
      <Prop url={MODELS.plant} position={[2.15, 0, -0.75]} rotation={-0.9} />
      <Prop url={MODELS.vaseTall} position={[1.85, 0, 0.05]} rotation={2.2} />
      <Prop url={MODELS.vaseRound} position={[2.1, 0, 0.18]} rotation={0.4} />
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
    <mesh geometry={geometry}>
      <meshStandardMaterial color={WALL} roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** A slim brushed-brass floor lamp with a cone shade tipped toward the mannequin. */
function FloorLamp() {
  const { x, z, height } = LAMP;
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
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.16, 0.024, 48]} />
        <meshStandardMaterial color="#b8ab90" metalness={0.85} roughness={0.32} />
      </mesh>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, height, 16]} />
        <meshStandardMaterial color="#b8ab90" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Shade on a short knuckle, tipped down and toward the centre */}
      <group position={[0, height, 0]} rotation={[0, -0.6, 0.95]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.11, 0.2, 40, 1, true]} />
          <meshStandardMaterial color="#b8ab90" metalness={0.85} roughness={0.28} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.036, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#b8ab90" metalness={0.85} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.0, 0]}>
          <sphereGeometry args={[0.04, 24, 16]} />
          <meshStandardMaterial color="#fff1d6" emissive="#ffd08a" emissiveIntensity={4} toneMapped={false} />
        </mesh>
        <Billboard position={[0, -0.02, 0]}>
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

/** Black arched garment rack with an oak hanger. */
function GarmentRack(props: { position: [number, number, number]; rotation: [number, number, number] }) {
  const width = 0.78;
  const postTop = 1.42;
  const half = width / 2;

  const frame = useMemo(() => {
    const pts = [
      ...line(new THREE.Vector3(-half, 0.05, 0), new THREE.Vector3(-half, postTop, 0), 12),
      ...Array.from({ length: 33 }, (_, i) => {
        const a = Math.PI - (i / 32) * Math.PI;
        return new THREE.Vector3(Math.cos(a) * half, postTop + Math.sin(a) * half, 0);
      }),
      ...line(new THREE.Vector3(half, postTop, 0), new THREE.Vector3(half, 0.05, 0), 12).slice(1),
      new THREE.Vector3(half, 0.05, 0),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1), 220, 0.013, 10);
  }, [half]);

  const hanger = useMemo(() => {
    const top = postTop + half - 0.07;
    const pts = [
      new THREE.Vector3(-0.21, top - 0.17, 0),
      new THREE.Vector3(-0.1, top - 0.12, 0),
      new THREE.Vector3(0, top - 0.09, 0),
      new THREE.Vector3(0.1, top - 0.12, 0),
      new THREE.Vector3(0.21, top - 0.17, 0),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.012, 8);
  }, [half]);

  const hook = useMemo(() => {
    const top = postTop + half - 0.01;
    const pts = [
      new THREE.Vector3(0, top - 0.09, 0),
      new THREE.Vector3(0, top - 0.03, 0),
      new THREE.Vector3(0.018, top + 0.005, 0),
      new THREE.Vector3(0.04, top - 0.012, 0),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.003, 6);
  }, [half]);

  return (
    <group {...props}>
      <mesh geometry={frame} castShadow>
        <meshStandardMaterial color={BLACK_METAL} metalness={0.6} roughness={0.45} />
      </mesh>
      {/* Feet: a short bar under each post */}
      {[-half, half].map((px) => (
        <mesh key={px} position={[px, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.42, 12]} />
          <meshStandardMaterial color={BLACK_METAL} metalness={0.6} roughness={0.45} />
        </mesh>
      ))}
      <mesh geometry={hook}>
        <meshStandardMaterial color="#9a958d" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh geometry={hanger} castShadow>
        <meshStandardMaterial color="#b88c5e" roughness={0.55} />
      </mesh>
    </group>
  );
}

/** A Poly Haven model, standing on the floor and casting soft shadows. */
function Prop({
  url,
  position,
  rotation,
}: {
  url: string;
  position: [number, number, number];
  rotation: number;
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
  return <primitive object={scene} position={position} rotation={[0, rotation, 0]} />;
}

for (const url of Object.values(MODELS)) useGLTF.preload(url);
