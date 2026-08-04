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
        watermark="CITY"
        subtitle="Cyber City 2099"
        description="Fly the neon city · Iron Cameraman · NPC traffic"
        onClick={() => setModalOpen(true)}
      >
        <div className="knowme-tile-preview">
          <span className="knowme-tile-lv">3D</span>
          <p className="knowme-tile-role">Fly · explore · night city</p>
        </div>
        <p className="edu-tile-hint">Click to enter city</p>
      </Tile>

      {modalOpen && (
        <KnowMeWorldModal open={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
