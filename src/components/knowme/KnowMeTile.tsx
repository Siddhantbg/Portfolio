"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Tile } from "@/components/tiles/Tile";

const KnowMeWorldModal = dynamic(
  () =>
    import("@/components/knowme/KnowMeWorldModal").then(
      (mod) => mod.KnowMeWorldModal,
    ),
  { ssr: false },
);

interface KnowMeTileProps {
  navIndex?: number;
}

export function KnowMeTile({ navIndex = 1 }: KnowMeTileProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Tile
        title="KNOW ME"
        variant="panel"
        className="tile-area-know"
        navIndex={navIndex}
        watermark="FIELD"
        subtitle="3D Field Explorer"
        description="Roll the football · hit resume marks · Enter for GitHub"
        onClick={() => setModalOpen(true)}
      >
        <div className="knowme-tile-preview">
          <span className="knowme-tile-lv">3D</span>
          <p className="knowme-tile-role">Soccer ball · easter eggs</p>
        </div>
        <p className="edu-tile-hint">Click to enter field</p>
      </Tile>

      {modalOpen && (
        <KnowMeWorldModal open={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
