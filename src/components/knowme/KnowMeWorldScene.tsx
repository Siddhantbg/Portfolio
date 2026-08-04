"use client";

/**
 * KNOW ME · Cyber City — fresh 3D explorer.
 *
 * - Neon cyber city map (CyberCity 2099)
 * - Player: floating "Iron Cameraman" (procedural hover bob), WASD flight
 * - Third-person chase camera
 * - NPC traffic: 2 black + 5 white cars looping fixed elliptical routes
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  CITY_BOUNDS_RADIUS,
  CITY_SIZE,
  FLY_MAX_Y,
  FLY_MIN_Y,
  KNOWME_CAR_KOENIGSEGG_PATH,
  KNOWME_CAR_SONATA_PATH,
  KNOWME_MAP_PATH,
  KNOWME_MC_PATH,
  MC_START,
  knowMeCars,
  type KnowMeCarConfig,
} from "@/data/knowMeWorld";

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

/** Enable shadows + sane texture settings on every mesh of a model. */
function prepareModel(root: THREE.Object3D, { shadows = true } = {}) {
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = shadows;
      mesh.receiveShadow = shadows;
      mesh.frustumCulled = true;
    }
  });
}

/**
 * Fit `scene` into a group so that:
 * - its longest horizontal side == `sizeXZ` (or height == `sizeY` if given)
 * - it is centered on x/z
 * - its lowest point sits at y = 0
 */
function useFitted(
  path: string,
  opts: { sizeXZ?: number; sizeY?: number },
): { object: THREE.Group; size: THREE.Vector3 } {
  const { scene } = useGLTF(path);

  return useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    let scale = 1;
    if (opts.sizeY) {
      scale = opts.sizeY / Math.max(size.y, 0.0001);
    } else if (opts.sizeXZ) {
      scale = opts.sizeXZ / Math.max(size.x, size.z, 0.0001);
    }

    const group = new THREE.Group();
    group.add(scene);
    scene.scale.setScalar(scale);
    scene.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    );

    prepareModel(scene);
    return { object: group, size: size.multiplyScalar(scale) };
  }, [scene, opts.sizeXZ, opts.sizeY]);
}

/* ────────────────────────────────────────────────────────────
   City map
   ──────────────────────────────────────────────────────────── */

function CityModel() {
  const { object } = useFitted(KNOWME_MAP_PATH, { sizeXZ: CITY_SIZE });
  return <primitive object={object} />;
}

/* ────────────────────────────────────────────────────────────
   Player — floating Iron Cameraman
   ──────────────────────────────────────────────────────────── */

const KEYS_FWD = ["KeyW", "ArrowUp"];
const KEYS_BACK = ["KeyS", "ArrowDown"];
const KEYS_LEFT = ["KeyA", "ArrowLeft"];
const KEYS_RIGHT = ["KeyD", "ArrowRight"];
const KEYS_UP = ["Space"];
const KEYS_DOWN = ["ShiftLeft", "ShiftRight", "ControlLeft", "KeyC"];

const FLY_SPEED = 34;
const VERTICAL_SPEED = 22;
const TURN_DAMP = 5.5;
const CAM_DISTANCE = 15;
const CAM_HEIGHT = 6.2;
const CAM_DAMP = 3.2;
const CAM_LOOK_AHEAD = 2.4;

interface PlayerRig {
  position: THREE.Vector3;
  heading: number;
  camYaw: number;
}

function IronMan({ paused }: { paused: boolean }) {
  const { object } = useFitted(KNOWME_MC_PATH, { sizeY: 4.2 });
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const keysRef = useRef<Set<string>>(new Set());

  const rig = useRef<PlayerRig>({
    position: new THREE.Vector3(...MC_START),
    heading: Math.PI,
    camYaw: Math.PI,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      // Keep the page from scrolling while flying
      if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    const clear = () => keysRef.current.clear();

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const keys = keysRef.current;
    const r = rig.current;

    if (!paused) {
      const pressed = (codes: string[]) => codes.some((c) => keys.has(c));

      /* movement input relative to the camera yaw */
      let ix = 0;
      let iz = 0;
      if (pressed(KEYS_FWD)) iz += 1;
      if (pressed(KEYS_BACK)) iz -= 1;
      if (pressed(KEYS_LEFT)) ix += 1;
      if (pressed(KEYS_RIGHT)) ix -= 1;

      const moving = ix !== 0 || iz !== 0;
      if (moving) {
        const len = Math.hypot(ix, iz);
        ix /= len;
        iz /= len;

        const sin = Math.sin(r.camYaw);
        const cos = Math.cos(r.camYaw);
        // camera-relative → world direction
        const dirX = iz * sin + ix * cos;
        const dirZ = iz * cos - ix * sin;

        r.position.x += dirX * FLY_SPEED * dt;
        r.position.z += dirZ * FLY_SPEED * dt;

        const targetHeading = Math.atan2(dirX, dirZ);
        let delta = targetHeading - r.heading;
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;
        r.heading += delta * Math.min(1, TURN_DAMP * dt);
      }

      /* altitude */
      if (pressed(KEYS_UP)) r.position.y += VERTICAL_SPEED * dt;
      if (pressed(KEYS_DOWN)) r.position.y -= VERTICAL_SPEED * dt;

      /* bounds */
      const radial = Math.hypot(r.position.x, r.position.z);
      if (radial > CITY_BOUNDS_RADIUS) {
        const k = CITY_BOUNDS_RADIUS / radial;
        r.position.x *= k;
        r.position.z *= k;
      }
      r.position.y = THREE.MathUtils.clamp(r.position.y, FLY_MIN_Y, FLY_MAX_Y);

      /* camera yaw slowly follows the heading for smooth chase turns */
      let camDelta = r.heading - r.camYaw;
      while (camDelta > Math.PI) camDelta -= Math.PI * 2;
      while (camDelta < -Math.PI) camDelta += Math.PI * 2;
      r.camYaw += camDelta * Math.min(1, CAM_DAMP * dt);
    }

    /* hover bob + gentle sway (visual only) */
    const t = state.clock.elapsedTime;
    const bob = Math.sin(t * 1.7) * 0.55;
    const sway = Math.sin(t * 0.9) * 0.06;

    const group = groupRef.current;
    if (group) {
      group.position.set(r.position.x, r.position.y + bob, r.position.z);
      group.rotation.y = r.heading;
    }
    const model = modelRef.current;
    if (model) {
      model.rotation.z = sway;
      model.rotation.x = Math.sin(t * 1.1) * 0.04;
    }

    /* chase camera */
    const cam = state.camera;
    const camX = r.position.x - Math.sin(r.camYaw) * CAM_DISTANCE;
    const camZ = r.position.z - Math.cos(r.camYaw) * CAM_DISTANCE;
    const camY = r.position.y + CAM_HEIGHT;

    const smooth = 1 - Math.exp(-4.5 * dt);
    cam.position.x += (camX - cam.position.x) * smooth;
    cam.position.y += (camY - cam.position.y) * smooth;
    cam.position.z += (camZ - cam.position.z) * smooth;

    cam.lookAt(
      r.position.x + Math.sin(r.heading) * CAM_LOOK_AHEAD,
      r.position.y + bob + 1.6,
      r.position.z + Math.cos(r.heading) * CAM_LOOK_AHEAD,
    );
  });

  return (
    <group ref={groupRef}>
      <group ref={modelRef}>
        <primitive object={object} />
        {/* under-glow so the character reads against the dark city */}
        <pointLight
          position={[0, 1.5, 0]}
          intensity={18}
          distance={26}
          color="#7fd0ff"
        />
      </group>
    </group>
  );
}

/* ────────────────────────────────────────────────────────────
   NPC cars — fixed elliptical routes
   ──────────────────────────────────────────────────────────── */

const PAINT_MATERIAL_RE = /chassis|body|paint|door|caixa|carro|COP_Liv/i;
const KEEP_MATERIAL_RE = /glass|window|tire|wheel|rim|light|interior|plate/i;

/** Clone a car and tint its paint materials black/white. */
function useTintedCar(model: KnowMeCarConfig["model"], tint: string) {
  const path =
    model === "koenigsegg"
      ? KNOWME_CAR_KOENIGSEGG_PATH
      : KNOWME_CAR_SONATA_PATH;
  const { scene } = useGLTF(path);

  return useMemo(() => {
    const clone = scene.clone(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 7 / Math.max(size.x, size.z, 0.0001);

    const group = new THREE.Group();
    group.add(clone);
    clone.scale.setScalar(scale);
    clone.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    );

    const color = new THREE.Color(tint);
    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = false;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      mesh.material = (Array.isArray(mesh.material)
        ? materials.map((m) => retintMaterial(m, color))
        : retintMaterial(materials[0], color)) as typeof mesh.material;
    });

    return group;
  }, [scene, tint]);
}

function retintMaterial(
  material: THREE.Material,
  color: THREE.Color,
): THREE.Material {
  const name = material.name ?? "";
  if (KEEP_MATERIAL_RE.test(name)) return material;
  if (!PAINT_MATERIAL_RE.test(name)) return material;

  const std = material as THREE.MeshStandardMaterial;
  const tinted = std.clone();
  tinted.map = null;
  tinted.color = color.clone();
  tinted.metalness = 0.75;
  tinted.roughness = 0.32;
  return tinted;
}

function NpcCar({ config }: { config: KnowMeCarConfig }) {
  const object = useTintedCar(config.model, config.tint);
  const ref = useRef<THREE.Group>(null);

  /* average angular speed so linear speed ≈ config.speed */
  const angularSpeed = useMemo(() => {
    const avgRadius = (config.radiusX + config.radiusZ) / 2;
    return (config.speed / Math.max(avgRadius, 1)) * config.direction;
  }, [config]);

  useFrame((state) => {
    const group = ref.current;
    if (!group) return;

    const t = config.phase + state.clock.elapsedTime * angularSpeed;
    const [cx, cz] = config.center;

    const x = cx + Math.cos(t) * config.radiusX;
    const z = cz + Math.sin(t) * config.radiusZ;

    /* tangent of the ellipse — direction of travel */
    const dx = -Math.sin(t) * config.radiusX * Math.sign(angularSpeed);
    const dz = Math.cos(t) * config.radiusZ * Math.sign(angularSpeed);

    group.position.set(x, 0.25, z);
    group.rotation.y = Math.atan2(dx, dz);
  });

  return (
    <group ref={ref}>
      <primitive object={object} />
    </group>
  );
}

function Traffic() {
  return (
    <>
      {knowMeCars.map((car) => (
        <NpcCar key={car.id} config={car} />
      ))}
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Scene
   ──────────────────────────────────────────────────────────── */

interface KnowMeWorldSceneProps {
  paused?: boolean;
}

export function KnowMeWorldScene({ paused = false }: KnowMeWorldSceneProps) {
  return (
    <Canvas
      className="knowme-world-canvas"
      shadows
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 34, 70], fov: 55, near: 0.5, far: 900 }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = new THREE.Color("#05010f");
        scene.fog = new THREE.Fog("#0a0518", 120, 520);
      }}
    >
      {/* night lighting — the city carries its own neon/emissive textures */}
      <ambientLight intensity={0.38} color="#8fa8ff" />
      <directionalLight
        position={[120, 180, 60]}
        intensity={0.9}
        color="#b9cdfa"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-220}
        shadow-camera-right={220}
        shadow-camera-top={220}
        shadow-camera-bottom={-220}
        shadow-camera-far={520}
      />
      <hemisphereLight args={["#33208a", "#050208", 0.55]} />

      <Stars radius={380} depth={60} count={2600} factor={5} fade speed={0.6} />

      <CityModel />
      <Traffic />
      <IronMan paused={paused} />
    </Canvas>
  );
}

useGLTF.preload(KNOWME_MAP_PATH);
useGLTF.preload(KNOWME_MC_PATH);
useGLTF.preload(KNOWME_CAR_KOENIGSEGG_PATH);
useGLTF.preload(KNOWME_CAR_SONATA_PATH);
