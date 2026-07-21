"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type GridVariant = "home" | "career" | "projects" | "attributes";

interface TileGridProps {
  variant: GridVariant;
  children: ReactNode;
  className?: string;
}

const gridClasses: Record<GridVariant, string> = {
  home: "tile-grid-home",
  career: "tile-grid-career",
  projects: "tile-grid-projects",
  attributes: "tile-grid-attributes",
};

export function TileGrid({ variant, children, className }: TileGridProps) {
  return (
    <div className="tile-board flex min-h-0 flex-1 flex-col">
      <div
        className={cn(
          "fifa-tile-grid h-full min-h-0",
          gridClasses[variant],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
