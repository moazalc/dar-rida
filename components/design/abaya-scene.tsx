"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AccumulativeShadows, CameraControls, Environment, RandomizedLight } from "@react-three/drei";
import * as THREE from "three";
import type { ChoiceStep, Config, Step } from "@/lib/configurator/options";
import { PlaceholderAbaya } from "./placeholder-abaya";
import { LAMP, Studio } from "./studio";

type Shot = [number, number, number, number, number, number];

/** Camera position and look-at target per step, so each step frames its part. */
const wide: Shot = [0, 1.3, 4.3, 0, 1.0, -0.2];
const shots: Record<Step, Shot> = {
  cut: wide,
  sleeve: [1.3, 1.55, 2.9, 0.1, 1.3, 0],
  fabric: [0.8, 1.45, 3.1, 0, 1.2, 0],
  colour: wide,
  finishing: [0.5, 1.4, 3.1, 0, 1.15, 0],
  size: [-1.2, 1.3, 4.0, 0, 1.0, -0.2],
  review: [1.8, 1.35, 3.8, 0, 1.0, -0.2],
};

/**
 * Furthest the camera may orbit from its target. Kept well inside the
 * studio's radius so no angle — including the back — leaves the room.
 */
const MAX_DISTANCE = 4.5;

/** camera-controls' ACTION.NONE — drei does not re-export the enum. */
const NONE = 0;

/** Studio wall colour, also used for the fog so the far wall softens away. */
const BACKDROP = "#e9e2d6";

/** Renders the current view and returns it as a PNG data URL. */
export type CaptureFn = () => string;

export type AbayaSceneProps = {
  config: Config;
  step: Step;
  /** Bumped by the "reset view" button to re-frame the current step. */
  resetKey: number;
  onPartSelect: (step: ChoiceStep) => void;
  /** Receives a function that snapshots the scene, for "Save image". */
  onCaptureReady?: (capture: CaptureFn) => void;
  fallback: React.ReactNode;
};

/**
 * Orbit controls that frame the current step. Lives inside the Canvas: the
 * Canvas mounts its children in a separate render pass, so a ref to the
 * controls is only set by the time effects in here run.
 */
function CameraRig({ step, resetKey }: { step: Step; resetKey: number }) {
  const controls = useRef<CameraControls>(null);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    // Turn and zoom only: no panning the mannequin out of frame.
    c.mouseButtons.right = NONE;
    c.mouseButtons.middle = NONE;
    c.touches.three = NONE;
  }, []);

  // The first framing jumps straight there; an animated move started while
  // the canvas is still sizing itself gets lost. Later ones glide.
  const framed = useRef(false);
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.setLookAt(...shots[step], framed.current);
    framed.current = true;
  }, [step, resetKey]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={1.6}
      maxDistance={MAX_DISTANCE}
      minPolarAngle={0.55}
      maxPolarAngle={Math.PI / 2 - 0.04}
      smoothTime={0.5}
    />
  );
}

/** Hands the parent a snapshot function bound to this canvas. */
function Capture({ onReady }: { onReady?: (capture: CaptureFn) => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    // Render and read back in the same task, so the drawing buffer is still intact.
    onReady?.(() => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL("image/png");
    });
  }, [gl, scene, camera, onReady]);
  return null;
}

export default function AbayaScene({
  config,
  step,
  resetKey,
  onPartSelect,
  onCaptureReady,
  fallback,
}: AbayaSceneProps) {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 2]}
      camera={{ position: wide.slice(0, 3) as [number, number, number], fov: 36 }}
      fallback={fallback}
      // Neutral keeps the fabric colours true to the swatches.
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      onPointerMissed={() => (document.body.style.cursor = "")}
    >
      <color attach="background" args={[BACKDROP]} />
      <fog attach="fog" args={[BACKDROP, 7, 15]} />

      {/* Soft daylight studio for fill and reflections (Poly Haven, CC0) */}
      <Suspense fallback={null}>
        <Environment files="/hdri/studio_london_hall_1k.hdr" environmentIntensity={0.55} />
      </Suspense>

      {/* Key: a big soft window, front right */}
      <directionalLight
        position={[3.2, 5, 3.6]}
        intensity={1.6}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={8}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-camera-near={1}
        shadow-camera-far={14}
      />
      {/* Rim from behind, so a black abaya separates from the wall. Aims at the
          default target (the form's foot); the wide cone covers it to the neck. */}
      <spotLight position={[-2.4, 3.4, -3]} angle={0.6} penumbra={1} intensity={28} color="#fff8ef" />
      {/* The floor lamp's warm pool */}
      <pointLight
        position={[LAMP.x + 0.05, LAMP.height - 0.05, LAMP.z + 0.05]}
        color="#ffc77a"
        intensity={1.6}
        distance={2.2}
        decay={2}
      />

      <Suspense fallback={null}>
        <Studio />
      </Suspense>
      <PlaceholderAbaya config={config} onPartSelect={onPartSelect} />

      {/* Soft contact shadows on the floor, re-gathered when the design changes */}
      <AccumulativeShadows
        key={`${config.cut}-${config.sleeve}-${config.finishing}`}
        temporal
        frames={60}
        alphaTest={0.8}
        opacity={0.75}
        scale={7}
        color="#4a3d30"
        position={[0, 0.002, 0]}
      >
        <RandomizedLight amount={8} radius={3} ambient={0.55} intensity={1.2} position={[2.5, 5, 3]} bias={0.001} />
      </AccumulativeShadows>

      <CameraRig step={step} resetKey={resetKey} />
      <Capture onReady={onCaptureReady} />
    </Canvas>
  );
}
