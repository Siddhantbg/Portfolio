"use client";

import { useState } from "react";
import { educationQualifications } from "@/data/portfolio";
import { Tile } from "@/components/tiles/Tile";
import { EducationCard } from "@/components/education/EducationCard";
import { EducationTimelineModal } from "@/components/education/EducationTimelineModal";

interface EducationQualificationsTileProps {
  navIndex?: number;
}

export function EducationQualificationsTile({
  navIndex = 4,
}: EducationQualificationsTileProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const latest =
    educationQualifications.find((item) => item.isActive) ??
    educationQualifications[educationQualifications.length - 1];

  return (
    <>
      <Tile
        title="EDUCATION QUALIFICATIONS"
        variant="card"
        className="tile-area-education"
        navIndex={navIndex}
        showDots
        activeDot={educationQualifications.length - 1}
        dotCount={educationQualifications.length}
        onClick={() => setModalOpen(true)}
      >
        <EducationCard qualification={latest} variant="preview" />
        <p className="edu-tile-hint">Click to view timeline</p>
      </Tile>

      <EducationTimelineModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
