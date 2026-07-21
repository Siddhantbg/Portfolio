"use client";

import { careerProfile, CAREER_MODEL_PATH } from "@/data/portfolio";
import { CareerModelViewer } from "@/components/career/CareerModelViewer";

interface CareerModelPanelProps {
  modelPath?: string;
}

export function CareerModelPanel({
  modelPath = CAREER_MODEL_PATH,
}: CareerModelPanelProps) {
  return (
    <div className="career-player-model">
      <div className="career-player-model-bg" aria-hidden />
      <div className="career-player-emblem" aria-hidden>
        <span>VIT</span>
      </div>
      <CareerModelViewer modelPath={modelPath} />
      <div className="career-player-badge" aria-hidden>
        <span className="career-jersey-number">{careerProfile.badgeNumber}</span>
        <span className="career-role-abbr">{careerProfile.roleAbbr}</span>
        <span className="career-badge-bar" />
      </div>
    </div>
  );
}
