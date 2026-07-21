"use client";

import { useState } from "react";
import { profile } from "@/data/portfolio";
import { HireMeModal } from "@/components/career/HireMeModal";
import { useFifaNavigationOptional } from "@/context/FifaNavigationContext";
import { playUiSelectSound } from "@/lib/sfx";
import { cn } from "@/lib/cn";

interface HireMeCardProps {
  navIndex?: number;
  focused?: boolean;
}

export function HireMeCard({ navIndex = 0, focused = false }: HireMeCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const nav = useFifaNavigationOptional();

  return (
    <>
      <button
        type="button"
        data-fifa-tile-index={navIndex}
        onMouseEnter={() => nav?.setFocusToTile(navIndex)}
        onClick={() => {
          playUiSelectSound();
          setModalOpen(true);
        }}
        className={cn(
          "career-hire-card fifa-tile-interactive",
          focused && "fifa-tile-keyboard-focused",
        )}
      >
        <div className="career-hire-card-bg" aria-hidden />
        <div className="career-hire-card-overlay" aria-hidden />
        <div className="career-hire-card-content">
          <span className="career-hire-card-eyebrow">Open to Opportunities</span>
          <h3 className="career-hire-card-title">HIRE ME</h3>
          <p className="career-hire-card-sub">{profile.tagline}</p>
        </div>
      </button>

      <HireMeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
