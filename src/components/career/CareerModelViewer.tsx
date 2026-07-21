"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CAREER_MODEL_PATH } from "@/data/portfolio";

const CareerModelScene = dynamic(() => import("./CareerModelScene"), {
  ssr: false,
  loading: () => (
    <div className="career-model-placeholder">
      <div className="career-model-silhouette career-model-silhouette-pulse" aria-hidden />
      <p className="career-model-placeholder-title">Loading model…</p>
    </div>
  ),
});

interface CareerModelViewerProps {
  modelPath?: string;
}

export function CareerModelViewer({
  modelPath = CAREER_MODEL_PATH,
}: CareerModelViewerProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="career-model-viewer"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{ cursor: "pointer" }}
    >
      <CareerModelScene modelPath={modelPath} hovered={hovered} />
    </div>
  );
}
