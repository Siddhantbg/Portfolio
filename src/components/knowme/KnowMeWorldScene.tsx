"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Billboard,
  Environment,
  Stars,
  Text,
  useAnimations,
  useFBX,
  useGLTF,
} from "@react-three/drei";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  CanvasTexture,
  Color,
  Group,
  LoopRepeat,
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
  LANDMARK_ENTER_RADIUS,
  MAP_RADIUS,
  knowMeDecorStones,
  knowMeLamps,
  knowMeLandmarks,
  knowMeTrees,
  type KnowMeLandmark,
} from "@/data/knowMeWorld";
import { careerModelAnimations } from "@/data/portfolio";
import { buildSafeClips } from "@/lib/safe-model-clips";

/* ------------------------------------------------------------------ */
/* Palette — deep plum night with warm ember accents (Bruno-inspired) */
/* ------------------------------------------------------------------ */
const NIGHT_BG = "#1d0716";
const GROUND_BASE = "#2a0b1d";
const EMBER = "#ff6a3d";
const GLOW_WHITE = "#fff4ec";

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
/* Ground — grid + little × marks, like a dark training ground   */
/* ------------------------------------------------------------ */
function useGroundTexture() {
  return useMemo(() => {
    const size = 512;
    const cell = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = GROUND_BASE;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(255, 140, 175, 0.07)";
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

    ctx.strokeStyle = "rgba(255, 150, 185, 0.30)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    const arm = 7;
    for (let x = 0; x <= size; x += cell) {
      for (let y = 0; y <= size; y += cell) {
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
    tex.repeat.set(8, 8);
    tex.anisotropy = 4;
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, []);
}

function Ground() {
  const texture = useGroundTexture();
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[MAP_RADIUS + 14, 72]} />
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0.02} />
      </mesh>
      {/* soft boundary ring so the playable edge reads */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[MAP_RADIUS - 0.14, MAP_RADIUS, 96]} />
        <meshStandardMaterial
          color="#5a1f3a"
          emissive="#a2325c"
          emissiveIntensity={0.35}
          transparent
          opacity={0.55}
        />
      </mesh>
    </>
  );
}

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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
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
          color={active ? "#ffe6d6" : "#c98da0"}
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
    const base = new Color("#e8395a");
    return base.offsetHSL(hueShift * 0.045, 0, hueShift * 0.04);
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
        <meshStandardMaterial color="#3a1224" roughness={0.8} />
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
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
        position={[0, 0.03, 4.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.85}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        outlineWidth={0.02}
        outlineColor={NIGHT_BG}
      >
        {"USE WASD / ARROWS\nTO WALK"}
      </Text>
      <Text
        font={KNOWME_HAND_FONT}
        position={[0, 0.03, -4.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.66}
        color="#ffd9c4"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        outlineWidth={0.02}
        outlineColor={NIGHT_BG}
      >
        {"WALK TO A GLOWING STONE\nPRESS ENTER TO OPEN"}
      </Text>
    </group>
  );
}

/* --------------------------------------- */
/* Camera follows the player from behind    */
/* --------------------------------------- */
function FollowCamera({ target }: { target: RefObject<Group | null> }) {
  const { camera } = useThree();
  const current = useRef(new Vector3(0, 9, 12));

  useFrame(() => {
    const player = target.current;
    if (!player) return;
    const desired = new Vector3(
      player.position.x,
      player.position.y + 8,
      player.position.z + 10.5,
    );
    current.current.lerp(desired, 0.07);
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

    const accel = 26;
    const maxSpeed = 6.5;
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
  paused,
  onNearestChange,
  onActivate,
  nearestId,
}: {
  paused: boolean;
  onNearestChange: (landmark: KnowMeLandmark | null) => void;
  onActivate: (landmark: KnowMeLandmark) => void;
  nearestId: string | null;
}) {
  const playerRef = useRef<Group>(null);
  const innerRef = useRef<Group>(null);

  return (
    <>
      <color attach="background" args={[NIGHT_BG]} />
      <fog attach="fog" args={[NIGHT_BG, 22, 46]} />

      <ambientLight color="#ffd9e4" intensity={0.3} />
      <hemisphereLight args={["#ff7aa2", "#12030c", 0.4]} />
      <directionalLight
        castShadow
        color="#ff9ec4"
        position={[12, 18, 8]}
        intensity={1.1}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      />

      <Stars radius={55} depth={22} count={1400} factor={3.2} fade speed={0.5} />

      <Ground />
      <SpawnArea />

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
        paused={paused}
        onNearestChange={onNearestChange}
        onActivate={onActivate}
      />
      <FollowCamera target={playerRef} />

      <Environment preset="night" />
    </>
  );
}

interface KnowMeWorldSceneProps {
  paused?: boolean;
  onNearestChange: (landmark: KnowMeLandmark | null) => void;
  onActivate: (landmark: KnowMeLandmark) => void;
  nearestId: string | null;
}

export function KnowMeWorldScene({
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
      camera={{ position: [0, 9, 12], fov: 42, near: 0.1, far: 90 }}
      gl={{ antialias: true, alpha: false }}
    >
      <Suspense fallback={null}>
        <WorldContents
          paused={paused}
          onNearestChange={onNearestChange}
          onActivate={onActivate}
          nearestId={nearestId}
        />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(KNOWME_AVATAR_PATH);
useGLTF.preload(KNOWME_STONES_PATH);
useFBX.preload(careerModelAnimations.idle);
