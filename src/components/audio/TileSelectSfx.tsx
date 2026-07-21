"use client";

import { useEffect } from "react";
import { playUiSelectSound } from "@/lib/sfx";

/**
 * Capture-phase listeners so tile hover/click SFX can't be swallowed.
 * Hover between different tile boxes plays the select sound.
 * Clicks also play (debounced in playUiSelectSound).
 */
export function TileSelectSfx() {
  useEffect(() => {
    let lastHoveredIndex: string | null = null;

    const getTileIndex = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      if (target.closest(".nav-bar, .nav-tab, header")) return null;
      const tile = target.closest("[data-fifa-tile-index]");
      if (!tile) return null;
      return tile.getAttribute("data-fifa-tile-index");
    };

    const onPointerOver = (event: PointerEvent) => {
      const index = getTileIndex(event.target);
      if (index === null) return;
      if (index === lastHoveredIndex) return;
      lastHoveredIndex = index;
      playUiSelectSound();
    };

    const onPointerOut = (event: PointerEvent) => {
      const related = event.relatedTarget;
      const nextIndex =
        related instanceof Element
          ? related.closest("[data-fifa-tile-index]")?.getAttribute(
              "data-fifa-tile-index",
            )
          : null;
      if (nextIndex === null || nextIndex === undefined) {
        lastHoveredIndex = null;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const index = getTileIndex(event.target);
      if (index === null) return;
      playUiSelectSound();
    };

    document.addEventListener("pointerover", onPointerOver, true);
    document.addEventListener("pointerout", onPointerOut, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerover", onPointerOver, true);
      document.removeEventListener("pointerout", onPointerOut, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  return null;
}
