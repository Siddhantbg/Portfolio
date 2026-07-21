import { profile, projects } from "@/data/portfolio";

export interface KnowMeLandmark {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  position: [number, number, number];
  /** Mesh name inside stones.glb used as the landmark rock */
  stoneMesh: string;
  stoneScale: number;
  stoneRotationY: number;
}

/**
 * Resume landmarks — glowing stones scattered around the night world.
 * Walk near one and press Enter to open it.
 */
export const knowMeLandmarks: KnowMeLandmark[] = [
  // Positions leave the northern corridor (x ±8, z -12..-7) clear
  // for the 3D name monument — no stones or paths cross it.
  {
    id: "shl",
    label: "SHL Recommender",
    subtitle: "RAG · FAISS · Gemini · 65% Recall@5",
    href:
      projects.find((p) => p.id === "shl-recommender")?.links.github ??
      profile.github,
    position: [-16, 0, -6],
    stoneMesh: "Stone_1_Low",
    stoneScale: 0.045,
    stoneRotationY: 0.4,
  },
  {
    id: "code-review",
    label: "AI Code Review",
    subtitle: "Local DeepSeek · FastAPI · Docker",
    href:
      projects.find((p) => p.id === "ai-code-review")?.links.github ??
      profile.github,
    position: [19, 0, 3],
    stoneMesh: "Stone_2_Low",
    stoneScale: 0.05,
    stoneRotationY: 1.2,
  },
  {
    id: "medical",
    label: "Medical AI",
    subtitle: "Thermal imaging · CNN segmentation",
    href:
      projects.find((p) => p.id === "medical-ai")?.links.github ??
      profile.github,
    position: [-19, 0, 4],
    stoneMesh: "Stone_3_Low",
    stoneScale: 0.042,
    stoneRotationY: 2.1,
  },
  {
    id: "quant",
    label: "CNN Quantization",
    subtitle: "4× smaller models · edge ML",
    href:
      projects.find((p) => p.id === "cnn-quantization")?.links.github ??
      profile.github,
    position: [11, 0, 15],
    stoneMesh: "Stone_4_Low",
    stoneScale: 0.048,
    stoneRotationY: 0.8,
  },
  {
    id: "github",
    label: "GitHub",
    subtitle: "All repos · Siddhantbg",
    href: profile.github,
    position: [16, 0, -7],
    stoneMesh: "Stone_5_Low",
    stoneScale: 0.052,
    stoneRotationY: 1.5,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    subtitle: "Connect · hire path",
    href: profile.linkedin,
    position: [-10, 0, 16],
    stoneMesh: "Stone_1_Low.001",
    stoneScale: 0.05,
    stoneRotationY: 2.8,
  },
];

export const knowMeWorldMeta = {
  title: "KNOW ME · NIGHT WORLD",
  subtitle: "Walk around · find the glowing stones · press Enter",
  controls: "WASD / Arrows to walk · Enter to open the nearest stone",
};

/** Decorative low-poly trees [x, z, scale, hueShift] */
export const knowMeTrees: Array<[number, number, number, number]> = [
  [-14, -13, 1.4, 0],
  [-20, -2, 1.1, 0.35],
  [-22, 8, 1.5, 0.6],
  [-8, -20, 1.0, 0.2],
  [-16, 14, 1.25, 0.5],
  [-6, 20, 1.45, 0.15],
  [4, 22, 1.2, 0.4],
  [14, 18, 1.55, 0.7],
  [21, 12, 1.3, 0.25],
  [23, 2, 1.15, 0.55],
  [20, -10, 1.05, 0.8],
  [10, -20, 1.35, 0.1],
  [3, -16, 1.2, 0.45],
  [-3, -22, 1.4, 0.3],
  [-24, -6, 1.1, 0.65],
  [24, 7, 1.25, 0.05],
  [-12, 22, 1.35, 0.75],
  [8, -23, 1.15, 0.5],
];

/** Decorative small rocks [x, z, scale, rotY, meshName] */
export const knowMeDecorStones: Array<{
  position: [number, number, number];
  scale: number;
  rotationY: number;
  mesh: string;
}> = [
  { position: [-6, 0, -4], scale: 0.014, rotationY: 0.9, mesh: "Stone_2_Low.001" },
  { position: [7, 0, 3], scale: 0.016, rotationY: 2.2, mesh: "Stone_3_Low.001" },
  { position: [-3, 0, 8], scale: 0.012, rotationY: 1.1, mesh: "Stone_4_Low.001" },
  { position: [11, 0, -11], scale: 0.015, rotationY: 0.3, mesh: "Stone_5_Low.001" },
  { position: [-9, 0, 1], scale: 0.013, rotationY: 2.9, mesh: "Stone_1_Low.002" },
  { position: [9, 0, -2], scale: 0.014, rotationY: 1.8, mesh: "Stone_2_Low.002" },
  { position: [-13, 0, 10], scale: 0.015, rotationY: 0.6, mesh: "Stone_3_Low.002" },
  { position: [2, 0, 13], scale: 0.012, rotationY: 2.4, mesh: "Stone_4_Low.002" },
];

/** Lamp posts [x, z, rotY] — roughly along the paths */
export const knowMeLamps: Array<[number, number, number]> = [
  [-8, -3, 0.8],
  [8, -3.5, -2.2],
  [5.5, 7.5, 1.6],
  [-5, 8, 0.4],
  [-9.5, 2, 2.1],
  [9.5, 1.5, -0.6],
];

export const KNOWME_AVATAR_PATH = "/models/animations/Developer.glb";
export const KNOWME_STONES_PATH = "/models/knowme/stones.glb";
export const KNOWME_HAND_FONT = "/fonts/AmaticSC-Bold.ttf";
export const KNOWME_TITLE_FONT = "/fonts/helvetiker_bold.typeface.json";

export const MAP_RADIUS = 26;
export const LANDMARK_ENTER_RADIUS = 2.8;
