"use client";

import { useState } from "react";
import { Tile } from "@/components/tiles/Tile";
import { SkillsReportModal } from "@/components/skills/SkillsReportModal";
import skillsReport from "@/data/skillsReport.json";

const { report } = skillsReport;

interface SkillsTileProps {
  navIndex?: number;
}

export function SkillsTile({ navIndex = 3 }: SkillsTileProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Tile
        title="SKILLS"
        variant="card"
        className="tile-area-ut"
        navIndex={navIndex}
        showDots
        activeDot={0}
        dotCount={3}
        onClick={() => setModalOpen(true)}
      >
        <div className="skills-tile-preview">
          <span className="skills-tile-ovr">{report.ovr}</span>
          <div className="skills-tile-meta">
            <p className="skills-tile-role">{report.role} · AI / ML</p>
            <p className="skills-tile-strength">{report.keyStrength}</p>
          </div>
        </div>
        <p className="edu-tile-hint">Click for full squad report</p>
      </Tile>

      <SkillsReportModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
