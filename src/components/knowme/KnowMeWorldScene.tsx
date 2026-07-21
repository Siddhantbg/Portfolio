"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Text, useGLTF } from "@react-three/drei";
import {
  Box3,
  Group,
  Mesh,
  Object3D,
  Quaternion,
  Vector3,
} from "three";
import {
  EGG_ENTER_RADIUS,
  KNOWME_BALL_PATH,
  KNOWME_STONES_PATH,
  MAP_RADIUS,
  knowMeEggs,
  knowMeStoneProps,
  type KnowMeEgg,
} from "@/data/knowMeWorld";

function fitObject(object: Object3D, targetSize: number) {
  object.position.set(0, 0, 0);
  object.scale.setScalar(1);
  const box = new Box3().setFromObject(object);
  const size = new Vector3();
  box.getSize(size);
  const max = Math.max(size.x, size.y, size.z) || 1;
  const s = targetSize / max;
  object.scale.setScalar(s);

  box.setFromObject(object);
  const center = new Vector3();
  box.getCenter(center);
  object.position.x -= center.x;
  object.position.z -= center.z;
  object.position.y -= box.min.y;
}

function prepareShadows(root: Object3D) {
  root.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
}

function SoccerBallModel({ groupRef }: { groupRef: RefObject<Group | null> }) {
  const { scene } = useGLTF(KNOWME_BALL_PATH);
  const model = useMemo(() => {
    const cloned = scene.clone(true);
    prepareShadows(cloned);
    fitObject(cloned, 0.9);
    return cloned;
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

function StoneProp({
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
  const { scene } = useGLTF(KNOWME_STONES_PATH);
  const stone = useMemo(() => {
    let source: Object3D | null = null;
    scene.traverse((child) => {
      if (child.name === meshName) source = child;
    });
    if (!source) {
      scene.traverse((child) => {
        const mesh = child as Mesh;
        if (!source && mesh.isMesh) source = child;
      });
    }
    if (!source) return null;
    const cloned = (source as Object3D).clone(true);
    prepareShadows(cloned);
    return cloned;
  }, [scene, meshName]);

  if (!stone) return null;
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <primitive object={stone} />
    </group>
  );
}

function GroundMarks({
  nearestId,
}: {
  nearestId: string | null;
}) {
  return (
    <group>
      {knowMeEggs.map((egg) => {
        const active = egg.id === nearestId;
        return (
          <group key={egg.id} position={egg.position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <circleGeometry args={[1.35, 32]} />
              <meshStandardMaterial
                color={active ? "#1e90ff" : "#132238"}
                emissive={active ? "#3aa0ff" : "#0a4a8a"}
                emissiveIntensity={active ? 0.85 : 0.35}
                roughness={0.6}
                metalness={0.2}
              />
            </mesh>
            <Text
              position={[0, 0.04, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.28}
              color={active ? "#ffffff" : "#9ed0ff"}
              anchorX="center"
              anchorY="middle"
              maxWidth={2.4}
              textAlign="center"
              outlineWidth={0.02}
              outlineColor="#001428"
            >
              {egg.label}
            </Text>
            <Text
              position={[0, 0.04, 0.42]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.12}
              color={active ? "#d7ecff" : "#6ea8d8"}
              anchorX="center"
              anchorY="middle"
              maxWidth={2.4}
              textAlign="center"
            >
              {egg.subtitle}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function FollowCamera({ target }: { target: RefObject<Group | null> }) {
  const { camera } = useThree();
  const current = useRef(new Vector3(0, 8, 10));

  useFrame(() => {
    const ball = target.current;
    if (!ball) return;
    const desired = new Vector3(
      ball.position.x,
      ball.position.y + 7.5,
      ball.position.z + 9.5,
    );
    current.current.lerp(desired, 0.08);
    camera.position.copy(current.current);
    camera.lookAt(ball.position.x, ball.position.y + 0.4, ball.position.z);
  });

  return null;
}

interface BallControllerProps {
  ballRef: RefObject<Group | null>;
  paused: boolean;
  onNearestChange: (egg: KnowMeEgg | null) => void;
  onActivate: (egg: KnowMeEgg) => void;
}

function BallController({
  ballRef,
  paused,
  onNearestChange,
  onActivate,
}: BallControllerProps) {
  const keys = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const velocity = useRef(new Vector3());
  const nearestRef = useRef<KnowMeEgg | null>(null);
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
    const ball = ballRef.current;
    if (!ball || pausedRef.current) return;

    const accel = 22;
    const damp = Math.pow(0.86, delta * 60);
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
    if (velocity.current.length() > 9) velocity.current.setLength(9);

    ball.position.x += velocity.current.x * delta;
    ball.position.z += velocity.current.z * delta;

    // Keep on circular navy pitch
    const radial = Math.hypot(ball.position.x, ball.position.z);
    if (radial > MAP_RADIUS - 0.6) {
      const scale = (MAP_RADIUS - 0.6) / radial;
      ball.position.x *= scale;
      ball.position.z *= scale;
      velocity.current.multiplyScalar(0.4);
    }

    // Soft push from stone props
    for (const prop of knowMeStoneProps) {
      const dx = ball.position.x - prop.position[0];
      const dz = ball.position.z - prop.position[2];
      const dist = Math.hypot(dx, dz);
      const minDist = 1.1 + prop.scale * 40;
      if (dist < minDist && dist > 0.001) {
        const push = (minDist - dist) / minDist;
        ball.position.x += (dx / dist) * push * 0.35;
        ball.position.z += (dz / dist) * push * 0.35;
        velocity.current.multiplyScalar(0.7);
      }
    }

    // Roll visual — revolve with movement
    const speed = velocity.current.length();
    if (speed > 0.02) {
      const axis = new Vector3(-velocity.current.z, 0, velocity.current.x).normalize();
      const q = new Quaternion().setFromAxisAngle(
        axis,
        speed * delta * 3.2,
      );
      ball.quaternion.premultiply(q);
    }

    // Nearest easter egg
    let best: KnowMeEgg | null = null;
    let bestDist = EGG_ENTER_RADIUS;
    for (const egg of knowMeEggs) {
      const d = Math.hypot(
        ball.position.x - egg.position[0],
        ball.position.z - egg.position[2],
      );
      if (d < bestDist) {
        bestDist = d;
        best = egg;
      }
    }
    if (best?.id !== nearestRef.current?.id) {
      nearestRef.current = best;
      onNearestChangeRef.current(best);
    }
  });

  return null;
}

function WorldContents({
  paused,
  onNearestChange,
  onActivate,
  nearestId,
}: {
  paused: boolean;
  onNearestChange: (egg: KnowMeEgg | null) => void;
  onActivate: (egg: KnowMeEgg) => void;
  nearestId: string | null;
}) {
  const ballRef = useRef<Group>(null);

  return (
    <>
      <color attach="background" args={["#06101f"]} />
      <fog attach="fog" args={["#06101f", 18, 36]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        castShadow
        position={[8, 14, 6]}
        intensity={1.35}
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight args={["#9ec9ff", "#0a1628", 0.35]} />

      {/* Navy pitch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <circleGeometry args={[MAP_RADIUS, 64]} />
        <meshStandardMaterial
          color="#0b1c3d"
          roughness={0.92}
          metalness={0.08}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[MAP_RADIUS - 0.18, MAP_RADIUS, 64]} />
        <meshStandardMaterial
          color="#1f6feb"
          emissive="#163d7a"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[2.1, 2.25, 48]} />
        <meshStandardMaterial color="#2a5caa" transparent opacity={0.55} />
      </mesh>

      <GroundMarks nearestId={nearestId} />

      {knowMeStoneProps.map((prop, index) => (
        <StoneProp
          key={`${prop.mesh}-${index}`}
          meshName={prop.mesh}
          position={prop.position}
          scale={prop.scale}
          rotationY={prop.rotationY}
        />
      ))}

      <SoccerBallModel groupRef={ballRef} />
      <BallController
        ballRef={ballRef}
        paused={paused}
        onNearestChange={onNearestChange}
        onActivate={onActivate}
      />
      <FollowCamera target={ballRef} />
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.45}
        scale={28}
        blur={2.4}
        far={12}
      />
      <Environment preset="night" />
    </>
  );
}

interface KnowMeWorldSceneProps {
  paused?: boolean;
  onNearestChange: (egg: KnowMeEgg | null) => void;
  onActivate: (egg: KnowMeEgg) => void;
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
      camera={{ position: [0, 8, 10], fov: 42, near: 0.1, far: 80 }}
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

useGLTF.preload(KNOWME_BALL_PATH);
useGLTF.preload(KNOWME_STONES_PATH);
