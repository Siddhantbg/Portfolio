"use client";

import { careerProfile, profile, roleBreakdown } from "@/data/portfolio";
import { RoleDonutChart } from "@/components/career/RoleDonutChart";
import { cn } from "@/lib/cn";

function formatPlayerName(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

interface CareerProfileInfoProps {
  navIndex?: number;
  focused?: boolean;
}

export function CareerProfileInfo({
  navIndex = 3,
  focused = false,
}: CareerProfileInfoProps) {
  return (
    <div
      data-fifa-tile-index={navIndex}
      className={cn(
        "career-player-content",
        focused && "fifa-tile-keyboard-focused",
      )}
    >
      <h3 className="career-player-name">{formatPlayerName(profile.name)}</h3>

      <div className="career-player-rating-row">
        <div className="career-ovr-block">
          <span className="career-ovr-big">{careerProfile.overallRating}</span>
          <span className="career-ovr-tag">OVR</span>
        </div>

        <div className="career-player-vitals-grid">
          <div className="career-player-vital">
            <span className="career-player-vital-label">Location</span>
            <span className="career-player-vital-value">
              {careerProfile.location}
            </span>
          </div>
          <div className="career-player-vital">
            <span className="career-player-vital-label">Degree</span>
            <span className="career-player-vital-value">B.Tech CSE</span>
          </div>
        </div>
      </div>

      <RoleDonutChart segments={roleBreakdown} variant="fifa" />
    </div>
  );
}
