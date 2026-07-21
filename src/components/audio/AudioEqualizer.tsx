"use client";

import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";

interface AudioEqualizerProps {
  active: boolean;
  className?: string;
}

const BAR_HEIGHTS = [0.45, 0.85, 0.6, 1, 0.7];

export function AudioEqualizer({ active, className }: AudioEqualizerProps) {
  return (
    <div
      className={cn("audio-equalizer", className)}
      aria-hidden="true"
    >
      {BAR_HEIGHTS.map((height, index) => (
        <span
          key={index}
          className={cn("audio-equalizer-bar", active && "audio-equalizer-bar-active")}
          style={{ "--bar-scale": height } as CSSProperties}
        />
      ))}
    </div>
  );
}
