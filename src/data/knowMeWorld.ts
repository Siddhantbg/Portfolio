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
  {
    id: "shl",
    label: "SHL Recommender",
    subtitle: "RAG · FAISS · Gemini · 65% Recall@5",
    href:
      projects.find((p) => p.id === "shl-recommender")?.links.github ??
      profile.github,
    position: [-9, 0, -6],
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
    position: [9.5, 0, -5.5],
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
    position: [-10, 0, 6.5],
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
    position: [9, 0, 7],
    stoneMesh: "Stone_4_Low",
    stoneScale: 0.048,
    stoneRotationY: 0.8,
  },
  {
    id: "github",
    label: "GitHub",
    subtitle: "All repos · Siddhantbg",
    href: profile.github,
    position: [0, 0, -11.5],
    stoneMesh: "Stone_5_Low",
    stoneScale: 0.052,
    stoneRotationY: 1.5,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    subtitle: "Connect · hire path",
    href: profile.linkedin,
    position: [0.5, 0, 11.5],
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
  [-14, -12, 1.4, 0],
  [-11.5, -13.5, 1.1, 0.35],
  [13, -12.5, 1.5, 0.6],
  [15, -9, 1.0, 0.2],
  [-15.5, 3, 1.25, 0.5],
  [-13.5, 12, 1.45, 0.15],
  [14.5, 11, 1.2, 0.4],
  [12, 14, 1.55, 0.7],
  [3.5, -15, 1.3, 0.25],
  [-4, 15.5, 1.15, 0.55],
  [-6.5, -15, 1.05, 0.8],
  [7, 15, 1.35, 0.1],
];

/** Decorative small rocks [x, z, scale, rotY, meshName] */
export const knowMeDecorStones: Array<{
  position: [number, number, number];
  scale: number;
  rotationY: number;
  mesh: string;
}> = [
  { position: [-4.5, 0, -3], scale: 0.014, rotationY: 0.9, mesh: "Stone_2_Low.001" },
  { position: [5, 0, 2.5], scale: 0.016, rotationY: 2.2, mesh: "Stone_3_Low.001" },
  { position: [-2, 0, 6], scale: 0.012, rotationY: 1.1, mesh: "Stone_4_Low.001" },
  { position: [3, 0, -7], scale: 0.015, rotationY: 0.3, mesh: "Stone_5_Low.001" },
  { position: [-7.5, 0, 0.5], scale: 0.013, rotationY: 2.9, mesh: "Stone_1_Low.002" },
  { position: [7.5, 0, -1.5], scale: 0.014, rotationY: 1.8, mesh: "Stone_2_Low.002" },
];

/** Lamp posts [x, z, rotY] */
export const knowMeLamps: Array<[number, number, number]> = [
  [-3.2, -2.2, 0.8],
  [4, 4.2, -2.2],
  [-6, 8.5, 1.6],
  [6.5, -8.5, 0.4],
];

export const KNOWME_AVATAR_PATH = "/models/animations/Developer.glb";
export const KNOWME_STONES_PATH = "/models/knowme/stones.glb";
export const KNOWME_HAND_FONT = "/fonts/AmaticSC-Bold.ttf";
export const KNOWME_TITLE_FONT = "/fonts/helvetiker_bold.typeface.json";

export const MAP_RADIUS = 17;
export const LANDMARK_ENTER_RADIUS = 2.6;
