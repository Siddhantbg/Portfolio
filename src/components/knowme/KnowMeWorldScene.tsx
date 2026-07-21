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
  Box3,
  CanvasTexture,
  Color,
  Group,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Raycaster,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from "three";
import {
  KNOWME_AVATAR_PATH,
  KNOWME_HAND_FONT,
  KNOWME_MAP_PATH,
  KNOWME_RUN_FBX,
  KNOWME_TITLE_FONT,
  KNOWME_WALK_FBX,
  LANDMARK_ENTER_RADIUS,
  MAP_RADIUS,
  knowMeLamps,
  knowMeLandmarks,
  type KnowMeLandmark,
} from "@/data/knowMeWorld";
import { careerModelAnimations, profile } from "@/data/portfolio";
import { buildSafeClips } from "@/lib/safe-model-clips";

/* ------------------------------------------------------------------ */
/* Palette — violet loading void; the village model brings its own     */
/* colours once the world starts                                       */
/* ------------------------------------------------------------------ */
const NIGHT_BG = "#170929";
const EMBER = "#ff6a3d";
const GLOW_WHITE = "#fff4ec";

/** Tune these if the village needs nudging — world units per model unit */
const MAP_SCALE = 0.012;

function prepareShadows(root: Object3D) {
  root.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
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
/* Loader floor — infinite violet grid with × marks              */
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
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
      <circleGeometry args={[160, 64]} />
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

/* ------------------------------------------------------------------ */
/* Village map — scaled, centered, ground-aligned; provides a sampler  */
/* so everything else can sit on the terrain                           */
/* ------------------------------------------------------------------ */
type GroundSampler = (x: number, z: number, fallback?: number) => number;

function createGroundSampler(root: Object3D): GroundSampler {
  const raycaster = new Raycaster();
  const down = new Vector3(0, -1, 0);
  const origin = new Vector3();
  return (x, z, fallback = 0) => {
    origin.set(x, 200, z);
    raycaster.set(origin, down);
    const hits = raycaster.intersectObject(root, true);
    return hits.length > 0 ? hits[0].point.y : fallback;
  };
}

function MapModel({ onReady }: { onReady: (sampler: GroundSampler) => void }) {
  const { scene } = useGLTF(KNOWME_MAP_PATH);

  const { wrapper, sampler } = useMemo(() => {
    const cloned = scene.clone(true);
    prepareShadows(cloned);

    const wrapper = new Group();
    wrapper.add(cloned);
    wrapper.scale.setScalar(MAP_SCALE);
    wrapper.updateMatrixWorld(true);

    // center the footprint on the origin
    const box = new Box3().setFromObject(wrapper);
    const center = new Vector3();
    box.getCenter(center);
    wrapper.position.x -= center.x;
    wrapper.position.z -= center.z;
    wrapper.updateMatrixWorld(true);

    // drop the terrain so the ground at the spawn point sits at y = 0
    const preSampler = createGroundSampler(wrapper);
    const spawnGround = preSampler(0, 0, box.min.y);
    wrapper.position.y -= spawnGround;
    wrapper.updateMatrixWorld(true);

    return { wrapper, sampler: createGroundSampler(wrapper) };
  }, [scene]);

  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    onReadyRef.current(sampler);
  }, [sampler]);

  return <primitive object={wrapper} />;
}

/* --------------------------------------------------------------- */
/* Procedural landmark rocks — deterministic per seed, always up    */
/* --------------------------------------------------------------- */
function seededRand(seed: number, index: number) {
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function StandingRock({ seed }: { seed: number }) {
  const { color, height, leanZ, leanX, baseRocks } = useMemo(() => {
    const base = new Color("#9b8fae");
    base.offsetHSL(
      (seededRand(seed, 1) - 0.5) * 0.06,
      0,
      (seededRand(seed, 2) - 0.5) * 0.08,
    );
    return {
      color: base,
      height: 1.55 + seededRand(seed, 3) * 0.5,
      leanZ: (seededRand(seed, 4) - 0.5) * 0.22,
      leanX: (seededRand(seed, 5) - 0.5) * 0.14,
      baseRocks: [0, 1, 2].map((i) => ({
        x: Math.cos(seededRand(seed, 6 + i) * Math.PI * 2) * (0.85 + seededRand(seed, 9 + i) * 0.35),
        z: Math.sin(seededRand(seed, 6 + i) * Math.PI * 2) * (0.85 + seededRand(seed, 9 + i) * 0.35),
        s: 0.3 + seededRand(seed, 12 + i) * 0.28,
        rot: seededRand(seed, 15 + i) * Math.PI,
      })),
    };
  }, [seed]);

  return (
    <group>
      <mesh
        castShadow
        receiveShadow
        position={[0, height * 0.78, 0]}
        rotation={[leanX, seededRand(seed, 20) * Math.PI, leanZ]}
        scale={[1.05, height, 0.72]}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} roughness={0.9} flatShading />
      </mesh>
      {baseRocks.map((rock, i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={[rock.x, rock.s * 0.5, rock.z]}
          rotation={[0, rock.rot, 0]}
          scale={[rock.s * 1.3, rock.s * 0.75, rock.s]}
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} roughness={0.92} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------- */
/* Landmark — glowing ring + standing rock + label    */
/* ------------------------------------------------- */
function LandmarkStone({
  landmark,
  active,
  groundY,
}: {
  landmark: KnowMeLandmark;
  active: boolean;
  groundY: number;
}) {
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
    <group position={[landmark.position[0], groundY, landmark.position[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
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

      <group rotation={[0, landmark.rotationY, 0]}>
        <StandingRock seed={landmark.seed} />
      </group>

      <pointLight
        color={EMBER}
        intensity={active ? 26 : 12}
        distance={7}
        decay={2}
        position={[0, 1.6, 0]}
      />

      <Billboard position={[0, 3.1, 0]}>
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

/* ---------------------------------------------- */
/* Big extruded name — SIDDHANT BHAGAT             */
/* ---------------------------------------------- */
function NameMonument({ groundY }: { groundY: number }) {
  return (
    <group position={[0, groundY, -9.5]}>
      <Center disableY>
        <Text3D
          font={KNOWME_TITLE_FONT}
          size={1.6}
          height={0.6}
          bevelEnabled
          bevelThickness={0.045}
          bevelSize={0.035}
          bevelSegments={3}
          curveSegments={8}
          castShadow
        >
          {profile.name}
          <meshStandardMaterial color="#8b7cf8" roughness={0.55} metalness={0.1} />
        </Text3D>
      </Center>
    </group>
  );
}

function Lamp({
  x,
  z,
  rotY,
  groundY,
}: {
  x: number;
  z: number;
  rotY: number;
  groundY: number;
}) {
  return (
    <group position={[x, groundY, z]} rotation={[0, rotY, 0]}>
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

/* ---------------------------------------------------- */
/* Spawn circle — glowing ring + hand-written hint text  */
/* ---------------------------------------------------- */
function SpawnArea({ sampler }: { sampler: GroundSampler }) {
  const hintY = sampler(0, 5.4) + 0.08;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
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
        position={[0, hintY, 5.4]}
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

/* ---------------------------------------------- */
/* Player avatar — idle / walk / run animations    */
/* ---------------------------------------------- */
function renameClips(clips: import("three").AnimationClip[], label: string) {
  return clips.map((clip, index) => {
    const next = clip.clone();
    next.name = clips.length === 1 ? label : `${label}_${index}`;
    return next;
  });
}

/** Remove hip translation so Mixamo walk/run cycles play in place. */
function stripRootMotion(clips: import("three").AnimationClip[]) {
  for (const clip of clips) {
    clip.tracks = clip.tracks.filter(
      (track) =>
        !(
          track.name.toLowerCase().includes("hips") &&
          track.name.endsWith(".position")
        ),
    );
  }
  return clips;
}

function PlayerAvatar({ speedRef }: { speedRef: RefObject<number> }) {
  const modelRef = useRef<Group>(null);
  const { scene: glbScene } = useGLTF(KNOWME_AVATAR_PATH);
  const idleFbx = useFBX(careerModelAnimations.idle);
  const walkFbx = useFBX(KNOWME_WALK_FBX);
  const runFbx = useFBX(KNOWME_RUN_FBX);

  const model = useMemo(() => {
    let cloned: Object3D;
    try {
      cloned = cloneSkinned(glbScene) as Object3D;
    } catch {
      cloned = glbScene.clone(true);
    }
    prepareShadows(cloned);
    // skinned bounds go stale while animating — never cull the avatar
    cloned.traverse((child) => {
      child.frustumCulled = false;
    });
    return cloned;
  }, [glbScene]);

  const clips = useMemo(
    () =>
      buildSafeClips(model, [
        { label: "idle", animations: renameClips(idleFbx.animations, "idle") },
        {
          label: "walk",
          animations: stripRootMotion(renameClips(walkFbx.animations, "walk")),
        },
        {
          label: "run",
          animations: stripRootMotion(renameClips(runFbx.animations, "run")),
        },
      ]),
    [model, idleFbx, walkFbx, runFbx],
  );

  const { actions, mixer } = useAnimations(clips, modelRef);
  const currentRef = useRef("idle");

  useEffect(() => {
    const idle = actions.idle ?? Object.values(actions)[0];
    idle?.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.2).play();
    currentRef.current = "idle";
    return () => {
      mixer.stopAllAction();
    };
  }, [actions, mixer]);

  useFrame(() => {
    const speed = speedRef.current ?? 0;
    const target = speed > 5.8 ? "run" : speed > 0.5 ? "walk" : "idle";
    if (target !== currentRef.current) {
      const prev = actions[currentRef.current];
      const next = actions[target];
      if (next) {
        next.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.22).play();
        prev?.fadeOut(0.22);
        currentRef.current = target;
      }
    }
    if (currentRef.current !== "idle") {
      const action = actions[currentRef.current];
      if (action) {
        action.timeScale = Math.max(0.85, Math.min(1.7, speed / 3.6));
      }
    }
  });

  return <primitive ref={modelRef} object={model} />;
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

/* ---------------------------------------------------------- */
/* Keyboard controller — walk, face, terrain-follow, collide    */
/* ---------------------------------------------------------- */
interface PlayerControllerProps {
  playerRef: RefObject<Group | null>;
  speedRef: RefObject<number>;
  sampler: GroundSampler;
  paused: boolean;
  onNearestChange: (landmark: KnowMeLandmark | null) => void;
  onActivate: (landmark: KnowMeLandmark) => void;
}

function PlayerController({
  playerRef,
  speedRef,
  sampler,
  paused,
  onNearestChange,
  onActivate,
}: PlayerControllerProps) {
  const keys = useRef({ up: false, down: false, left: false, right: false });
  const velocity = useRef(new Vector3());
  const heading = useRef(Math.PI);
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

    const prevX = player.position.x;
    const prevZ = player.position.z;

    const accel = 34;
    const maxSpeed = 8.5;
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

    // soft collision with landmark rocks
    for (const landmark of knowMeLandmarks) {
      const dx = player.position.x - landmark.position[0];
      const dz = player.position.z - landmark.position[2];
      const dist = Math.hypot(dx, dz);
      const minDist = 1.8;
      if (dist < minDist && dist > 0.001) {
        const push = (minDist - dist) / minDist;
        player.position.x += (dx / dist) * push * 0.4;
        player.position.z += (dz / dist) * push * 0.4;
        velocity.current.multiplyScalar(0.7);
      }
    }

    // terrain follow — walls (steep rises) block, slopes are walked
    const groundY = sampler(
      player.position.x,
      player.position.z,
      player.position.y,
    );
    if (groundY - player.position.y > 2.2) {
      player.position.x = prevX;
      player.position.z = prevZ;
      velocity.current.multiplyScalar(-0.15);
    } else {
      player.position.y += (groundY - player.position.y) * Math.min(1, delta * 10);
    }

    const speed = velocity.current.length();
    speedRef.current = speed;

    // face the walk direction
    if (speed > 0.25) {
      const target = Math.atan2(velocity.current.x, velocity.current.z);
      let diff = target - heading.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      heading.current += diff * Math.min(1, delta * 10);
      player.rotation.y = heading.current;
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
  const speedRef = useRef(0);
  const [sampler, setSampler] = useState<GroundSampler | null>(null);

  // terrain heights are raycasts against the village mesh — compute once
  const groundYs = useMemo(() => {
    if (!sampler) return null;
    return {
      name: sampler(0, -9.5),
      landmarks: knowMeLandmarks.map((l) =>
        sampler(l.position[0], l.position[2]),
      ),
      lamps: knowMeLamps.map(([x, z]) => sampler(x, z)),
    };
  }, [sampler]);

  return (
    <group visible={visible}>
      <MapModel onReady={(s) => setSampler(() => s)} />

      {sampler && groundYs && (
        <>
          <SpawnArea sampler={sampler} />
          <NameMonument groundY={groundYs.name} />

          {knowMeLandmarks.map((landmark, index) => (
            <LandmarkStone
              key={landmark.id}
              landmark={landmark}
              active={landmark.id === nearestId}
              groundY={groundYs.landmarks[index]}
            />
          ))}

          {knowMeLamps.map(([x, z, rotY], index) => (
            <Lamp
              key={index}
              x={x}
              z={z}
              rotY={rotY}
              groundY={groundYs.lamps[index]}
            />
          ))}

          <group ref={playerRef} rotation={[0, Math.PI, 0]}>
            <PlayerAvatar speedRef={speedRef} />
          </group>

          <PlayerController
            playerRef={playerRef}
            speedRef={speedRef}
            sampler={sampler}
            paused={paused || !visible}
            onNearestChange={onNearestChange}
            onActivate={onActivate}
          />
          {visible && <FollowCamera target={playerRef} />}
        </>
      )}
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
      camera={{ position: [10.5, 8.2, 10.5], fov: 42, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={[NIGHT_BG]} />
      <fog attach="fog" args={[NIGHT_BG, 34, 110]} />

      <ambientLight color="#d9c4ff" intensity={0.35} />
      <hemisphereLight args={["#c77aff", "#12041f", 0.42]} />
      <directionalLight
        castShadow
        color="#ffa8d4"
        position={[24, 36, 16]}
        intensity={1.15}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-far={140}
      />

      <Stars radius={90} depth={30} count={1600} factor={4} fade speed={0.5} />

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
useGLTF.preload(KNOWME_MAP_PATH);
useFBX.preload(careerModelAnimations.idle);
useFBX.preload(KNOWME_WALK_FBX);
useFBX.preload(KNOWME_RUN_FBX);
