"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  useAnimations,
  useFBX,
  useGLTF,
} from "@react-three/drei";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  LoopOnce,
  LoopRepeat,
  MeshStandardMaterial,
  SRGBColorSpace,
  type AnimationAction,
  type Group,
  type Mesh,
  type Object3D,
} from "three";
import type { AnimationClip } from "three";
import {
  CAREER_MODEL_PATH,
  careerModelAnimations,
} from "@/data/portfolio";
import { buildSafeClips } from "@/lib/safe-model-clips";

interface CareerModelSceneProps {
  modelPath?: string;
  hovered?: boolean;
}

const HOVER_ANIMATIONS = ["clapping", "salute", "victory"] as const;

function prepareModel(scene: Object3D) {
  scene.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;

    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    for (const mat of materials) {
      if (!mat) continue;

      if (mat instanceof MeshStandardMaterial) {
        if (mat.map) mat.map.colorSpace = SRGBColorSpace;
        if (mesh.name.toLowerCase().includes("eye")) {
          mat.emissive.set(0x000000);
          mat.emissiveIntensity = 0;
          mat.metalness = 0;
          mat.roughness = 1;
        }
        mat.needsUpdate = true;
      }
    }
  });
}

function cloneModel(scene: Object3D) {
  try {
    return cloneSkinned(scene) as Object3D;
  } catch {
    return scene.clone(true);
  }
}

function renameClips(clips: AnimationClip[], label: string) {
  return clips.map((clip, index) => {
    const next = clip.clone();
    next.name = clips.length === 1 ? label : `${label}_${index}`;
    return next;
  });
}

function pickAction(
  actions: Record<string, AnimationAction | null>,
  name: string,
) {
  return (
    actions[name] ??
    actions[`${name}_0`] ??
    Object.entries(actions).find(([key]) => key.startsWith(`${name}_`))?.[1] ??
    null
  );
}

function DeveloperAvatar({
  modelPath,
  hovered,
}: {
  modelPath: string;
  hovered: boolean;
}) {
  const modelRef = useRef<Group>(null);
  const hoveredRef = useRef(hovered);
  const playingRef = useRef(false);
  const hoverIndexRef = useRef(0);
  const finishedHandlerRef = useRef<((event: { action: AnimationAction }) => void) | null>(null);

  const { scene: glbScene } = useGLTF(modelPath);
  const idleFbx = useFBX(careerModelAnimations.idle);
  const clappingFbx = useFBX(careerModelAnimations.clapping);
  const saluteFbx = useFBX(careerModelAnimations.salute);
  const victoryFbx = useFBX(careerModelAnimations.victory);

  const glbModel = useMemo(() => {
    const cloned = cloneModel(glbScene);
    prepareModel(cloned);
    return cloned;
  }, [glbScene]);

  const fbxModel = useMemo(() => {
    const cloned = cloneModel(idleFbx);
    prepareModel(cloned);
    return cloned;
  }, [idleFbx]);

  const namedSources = useMemo(
    () => [
      { label: "idle", animations: renameClips(idleFbx.animations, "idle") },
      {
        label: "clapping",
        animations: renameClips(clappingFbx.animations, "clapping"),
      },
      {
        label: "salute",
        animations: renameClips(saluteFbx.animations, "salute"),
      },
      {
        label: "victory",
        animations: renameClips(victoryFbx.animations, "victory"),
      },
    ],
    [idleFbx, clappingFbx, saluteFbx, victoryFbx],
  );

  const glbClips = useMemo(
    () =>
      buildSafeClips(
        glbModel,
        namedSources.map(({ label, animations }) => ({ label, animations })),
      ),
    [glbModel, namedSources],
  );

  const useFbxFallback = glbClips.length === 0;
  const activeClips = useMemo(() => {
    if (!useFbxFallback) return glbClips;
    return namedSources.flatMap((source) => source.animations);
  }, [useFbxFallback, glbClips, namedSources]);

  const activeModel = useFbxFallback ? fbxModel : glbModel;
  const { actions, mixer } = useAnimations(activeClips, modelRef);

  const stopHoverListener = useCallback(() => {
    if (finishedHandlerRef.current) {
      mixer.removeEventListener("finished", finishedHandlerRef.current);
      finishedHandlerRef.current = null;
    }
  }, [mixer]);

  const playIdle = useCallback(() => {
    stopHoverListener();
    playingRef.current = false;

    const idleAction = pickAction(actions, "idle");
    if (!idleAction) return;

    Object.values(actions).forEach((action) => {
      if (action && action !== idleAction) action.fadeOut(0.2);
    });

    idleAction.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.25).play();
  }, [actions, stopHoverListener]);

  const playNextHover = useCallback(() => {
    const available = HOVER_ANIMATIONS.filter((name) =>
      Boolean(pickAction(actions, name)),
    );

    if (available.length === 0) return;

    // Round-robin so every hover cycle shows a different clip.
    const name = available[hoverIndexRef.current % available.length];
    hoverIndexRef.current = (hoverIndexRef.current + 1) % available.length;

    const next = pickAction(actions, name);
    if (!next) return;

    stopHoverListener();
    playingRef.current = true;

    Object.values(actions).forEach((action) => {
      if (action && action !== next) action.fadeOut(0.15);
    });

    next.reset();
    next.setLoop(LoopOnce, 1);
    next.clampWhenFinished = true;
    next.enabled = true;
    next.setEffectiveWeight(1);
    next.fadeIn(0.15).play();

    const onFinished = (event: { action: AnimationAction }) => {
      if (event.action !== next) return;
      stopHoverListener();
      playingRef.current = false;

      if (hoveredRef.current) {
        playNextHover();
      } else {
        playIdle();
      }
    };

    finishedHandlerRef.current = onFinished;
    mixer.addEventListener("finished", onFinished);
  }, [actions, mixer, playIdle, stopHoverListener]);

  // Keep idle running when actions are ready.
  useEffect(() => {
    playIdle();
    return () => {
      stopHoverListener();
      mixer.stopAllAction();
    };
  }, [mixer, playIdle, stopHoverListener]);

  // React to DOM hover from the viewer wrapper (stable — not mesh-based).
  useEffect(() => {
    hoveredRef.current = hovered;

    if (hovered) {
      if (!playingRef.current) playNextHover();
    } else if (!playingRef.current) {
      playIdle();
    }
  }, [hovered, playIdle, playNextHover]);

  return (
    <group rotation={[0, 0.12, 0]} position={[0, -1.05, 0]} scale={0.88}>
      <primitive ref={modelRef} object={activeModel} />
    </group>
  );
}

useGLTF.preload(CAREER_MODEL_PATH);
useFBX.preload(careerModelAnimations.idle);
useFBX.preload(careerModelAnimations.clapping);
useFBX.preload(careerModelAnimations.salute);
useFBX.preload(careerModelAnimations.victory);

export default function CareerModelScene({
  modelPath = CAREER_MODEL_PATH,
  hovered = false,
}: CareerModelSceneProps) {
  return (
    <Canvas
      className="career-model-canvas"
      camera={{ position: [0, 0.95, 4.75], fov: 30, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1} />
      <directionalLight position={[-4, 2, -2]} intensity={0.35} />
      <Suspense fallback={null}>
        <DeveloperAvatar modelPath={modelPath} hovered={hovered} />
        <ContactShadows
          position={[0, -0.02, 0]}
          opacity={0.25}
          scale={6}
          blur={2.5}
        />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        makeDefault
      />
    </Canvas>
  );
}
