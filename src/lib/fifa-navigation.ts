import type { TabId } from "@/data/portfolio";
import { projects, skillCategories } from "@/data/portfolio";
import { playUiSelectSound } from "@/lib/sfx";

export type FocusZone = "tabs" | "tiles";
export type NavDirection = "up" | "down" | "left" | "right";

export const TILE_COUNTS: Record<TabId, number> = {
  home: 5,
  career: 4,
  projects: projects.length,
  attributes: 1 + skillCategories.length + 2,
};

/** Home: Kick Off | Know Me | News / Skills | Education */
const HOME_NEIGHBORS: Record<
  number,
  Partial<Record<NavDirection, number>>
> = {
  0: { right: 1 },
  1: { left: 0, right: 2, down: 3 },
  2: { left: 1, down: 3 },
  3: { up: 2, left: 1, right: 4 },
  4: { up: 2, left: 3 },
};

function moveInGrid(
  index: number,
  count: number,
  cols: number,
  direction: NavDirection,
): number | null {
  const row = Math.floor(index / cols);
  const col = index % cols;

  switch (direction) {
    case "left":
      return col > 0 ? index - 1 : null;
    case "right":
      return col < cols - 1 && index + 1 < count ? index + 1 : null;
    case "up":
      return row > 0 ? index - cols : null;
    case "down":
      return index + cols < count ? index + cols : null;
    default:
      return null;
  }
}

export function getNextTileIndex(
  tab: TabId,
  current: number,
  direction: NavDirection,
): number | null {
  const count = TILE_COUNTS[tab];

  if (tab === "home") {
    return HOME_NEIGHBORS[current]?.[direction] ?? null;
  }

  if (tab === "career") {
    const CAREER_NEIGHBORS: Record<
      number,
      Partial<Record<NavDirection, number>>
    > = {
      0: { down: 1, right: 3 },
      1: { up: 0, right: 2 },
      2: { up: 0, left: 1, right: 3 },
      3: { left: 2 },
    };
    return CAREER_NEIGHBORS[current]?.[direction] ?? null;
  }

  if (tab === "attributes") {
    if (current === 0) {
      if (direction === "right") return 1;
      if (direction === "down") return 5;
      return null;
    }
    if (current >= 1 && current <= 4) {
      const statNeighbors: Record<
        number,
        Partial<Record<NavDirection, number>>
      > = {
        1: { left: 0, right: 2, down: 3 },
        2: { left: 1, down: 4 },
        3: { up: 1, right: 4, left: 0, down: 5 },
        4: { up: 2, left: 3, down: 5 },
      };
      return statNeighbors[current]?.[direction] ?? null;
    }
    if (current === 5) {
      if (direction === "up") return 3;
      if (direction === "down") return 6;
      return null;
    }
    if (current === 6) {
      if (direction === "up") return 5;
      return null;
    }
    return null;
  }

  return moveInGrid(current, count, 2, direction);
}

export function activateFocusedTile(tileIndex: number) {
  const tile = document.querySelector<HTMLElement>(
    `[data-fifa-tile-index="${tileIndex}"]`,
  );
  if (!tile) return;

  playUiSelectSound();

  const interactive = tile.querySelector<HTMLElement>(
    "button, a[href], [role='button']",
  );
  if (interactive) {
    interactive.click();
    return;
  }

  tile.click();
}
