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
export const knowMeLandmarks: KnowMeLandmark[] = [
  // Positions leave the northern corridor (x ±9, z -13..-7) clear
  // for the 3D name monument — no stones or paths cross it.
  {
    id: "shl",
    label: "SHL Recommender",
    subtitle: "RAG · FAISS · Gemini · 65% Recall@5",
    href:
      projects.find((p) => p.id === "shl-recommender")?.links.github ??
      profile.github,
    position: [-21, 0, -8],
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
    position: [25, 0, 4],
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
    position: [-25, 0, 5],
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
    position: [15, 0, 20],
    rotationY: 0.8,
    seed: 0.62,
  },
  {
    id: "github",
    label: "GitHub",
    subtitle: "All repos · Siddhantbg",
    href: profile.github,
    position: [21, 0, -9],
    rotationY: 1.5,
    seed: 0.8,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    subtitle: "Connect · hire path",
    href: profile.linkedin,
    position: [-13, 0, 21],
    rotationY: 2.8,
    seed: 0.95,
  },
];

export const knowMeWorldMeta = {
  title: "KNOW ME · NIGHT WORLD",
  subtitle: "Walk around · find the glowing stones · press Enter",
  controls: "WASD / Arrows to walk · Enter to open the nearest stone",
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

/** Lamp posts [x, z, rotY] — roughly along the paths */
export const knowMeLamps: Array<[number, number, number]> = [
  [-10.5, -4, 0.8],
  [10.5, -4.5, -2.2],
  [7, 10, 1.6],
  [-6.5, 10.5, 0.4],
  [-12.5, 2.5, 2.1],
  [12.5, 2, -0.6],
  [-17, -6.5, 1.1],
  [17, -7.5, -1.4],
];

export const KNOWME_AVATAR_PATH = "/models/animations/Developer.glb";
export const KNOWME_HAND_FONT = "/fonts/AmaticSC-Bold.ttf";
export const KNOWME_TITLE_FONT = "/fonts/helvetiker_bold.typeface.json";

export const MAP_RADIUS = 34;
export const LANDMARK_ENTER_RADIUS = 3;
