"use client";

import { profile } from "@/data/portfolio";
import { Tile } from "@/components/tiles/Tile";
import { TileGrid } from "@/components/tiles/TileGrid";
import { EducationQualificationsTile } from "@/components/education/EducationQualificationsTile";
import { KnowMeTile } from "@/components/knowme/KnowMeTile";
import { SkillsTile } from "@/components/skills/SkillsTile";
import type { TabId } from "@/data/portfolio";

interface HomePanelProps {
  onNavigate: (tab: TabId) => void;
}

export function HomePanel({ onNavigate }: HomePanelProps) {
  void onNavigate;

  return (
    <TileGrid variant="home">
      <Tile
        title="KICK OFF"
        variant="hero"
        className="tile-area-hero"
        navIndex={0}
        backgroundImage="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80"
        imagePosition="85% 70%"
        description={profile.summary}
      >
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[#333] md:text-sm">
          {profile.tagline}
        </p>
      </Tile>

      <KnowMeTile navIndex={1} />

      <Tile
        title="NEWS & ALERTS"
        variant="panel"
        className="tile-area-news"
        navIndex={2}
        watermark="PORTFOLIO"
        subtitle={profile.education.school}
        description={`${profile.education.degree} · CGPA ${profile.education.cgpa} · ${profile.education.period}`}
      >
        <div className="mt-1 flex flex-wrap gap-2">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="fifa-link-chip"
            onClick={(e) => e.stopPropagation()}
          >
            LinkedIn
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="fifa-link-chip"
            onClick={(e) => e.stopPropagation()}
          >
            GitHub
          </a>
          <a
            href={profile.leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="fifa-link-chip"
            onClick={(e) => e.stopPropagation()}
          >
            LeetCode
          </a>
        </div>
      </Tile>

      <SkillsTile navIndex={3} />

      <EducationQualificationsTile navIndex={4} />
    </TileGrid>
  );
}
