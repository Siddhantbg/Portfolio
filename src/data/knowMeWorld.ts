import { profile, projects } from "@/data/portfolio";

export interface KnowMeLandmark {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  position: [number, number, number];
  /** Y rotation of the procedural rock monument */
  rotationY: number;
  /** 0..1 — varies the rock silhouette and tint per landmark */
  seed: number;
}

/**
 * Resume landmarks — glowing standing stones scattered around the night world.
 * Walk near one and press Enter to open it.
 */
/**
 * Landmark positions are relative to the village plaza (world origin after
 * MapModel auto-aligns). Spread across the streets of the larger village.
 */
export const knowMeLandmarks: KnowMeLandmark[] = [
  {
    id: "shl",
    label: "SHL Recommender",
    subtitle: "RAG · FAISS · Gemini · 65% Recall@5",
    href:
      projects.find((p) => p.id === "shl-recommender")?.links.github ??
      profile.github,
    position: [-22, 0, -14],
    rotationY: 0.4,
    seed: 0.1,
  },
  {
    id: "code-review",
    label: "AI Code Review",
    subtitle: "Local DeepSeek · FastAPI · Docker",
    href:
      projects.find((p) => p.id === "ai-code-review")?.links.github ??
      profile.github,
    position: [28, 0, 12],
    rotationY: 1.2,
    seed: 0.28,
  },
  {
    id: "medical",
    label: "Medical AI",
    subtitle: "Thermal imaging · CNN segmentation",
    href:
      projects.find((p) => p.id === "medical-ai")?.links.github ??
      profile.github,
    position: [-30, 0, 10],
    rotationY: 2.1,
    seed: 0.45,
  },
  {
    id: "quant",
    label: "CNN Quantization",
    subtitle: "4× smaller models · edge ML",
    href:
      projects.find((p) => p.id === "cnn-quantization")?.links.github ??
      profile.github,
    position: [12, 0, 32],
    rotationY: 0.8,
    seed: 0.62,
  },
  {
    id: "github",
    label: "GitHub",
    subtitle: "All repos · Siddhantbg",
    href: profile.github,
    position: [18, 0, -28],
    rotationY: 1.5,
    seed: 0.8,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    subtitle: "Connect · hire path",
    href: profile.linkedin,
    position: [-14, 0, 26],
    rotationY: 2.8,
    seed: 0.95,
  },
];

export const knowMeWorldMeta = {
  title: "KNOW ME · NIGHT WORLD",
  subtitle: "Walk around · find the glowing stones · press Enter",
  controls: "WASD to walk · drag mouse to look · Enter to open a stone",
};

/** Decorative low-poly trees [x, z, scale, hueShift] */
export const knowMeTrees: Array<[number, number, number, number]> = [
  [-18, -17, 1.4, 0],
  [-26, -3, 1.1, 0.35],
  [-29, 10, 1.5, 0.6],
  [-10, -26, 1.0, 0.2],
  [-21, 18, 1.25, 0.5],
  [-8, 26, 1.45, 0.15],
  [5, 29, 1.2, 0.4],
  [18, 24, 1.55, 0.7],
  [27, 16, 1.3, 0.25],
  [30, 3, 1.15, 0.55],
  [26, -13, 1.05, 0.8],
  [13, -26, 1.35, 0.1],
  [4, -21, 1.2, 0.45],
  [-4, -29, 1.4, 0.3],
  [-31, -8, 1.1, 0.65],
  [31, 9, 1.25, 0.05],
  [-16, 28, 1.35, 0.75],
  [10, -30, 1.15, 0.5],
  [-27, -14, 1.3, 0.4],
  [22, -20, 1.2, 0.6],
  [-2, 32, 1.45, 0.2],
  [28, 22, 1.1, 0.85],
  [-32, 2, 1.3, 0.3],
  [16, 30, 1.25, 0.55],
];

/** Decorative small rocks [x, z, scale, rotY, seed] */
export const knowMeDecorStones: Array<{
  position: [number, number, number];
  scale: number;
  rotationY: number;
  seed: number;
}> = [
  { position: [-7, 0, -5], scale: 1.0, rotationY: 0.9, seed: 0.05 },
  { position: [9, 0, 4], scale: 1.2, rotationY: 2.2, seed: 0.18 },
  { position: [-4, 0, 10], scale: 0.85, rotationY: 1.1, seed: 0.31 },
  { position: [14, 0, -14], scale: 1.1, rotationY: 0.3, seed: 0.44 },
  { position: [-12, 0, 1], scale: 0.9, rotationY: 2.9, seed: 0.57 },
  { position: [12, 0, -3], scale: 1.05, rotationY: 1.8, seed: 0.66 },
  { position: [-17, 0, 13], scale: 1.15, rotationY: 0.6, seed: 0.74 },
  { position: [3, 0, 17], scale: 0.8, rotationY: 2.4, seed: 0.83 },
  { position: [-20, 0, -14], scale: 1.0, rotationY: 1.4, seed: 0.9 },
  { position: [19, 0, 12], scale: 0.95, rotationY: 0.2, seed: 0.97 },
];

/** Lamp posts [x, z, rotY] — around the village plaza */
export const knowMeLamps: Array<[number, number, number]> = [
  [-8, -6, 0.8],
  [8, -6, -2.2],
  [10, 8, 1.6],
  [-10, 8, 0.4],
  [0, 14, 2.1],
  [16, 2, -0.6],
  [-16, 0, 1.1],
  [4, -16, -1.4],
];

export const KNOWME_AVATAR_PATH = "/models/animations/Developer.glb";
export const KNOWME_MAP_PATH = "/models/knowme/map.glb";
export const KNOWME_WALK_FBX = "/models/animations/walking.fbx";
export const KNOWME_RUN_FBX = "/models/animations/running.fbx";
export const KNOWME_HAND_FONT = "/fonts/AmaticSC-Bold.ttf";
export const KNOWME_TITLE_FONT = "/fonts/helvetiker_bold.typeface.json";

/** CC-BY-4.0 attribution required by the map model's license */
export const KNOWME_MAP_CREDIT =
  'Map: "Kakariko Village (Ocarina of Time)" by XanderPriest281 · CC-BY-4.0';

/** Keep the player inside the village bowl. */
export const MAP_RADIUS = 130;
export const LANDMARK_ENTER_RADIUS = 4.2;
