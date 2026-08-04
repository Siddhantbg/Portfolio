/**
 * KNOW ME · Cyber City — data for the 3D explorer.
 *
 * The player flies a floating "Iron Cameraman" over a neon cyber city while
 * NPC cars loop the streets on fixed parametric paths.
 */

/* ── Model paths (public/models/knowme) ───────────────────── */
export const KNOWME_MAP_PATH = "/models/knowme/cybercity.glb";
export const KNOWME_MC_PATH = "/models/knowme/ironman.glb";
export const KNOWME_CAR_KOENIGSEGG_PATH = "/models/knowme/car-koenigsegg.glb";
export const KNOWME_CAR_SONATA_PATH = "/models/knowme/car-sonata.glb";

/* ── World tuning ──────────────────────────────────────────── */
/** The city model is normalized so its longest side spans this many units. */
export const CITY_SIZE = 420;
/** Keep the player inside the city. */
export const CITY_BOUNDS_RADIUS = CITY_SIZE * 0.48;
/** Flight altitude limits. */
export const FLY_MIN_Y = 6;
export const FLY_MAX_Y = 90;
/** Player start position/altitude. */
export const MC_START: [number, number, number] = [0, 26, 40];

export const knowMeWorldMeta = {
  title: "KNOW ME · CYBER CITY",
  subtitle: "Fly the neon city as the Iron Cameraman",
  controls: "WASD / arrows to fly · Space up · Shift down · Esc to exit",
};

/* ── NPC car fleet ─────────────────────────────────────────── */
export type KnowMeCarModel = "koenigsegg" | "sonata";

export interface KnowMeCarConfig {
  id: string;
  model: KnowMeCarModel;
  /** Body tint applied to paint materials */
  tint: string;
  /** Ellipse radii of the loop the car drives (world units) */
  radiusX: number;
  radiusZ: number;
  /** Loop center offset */
  center: [number, number];
  /** Units per second along the loop */
  speed: number;
  /** Starting angle (radians) */
  phase: number;
  /** +1 = counter-clockwise, -1 = clockwise */
  direction: 1 | -1;
}

const BLACK = "#0b0d12";
const WHITE = "#e9edf4";

/**
 * Fixed algorithmic traffic: each car follows an elliptical loop around the
 * city blocks at its own radius, speed, phase and direction.
 * 2 black cars + 5 white cars.
 */
export const knowMeCars: KnowMeCarConfig[] = [
  // ── black patrol cars (Koenigsegg) ──
  {
    id: "black-1",
    model: "koenigsegg",
    tint: BLACK,
    radiusX: 62,
    radiusZ: 58,
    center: [0, 0],
    speed: 26,
    phase: 0.3,
    direction: 1,
  },
  {
    id: "black-2",
    model: "koenigsegg",
    tint: BLACK,
    radiusX: 96,
    radiusZ: 88,
    center: [8, -6],
    speed: 30,
    phase: 3.6,
    direction: -1,
  },
  // ── white city cars (Sonata) ──
  {
    id: "white-1",
    model: "sonata",
    tint: WHITE,
    radiusX: 74,
    radiusZ: 70,
    center: [-6, 4],
    speed: 18,
    phase: 1.2,
    direction: -1,
  },
  {
    id: "white-2",
    model: "sonata",
    tint: WHITE,
    radiusX: 112,
    radiusZ: 102,
    center: [0, 8],
    speed: 22,
    phase: 5.1,
    direction: 1,
  },
  {
    id: "white-3",
    model: "sonata",
    tint: WHITE,
    radiusX: 132,
    radiusZ: 120,
    center: [-10, -8],
    speed: 20,
    phase: 2.4,
    direction: -1,
  },
  {
    id: "white-4",
    model: "sonata",
    tint: WHITE,
    radiusX: 88,
    radiusZ: 82,
    center: [12, 10],
    speed: 16,
    phase: 4.2,
    direction: 1,
  },
  {
    id: "white-5",
    model: "sonata",
    tint: WHITE,
    radiusX: 148,
    radiusZ: 136,
    center: [0, 0],
    speed: 24,
    phase: 0.9,
    direction: 1,
  },
];

/* ── Attribution (CC-BY licenses) ──────────────────────────── */
export const KNOWME_CREDITS = [
  '"CyberCity_2099_V2" by Animateria · CC-BY-4.0',
  '"Iron Cameraman" by Void · CC-BY-4.0',
  '"2014 Koenigsegg One:1 - Patrol" by Ddiaz Design · CC-BY-NC-SA-4.0',
  '"sonata" by Ch0kitu · CC-BY-4.0',
];

export const KNOWME_MAP_CREDIT = KNOWME_CREDITS.join("  ·  ");
