"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Billboard,
  Center,
  Environment,
  Stars,
  Text,
  Text3D,
  useAnimations,
  useFBX,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  CanvasTexture,
  Color,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  LoopRepeat,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from "three";
import {
  KNOWME_AVATAR_PATH,
  KNOWME_HAND_FONT,
  KNOWME_STONES_PATH,
  KNOWME_TITLE_FONT,
  LANDMARK_ENTER_RADIUS,
  MAP_RADIUS,
  knowMeDecorStones,
  knowMeLamps,
  knowMeLandmarks,
  knowMeTrees,
  type KnowMeLandmark,
} from "@/data/knowMeWorld";
import { careerModelAnimations, profile } from "@/data/portfolio";
import { buildSafeClips } from "@/lib/safe-model-clips";

/* ------------------------------------------------------------------ */
/* Palette — violet loading void, purple-lit grassy world after start  */
/* ------------------------------------------------------------------ */
const NIGHT_BG = "#170929";
const EMBER = "#ff6a3d";
const GLOW_WHITE = "#fff4ec";
const ISLAND_RADIUS = MAP_RADIUS + 3;

function prepareShadows(root: Object3D) {
  root.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const mat of materials) {
      if (mat instanceof MeshStandardMaterial && mat.map) {
        mat.map.colorSpace = SRGBColorSpace;
      }
    }
  });
}

/* ------------------------------------------------------------ */
/* Loader floor — infinite violet grid with × marks (image ref)  */
/* ------------------------------------------------------------ */
function useGridTexture() {
  return useMemo(() => {
    const size = 512;
    const cell = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#1e0d38";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(122, 92, 255, 0.20)";
    ctx.lineWidth = 2;
    for (let p = 0; p <= size; p += cell) {
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(size, p);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(138, 107, 255, 0.55)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    const arm = 8;
    for (let x = cell / 2; x < size; x += cell) {
      for (let y = cell / 2; y < size; y += cell) {
        ctx.beginPath();
        ctx.moveTo(x - arm, y - arm);
        ctx.lineTo(x + arm, y + arm);
        ctx.moveTo(x + arm, y - arm);
        ctx.lineTo(x - arm, y + arm);
        ctx.stroke();
      }
    }

    const tex = new CanvasTexture(canvas);
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    tex.repeat.set(24, 24);
    tex.anisotropy = 4;
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, []);
}

function GridFloor() {
  const texture = useGridTexture();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <circleGeometry args={[85, 64]} />
      <meshStandardMaterial map={texture} roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

/* ----------------------------------------------------------------- */
/* Loading ring — a white arc that sweeps from a point to full circle */
/* ----------------------------------------------------------------- */
function LoadingStage() {
  const { progress } = useProgress();
  const [sweep, setSweep] = useState(0);
  const displayRef = useRef(0);
  const targetRef = useRef(0);

  useEffect(() => {
    targetRef.current = Math.max(targetRef.current, progress);
  }, [progress]);

  useFrame((_, delta) => {
    const target = Math.max(targetRef.current, 3);
    displayRef.current += (target - displayRef.current) * Math.min(1, delta * 2.6);
    const quantized = Math.min(100, Math.round(displayRef.current));
    if (quantized !== sweep) setSweep(quantized);
  });

  const theta = (sweep / 100) * Math.PI * 2;

  return (
    <group>
      {/* faint full track */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2.92, 3.06, 96]} />
        <meshBasicMaterial
          color="#7a5cff"
          transparent
          opacity={0.18}
          toneMapped={false}
        />
      </mesh>
      {/* progress arc — grows clockwise from 12 o'clock */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[2.88, 3.1, 96, 1, Math.PI / 2, theta]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      <Text
        font={KNOWME_HAND_FONT}
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`${sweep}%`}
      </Text>
      <Text
        font={KNOWME_HAND_FONT}
        position={[0, 0.03, 4.35]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.62}
        color="#b9a5ff"
        anchorX="center"
        anchorY="middle"
      >
        LOADING WORLD
      </Text>
    </group>
  );
}

/* ------------------------------------------------------------------- */
/* Grass island — baked texture: grass, tiled plaza, paths to landmarks */
/* ------------------------------------------------------------------- */
function useGrassTexture() {
  return useMemo(() => {
    const size = 1024;
    const scale = size / (ISLAND_RADIUS * 2);
    const toPx = (u: number) => size / 2 + u * scale;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#57813f";
    ctx.fillRect(0, 0, size, size);

    // mottled grass speckles
    for (let i = 0; i < 4200; i += 1) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const light = Math.random() > 0.5;
      ctx.fillStyle = light
        ? "rgba(140, 178, 96, 0.22)"
        : "rgba(46, 74, 34, 0.25)";
      const r = 1.5 + Math.random() * 3;
      ctx.fillRect(x, y, r, r);
    }

    const drawTile = (
      cx: number,
      cy: number,
      angle: number,
      w: number,
      h: number,
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const jitter = (Math.random() - 0.5) * 14;
      ctx.fillStyle = `rgb(${122 + jitter}, ${100 + jitter}, ${134 + jitter})`;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    };

    // central plaza of tiles
    const plazaR = 4.1;
    const step = 0.95;
    for (let gx = -plazaR; gx <= plazaR; gx += step) {
      for (let gz = -plazaR; gz <= plazaR; gz += step) {
        if (Math.hypot(gx, gz) > plazaR) continue;
        drawTile(toPx(gx), toPx(gz), 0, 0.82 * scale, 0.82 * scale);
      }
    }

    // tiled paths from plaza to every landmark stone
    for (const landmark of knowMeLandmarks) {
      const [lx, , lz] = landmark.position;
      const dist = Math.hypot(lx, lz);
      const dirX = lx / dist;
      const dirZ = lz / dist;
      const angle = Math.atan2(lz, lx);
      for (let d = plazaR - 0.2; d < dist - 2.3; d += 1.0) {
        const off = (Math.random() - 0.5) * 0.14;
        const px = toPx(dirX * d - dirZ * off);
        const py = toPx(dirZ * d + dirX * off);
        drawTile(px, py, angle, 0.86 * scale, 1.5 * scale);
      }
    }

    const tex = new CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, []);
}

function GrassIsland() {
  const texture = useGrassTexture();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
      <circleGeometry args={[ISLAND_RADIUS, 80]} />
      <meshStandardMaterial map={texture} roughness={0.95} metalness={0.02} />
    </mesh>
  );
}

/* ---------------------------------------------- */
/* Instanced grass tufts scattered over the island */
/* ---------------------------------------------- */
function distanceToPath(x: number, z: number) {
  let min = Infinity;
  for (const landmark of knowMeLandmarks) {
    const [lx, , lz] = landmark.position;
    const dist = Math.hypot(lx, lz);
    const dirX = lx / dist;
    const dirZ = lz / dist;
    const along = x * dirX + z * dirZ;
    if (along < 3.4 || along > dist) continue;
    const perp = Math.abs(x * -dirZ + z * dirX);
    min = Math.min(min, perp);
  }
  return min;
}

function GrassTufts({ count = 2400 }: { count?: number }) {
  const meshRef = useRef<InstancedMesh>(null);

  const placements = useMemo(() => {
    const list: Array<{ x: number; z: number; s: number; rot: number; shade: number }> = [];
    let guard = 0;
    while (list.length < count && guard < count * 12) {
      guard += 1;
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.6 + Math.sqrt(Math.random()) * (ISLAND_RADIUS - 4.2);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      if (distanceToPath(x, z) < 1.15) continue;
      // keep the name monument clearing tidy
      if (Math.abs(x) < 8.5 && z > -12.5 && z < -7) continue;
      const nearLandmark = knowMeLandmarks.some(
        (l) => Math.hypot(x - l.position[0], z - l.position[2]) < 2.4,
      );
      if (nearLandmark) continue;
      list.push({
        x,
        z,
        s: 0.7 + Math.random() * 0.9,
        rot: Math.random() * Math.PI,
        shade: Math.random(),
      });
    }
    return list;
  }, [count]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    const dummy = new Object3D();
    const colorA = new Color("#6f9b52");
    const colorB = new Color("#44672f");
    const mixed = new Color();
    placements.forEach((p, i) => {
      dummy.position.set(p.x, 0.16 * p.s, p.z);
      dummy.rotation.set(0, p.rot, 0);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      matrix.copy(dummy.matrix);
      mesh.setMatrixAt(i, matrix);
      mixed.copy(colorA).lerp(colorB, p.shade);
      mesh.setColorAt(i, mixed);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.setUsage(DynamicDrawUsage);
      mesh.instanceColor.needsUpdate = true;
    }
  }, [placements]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, placements.length]}
      frustumCulled={false}
    >
      <coneGeometry args={[0.09, 0.42, 4]} />
      <meshStandardMaterial roughness={0.9} flatShading />
    </instancedMesh>
  );
}

/* ---------------------------------------------- */
/* Big extruded name — like the BRUNO SIMON text   */
/* ---------------------------------------------- */
function NameMonument() {
  // Sits in a dedicated clearing north of the spawn plaza —
  // no stones, paths, or trees are placed in this corridor.
  return (
    <Center position={[0, 0, -9.5]} disableY>
      <Text3D
        font={KNOWME_TITLE_FONT}
        size={1.35}
        height={0.55}
        bevelEnabled
        bevelThickness={0.045}
        bevelSize={0.035}
        bevelSegments={3}
        curveSegments={8}
        castShadow
      >
        {profile.name}
        <meshStandardMaterial
          color="#8b7cf8"
          roughness={0.55}
          metalness={0.1}
        />
      </Text3D>
    </Center>
  );
}

/* --------------------------- */
/* Wooden props — fence, crate */
/* --------------------------- */
function Fence({
  position,
  rotationY,
}: {
  position: [number, number, number];
  rotationY: number;
}) {
  const wood = "#7a4468";
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} castShadow position={[x, 0.5, 0]}>
          <boxGeometry args={[0.16, 1.0, 0.16]} />
          <meshStandardMaterial color={wood} roughness={0.85} />
        </mesh>
      ))}
      {[0.42, 0.78].map((y) => (
        <mesh key={y} castShadow position={[0, y, 0]}>
          <boxGeometry args={[2.5, 0.13, 0.08]} />
          <meshStandardMaterial color={wood} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Crate({
  position,
  rotationY,
  scale = 1,
}: {
  position: [number, number, number];
  rotationY: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh castShadow position={[0, 0.42, 0]}>
        <boxGeometry args={[0.84, 0.84, 0.84]} />
        <meshStandardMaterial color="#8a4438" roughness={0.8} />
      </mesh>
      {[-0.28, 0.28].map((y) => (
        <mesh key={y} castShadow position={[0, 0.42 + y, 0]}>
          <boxGeometry args={[0.88, 0.12, 0.88]} />
          <meshStandardMaterial color="#5c2a22" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Bush({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: number;
}) {
  return (
    <mesh castShadow position={position} scale={[scale, scale * 0.72, scale]}>
      <icosahedronGeometry args={[0.6, 1]} />
      <meshStandardMaterial
        color="#c9558a"
        emissive="#c9558a"
        emissiveIntensity={0.08}
        roughness={0.9}
        flatShading
      />
    </mesh>
  );
}

const bushPlacements: Array<{ position: [number, number, number]; scale: number }> = [
  { position: [-8.4, 0.3, 6.3], scale: 1.1 },
  { position: [9.3, 0.25, 4.8], scale: 0.9 },
  { position: [-11.7, 0.3, -5.1], scale: 1.2 },
  { position: [11.1, 0.28, -5.7], scale: 1.0 },
  { position: [-4.8, 0.24, -12.6], scale: 0.85 },
  { position: [5.7, 0.3, 13.8], scale: 1.15 },
  { position: [-16.8, 0.26, 2.7], scale: 0.9 },
  { position: [17.4, 0.3, 1.8], scale: 1.05 },
  { position: [-2.2, 0.28, 17.5], scale: 1.1 },
  { position: [13.5, 0.26, 10.5], scale: 0.9 },
  { position: [-14.5, 0.3, -12], scale: 1.05 },
  { position: [6.5, 0.24, -14.5], scale: 0.9 },
];

/* ---------------------------------------------- */
/* Player avatar — the Developer model, idling     */
/* ---------------------------------------------- */
function renameClips(clips: import("three").AnimationClip[], label: string) {
  return clips.map((clip, index) => {
    const next = clip.clone();
    next.name = clips.length === 1 ? label : `${label}_${index}`;
    return next;
  });
}

function PlayerAvatar() {
  const modelRef = useRef<Group>(null);
  const { scene: glbScene } = useGLTF(KNOWME_AVATAR_PATH);
  const idleFbx = useFBX(careerModelAnimations.idle);

  const model = useMemo(() => {
    let cloned: Object3D;
    try {
      cloned = cloneSkinned(glbScene) as Object3D;
    } catch {
      cloned = glbScene.clone(true);
    }
    prepareShadows(cloned);
    return cloned;
  }, [glbScene]);

  const clips = useMemo(
    () =>
      buildSafeClips(model, [
        { label: "idle", animations: renameClips(idleFbx.animations, "idle") },
      ]),
    [model, idleFbx],
  );

  const { actions, mixer } = useAnimations(clips, modelRef);

  useEffect(() => {
    const idle = actions.idle ?? Object.values(actions)[0];
    idle?.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.2).play();
    return () => {
      mixer.stopAllAction();
    };
  }, [actions, mixer]);

  return <primitive ref={modelRef} object={model} />;
}

/* ------------------------------------------------- */
/* Landmark stone — glowing ring + rock + hand label  */
/* ------------------------------------------------- */
function useStoneMesh(meshName: string) {
  const { scene } = useGLTF(KNOWME_STONES_PATH);
  return useMemo(() => {
    let source: Object3D | null = null;
    scene.traverse((child) => {
      if (!source && child.name === meshName) source = child;
    });
    if (!source) {
      scene.traverse((child) => {
        const mesh = child as Mesh;
        if (!source && mesh.isMesh) source = child;
      });
    }
    if (!source) return null;
    const cloned = (source as Object3D).clone(true);
    cloned.position.set(0, 0, 0);
    cloned.rotation.set(0, 0, 0);
    prepareShadows(cloned);
    return cloned;
  }, [scene, meshName]);
}

function LandmarkStone({
  landmark,
  active,
}: {
  landmark: KnowMeLandmark;
  active: boolean;
}) {
  const stone = useStoneMesh(landmark.stoneMesh);
  const ringMat = useRef<MeshStandardMaterial>(null);
  const fillMat = useRef<MeshStandardMaterial>(null);
  const emberColor = useMemo(() => new Color(EMBER), []);
  const whiteColor = useMemo(() => new Color(GLOW_WHITE), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pulse = 0.5 + Math.sin(t * 2.6) * 0.5;
    if (ringMat.current) {
      ringMat.current.emissiveIntensity = active ? 2.4 + pulse : 0.9 + pulse * 0.25;
      ringMat.current.emissive = active ? whiteColor : emberColor;
    }
    if (fillMat.current) {
      fillMat.current.opacity = active ? 0.32 + pulse * 0.12 : 0.14 + pulse * 0.05;
    }
  });

  return (
    <group position={landmark.position}>
      {/* glow ring on the ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.75, 1.95, 56]} />
        <meshStandardMaterial
          ref={ringMat}
          color={GLOW_WHITE}
          emissive={EMBER}
          emissiveIntensity={1}
          roughness={0.4}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <circleGeometry args={[1.75, 56]} />
        <meshStandardMaterial
          ref={fillMat}
          color={EMBER}
          emissive={EMBER}
          emissiveIntensity={0.9}
          transparent
          opacity={0.16}
        />
      </mesh>

      {stone && (
        <group scale={landmark.stoneScale} rotation={[0, landmark.stoneRotationY, 0]}>
          <primitive object={stone} />
        </group>
      )}

      {/* warm light so the stone reads at night */}
      <pointLight
        color={EMBER}
        intensity={active ? 26 : 12}
        distance={7}
        decay={2}
        position={[0, 1.6, 0]}
      />

      {/* hand-drawn floating label */}
      <Billboard position={[0, 2.75, 0]}>
        <Text
          font={KNOWME_HAND_FONT}
          fontSize={0.72}
          color={active ? "#ffffff" : "#ffd9c4"}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.028}
          outlineColor={NIGHT_BG}
        >
          {landmark.label.toUpperCase()}
        </Text>
        <Text
          font={KNOWME_HAND_FONT}
          fontSize={0.36}
          color={active ? "#ffe6d6" : "#e5b9c8"}
          anchorX="center"
          anchorY="top"
          position={[0, -0.06, 0]}
          outlineWidth={0.02}
          outlineColor={NIGHT_BG}
        >
          {landmark.subtitle}
        </Text>
      </Billboard>
    </group>
  );
}

/* ------------------------- */
/* Decorative low-poly trees */
/* ------------------------- */
function Tree({
  x,
  z,
  scale,
  hueShift,
}: {
  x: number;
  z: number;
  scale: number;
  hueShift: number;
}) {
  const foliage = useMemo(() => {
    const base = new Color("#d9598a");
    return base.offsetHSL(hueShift * 0.05, 0.02, hueShift * 0.05);
  }, [hueShift]);

  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 1.8, 6]} />
        <meshStandardMaterial color="#41152a" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 2.2, 0]}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial
          color={foliage}
          emissive={foliage}
          emissiveIntensity={0.12}
          roughness={0.85}
          flatShading
        />
      </mesh>
      <mesh castShadow position={[0.7, 1.7, 0.25]}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial
          color={foliage}
          emissive={foliage}
          emissiveIntensity={0.1}
          roughness={0.85}
          flatShading
        />
      </mesh>
      <mesh castShadow position={[-0.6, 1.85, -0.3]}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color={foliage}
          emissive={foliage}
          emissiveIntensity={0.1}
          roughness={0.85}
          flatShading
        />
      </mesh>
    </group>
  );
}

function Lamp({ x, z, rotY }: { x: number; z: number; rotY: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh castShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[0.16, 2.2, 0.16]} />
        <meshStandardMaterial color="#3a1235" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[0.44, 0.5, 0.3]} />
        <meshStandardMaterial
          color="#ffb26b"
          emissive="#ff8a3d"
          emissiveIntensity={2.2}
        />
      </mesh>
      <pointLight
        color="#ff8a3d"
        intensity={16}
        distance={9}
        decay={2}
        position={[0, 2.1, 0]}
      />
    </group>
  );
}

function DecorStone({
  meshName,
  position,
  scale,
  rotationY,
}: {
  meshName: string;
  position: [number, number, number];
  scale: number;
  rotationY: number;
}) {
  const stone = useStoneMesh(meshName);
  if (!stone) return null;
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <primitive object={stone} />
    </group>
  );
}

/* ---------------------------------------------------- */
/* Spawn circle — glowing ring + hand-written hint text  */
/* ---------------------------------------------------- */
function SpawnArea() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[3.1, 3.24, 72]} />
        <meshStandardMaterial
          color={GLOW_WHITE}
          emissive={GLOW_WHITE}
          emissiveIntensity={1.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      <Text
        font={KNOWME_HAND_FONT}
        position={[0, 0.04, 5.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.78}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        outlineWidth={0.02}
        outlineColor={NIGHT_BG}
      >
        {"USE WASD / ARROWS TO WALK\nENTER OPENS A GLOWING STONE"}
      </Text>
    </group>
  );
}

/* --------------------------------------- */
/* Cameras                                  */
/* --------------------------------------- */
function LoaderCamera() {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.08;
    camera.position.set(
      Math.sin(t) * 1.2 + 10.5,
      8.2,
      Math.cos(t) * 1.2 + 10.5,
    );
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function FollowCamera({ target }: { target: RefObject<Group | null> }) {
  const { camera } = useThree();
  const current = useRef<Vector3 | null>(null);

  useFrame(() => {
    const player = target.current;
    if (!player) return;
    if (!current.current) {
      // glide in from wherever the loader camera left off
      current.current = camera.position.clone();
    }
    const desired = new Vector3(
      player.position.x,
      player.position.y + 9,
      player.position.z + 12,
    );
    current.current.lerp(desired, 0.06);
    camera.position.copy(current.current);
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
  });

  return null;
}

/* ------------------------------------------------ */
/* Keyboard controller — walk, face, collide, detect */
/* ------------------------------------------------ */
interface PlayerControllerProps {
  playerRef: RefObject<Group | null>;
  innerRef: RefObject<Group | null>;
  paused: boolean;
  onNearestChange: (landmark: KnowMeLandmark | null) => void;
  onActivate: (landmark: KnowMeLandmark) => void;
}

function PlayerController({
  playerRef,
  innerRef,
  paused,
  onNearestChange,
  onActivate,
}: PlayerControllerProps) {
  const keys = useRef({ up: false, down: false, left: false, right: false });
  const velocity = useRef(new Vector3());
  const heading = useRef(Math.PI);
  const walkClock = useRef(0);
  const nearestRef = useRef<KnowMeLandmark | null>(null);
  const onNearestChangeRef = useRef(onNearestChange);
  const onActivateRef = useRef(onActivate);
  const pausedRef = useRef(paused);

  useEffect(() => {
    onNearestChangeRef.current = onNearestChange;
  }, [onNearestChange]);
  useEffect(() => {
    onActivateRef.current = onActivate;
  }, [onActivate]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const mapKey = (key: string) => {
      if (key === "ArrowUp" || key === "w" || key === "W") return "up";
      if (key === "ArrowDown" || key === "s" || key === "S") return "down";
      if (key === "ArrowLeft" || key === "a" || key === "A") return "left";
      if (key === "ArrowRight" || key === "d" || key === "D") return "right";
      return null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (pausedRef.current) return;
      const dir = mapKey(event.key);
      if (dir) {
        keys.current[dir] = true;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (event.key === "Enter" || event.key === "e" || event.key === "E") {
        if (nearestRef.current) {
          event.preventDefault();
          event.stopPropagation();
          onActivateRef.current(nearestRef.current);
        }
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const dir = mapKey(event.key);
      if (dir) keys.current[dir] = false;
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, []);

  useFrame((_, delta) => {
    const player = playerRef.current;
    if (!player || pausedRef.current) return;

    const accel = 30;
    const maxSpeed = 7.5;
    const damp = Math.pow(0.84, delta * 60);
    const input = new Vector3(
      (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0),
      0,
      (keys.current.down ? 1 : 0) - (keys.current.up ? 1 : 0),
    );
    if (input.lengthSq() > 0) {
      input.normalize().multiplyScalar(accel * delta);
      velocity.current.add(input);
    }
    velocity.current.multiplyScalar(damp);
    if (velocity.current.length() > maxSpeed) {
      velocity.current.setLength(maxSpeed);
    }

    player.position.x += velocity.current.x * delta;
    player.position.z += velocity.current.z * delta;

    // stay inside the world
    const radial = Math.hypot(player.position.x, player.position.z);
    if (radial > MAP_RADIUS - 0.5) {
      const s = (MAP_RADIUS - 0.5) / radial;
      player.position.x *= s;
      player.position.z *= s;
      velocity.current.multiplyScalar(0.4);
    }

    // soft collision with landmark stones
    for (const landmark of knowMeLandmarks) {
      const dx = player.position.x - landmark.position[0];
      const dz = player.position.z - landmark.position[2];
      const dist = Math.hypot(dx, dz);
      const minDist = 1.35;
      if (dist < minDist && dist > 0.001) {
        const push = (minDist - dist) / minDist;
        player.position.x += (dx / dist) * push * 0.4;
        player.position.z += (dz / dist) * push * 0.4;
        velocity.current.multiplyScalar(0.7);
      }
    }

    const speed = velocity.current.length();

    // face the walk direction
    if (speed > 0.25) {
      const target = Math.atan2(velocity.current.x, velocity.current.z);
      let diff = target - heading.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      heading.current += diff * Math.min(1, delta * 10);
      player.rotation.y = heading.current;
    }

    // playful walk bob + lean on the inner group
    const inner = innerRef.current;
    if (inner) {
      if (speed > 0.4) {
        walkClock.current += delta * (6 + speed * 1.4);
        inner.position.y = Math.abs(Math.sin(walkClock.current)) * 0.09;
        inner.rotation.x = Math.min(0.16, speed * 0.03);
      } else {
        inner.position.y += (0 - inner.position.y) * Math.min(1, delta * 8);
        inner.rotation.x += (0 - inner.rotation.x) * Math.min(1, delta * 8);
      }
    }

    // nearest landmark within reach
    let best: KnowMeLandmark | null = null;
    let bestDist = LANDMARK_ENTER_RADIUS;
    for (const landmark of knowMeLandmarks) {
      const d = Math.hypot(
        player.position.x - landmark.position[0],
        player.position.z - landmark.position[2],
      );
      if (d < bestDist) {
        bestDist = d;
        best = landmark;
      }
    }
    if (best?.id !== nearestRef.current?.id) {
      nearestRef.current = best;
      onNearestChangeRef.current(best);
    }
  });

  return null;
}

/* -------------- */
/* Full 3D world  */
/* -------------- */
function WorldContents({
  visible,
  paused,
  onNearestChange,
  onActivate,
  nearestId,
}: {
  visible: boolean;
  paused: boolean;
  onNearestChange: (landmark: KnowMeLandmark | null) => void;
  onActivate: (landmark: KnowMeLandmark) => void;
  nearestId: string | null;
}) {
  const playerRef = useRef<Group>(null);
  const innerRef = useRef<Group>(null);

  return (
    <group visible={visible}>
      <GrassIsland />
      <GrassTufts />
      <SpawnArea />
      <NameMonument />

      {/* fences frame the name monument clearing */}
      <Fence position={[-6.2, 0, -7.2]} rotationY={0.35} />
      <Fence position={[6.2, 0, -7.2]} rotationY={-0.35} />

      <Crate position={[10.8, 0, 8.2]} rotationY={0.3} />
      <Crate position={[11.6, 0, 7.5]} rotationY={-0.4} scale={0.85} />
      <Crate position={[11.1, 0.84, 7.9]} rotationY={0.9} scale={0.75} />

      {bushPlacements.map((bush, index) => (
        <Bush key={index} position={bush.position} scale={bush.scale} />
      ))}

      {knowMeLandmarks.map((landmark) => (
        <LandmarkStone
          key={landmark.id}
          landmark={landmark}
          active={landmark.id === nearestId}
        />
      ))}

      {knowMeDecorStones.map((prop, index) => (
        <DecorStone
          key={`${prop.mesh}-${index}`}
          meshName={prop.mesh}
          position={prop.position}
          scale={prop.scale}
          rotationY={prop.rotationY}
        />
      ))}

      {knowMeTrees.map(([x, z, scale, hue], index) => (
        <Tree key={index} x={x} z={z} scale={scale} hueShift={hue} />
      ))}

      {knowMeLamps.map(([x, z, rotY], index) => (
        <Lamp key={index} x={x} z={z} rotY={rotY} />
      ))}

      <group ref={playerRef} rotation={[0, Math.PI, 0]}>
        <group ref={innerRef}>
          <PlayerAvatar />
        </group>
      </group>

      <PlayerController
        playerRef={playerRef}
        innerRef={innerRef}
        paused={paused || !visible}
        onNearestChange={onNearestChange}
        onActivate={onActivate}
      />
      {visible && <FollowCamera target={playerRef} />}
    </group>
  );
}

interface KnowMeWorldSceneProps {
  started: boolean;
  paused?: boolean;
  onNearestChange: (landmark: KnowMeLandmark | null) => void;
  onActivate: (landmark: KnowMeLandmark) => void;
  nearestId: string | null;
}

export function KnowMeWorldScene({
  started,
  paused = false,
  onNearestChange,
  onActivate,
  nearestId,
}: KnowMeWorldSceneProps) {
  return (
    <Canvas
      className="knowme-world-canvas"
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [10.5, 8.2, 10.5], fov: 42, near: 0.1, far: 120 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={[NIGHT_BG]} />
      <fog attach="fog" args={[NIGHT_BG, 28, 66]} />

      <ambientLight color="#d9c4ff" intensity={0.32} />
      <hemisphereLight args={["#c77aff", "#12041f", 0.4]} />
      <directionalLight
        castShadow
        color="#ffa8d4"
        position={[12, 18, 8]}
        intensity={1.15}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
      />

      <Stars radius={60} depth={24} count={1400} factor={3.2} fade speed={0.5} />

      <GridFloor />
      {!started && <LoadingStage />}
      {!started && <LoaderCamera />}

      <Suspense fallback={null}>
        <WorldContents
          visible={started}
          paused={paused}
          onNearestChange={onNearestChange}
          onActivate={onActivate}
          nearestId={nearestId}
        />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(KNOWME_AVATAR_PATH);
useGLTF.preload(KNOWME_STONES_PATH);
useFBX.preload(careerModelAnimations.idle);
