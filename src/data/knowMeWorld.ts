import { profile, projects } from "@/data/portfolio";

export interface KnowMeEgg {
  id: string;
  label: string;
  subtitle: string;
  href: string;
  position: [number, number, number];
}

/** Resume easter eggs painted on the navy ground — Enter while nearby to open. */
export const knowMeEggs: KnowMeEgg[] = [
  {
    id: "shl",
    label: "SHL RECOMMENDER",
    subtitle: "RAG · FAISS · Gemini · 65% Recall@5",
    href:
      projects.find((p) => p.id === "shl-recommender")?.links.github ??
      profile.github,
    position: [-6.5, 0.02, -3.5],
  },
  {
    id: "code-review",
    label: "AI CODE REVIEW",
    subtitle: "Local DeepSeek · FastAPI · Docker",
    href:
      projects.find((p) => p.id === "ai-code-review")?.links.github ??
      profile.github,
    position: [6.2, 0.02, -4.2],
  },
  {
    id: "medical",
    label: "MEDICAL AI",
    subtitle: "Thermal imaging · CNN segmentation",
    href:
      projects.find((p) => p.id === "medical-ai")?.links.github ??
      profile.github,
    position: [-5.8, 0.02, 5.5],
  },
  {
    id: "quant",
    label: "CNN QUANTIZATION",
    subtitle: "4× smaller models · edge ML",
    href:
      projects.find((p) => p.id === "cnn-quantization")?.links.github ??
      profile.github,
    position: [5.5, 0.02, 5.2],
  },
  {
    id: "github",
    label: "GITHUB",
    subtitle: "All repos · Siddhantbg",
    href: profile.github,
    position: [0, 0.02, -7.2],
  },
  {
    id: "linkedin",
    label: "LINKEDIN",
    subtitle: "Connect · hire path",
    href: profile.linkedin,
    position: [0, 0.02, 7.2],
  },
];

export const knowMeWorldMeta = {
  title: "KNOW ME · FIELD",
  subtitle: "Roll the ball · find resume marks · press Enter",
  controls: "WASD / Arrows to roll · Enter to open nearest mark",
};

export const KNOWME_BALL_PATH = "/models/knowme/soccer-ball.glb";
export const KNOWME_STONES_PATH = "/models/knowme/stones.glb";

/** Decorative stone placements [x, y, z, scale, rotationY, meshName] */
export const knowMeStoneProps: Array<{
  position: [number, number, number];
  scale: number;
  rotationY: number;
  mesh: string;
}> = [
  { position: [-9, 0, -1], scale: 0.035, rotationY: 0.4, mesh: "Stone_1_Low" },
  { position: [9.2, 0, -2], scale: 0.04, rotationY: 1.2, mesh: "Stone_2_Low" },
  { position: [-8.5, 0, 4], scale: 0.03, rotationY: 2.1, mesh: "Stone_3_Low" },
  { position: [8.8, 0, 3.5], scale: 0.038, rotationY: 0.8, mesh: "Stone_4_Low" },
  { position: [-3, 0, -9], scale: 0.028, rotationY: 1.5, mesh: "Stone_5_Low" },
  { position: [3.5, 0, -8.8], scale: 0.032, rotationY: 0.2, mesh: "Stone_1_Low.001" },
  { position: [-2.5, 0, 9], scale: 0.03, rotationY: 2.8, mesh: "Stone_2_Low.001" },
  { position: [4, 0, 8.5], scale: 0.034, rotationY: 1.7, mesh: "Stone_3_Low.001" },
  { position: [-10, 0, -6], scale: 0.045, rotationY: 0.9, mesh: "Stone_4_Low.002" },
  { position: [10, 0, 6], scale: 0.042, rotationY: 2.4, mesh: "Stone_5_Low.002" },
];

export const MAP_RADIUS = 12;
export const EGG_ENTER_RADIUS = 1.85;
