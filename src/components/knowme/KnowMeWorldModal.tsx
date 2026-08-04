"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useProgress } from "@react-three/drei";
import { KNOWME_MAP_CREDIT, knowMeWorldMeta } from "@/data/knowMeWorld";
import { profile } from "@/data/portfolio";
import { playUiSelectSound } from "@/lib/sfx";

const KnowMeWorldScene = dynamic(
  () =>
    import("@/components/knowme/KnowMeWorldScene").then(
      (mod) => mod.KnowMeWorldScene,
    ),
  { ssr: false },
);

type KnowMePhase = "welcome" | "map";

interface KnowMeWorldModalProps {
  open: boolean;
  onClose: () => void;
}

function WelcomeScreen({ onExplore }: { onExplore: () => void }) {
  const firstName = profile.name.split(" ")[0];
  const introName = firstName.charAt(0) + firstName.slice(1).toLowerCase();

  return (
    <div className="knowme-welcome">
      <div className="knowme-welcome-inner">
        <h1 className="knowme-welcome-title">WELCOME TO MY WORLD!</h1>
        <p className="knowme-welcome-copy">
          I&apos;m {introName}, an {profile.tagline.replace(" · ", " and ")} who
          is enthusiastic about building AI systems and full-stack products that
          feel sharp, playful, and useful.
        </p>
        <button type="button" className="knowme-welcome-cta" onClick={onExplore}>
          EXPLORE MY WORLD →
        </button>
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="knowme-loading" role="status" aria-live="polite">
      <span className="knowme-loading-pulse" aria-hidden />
      ENTERING CITY…
    </div>
  );
}

export function KnowMeWorldModal({ open, onClose }: KnowMeWorldModalProps) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<KnowMePhase>("welcome");
  const [graceOver, setGraceOver] = useState(false);
  const { active: loading } = useProgress();

  // Cached assets may never report progress, so consider the city ready once
  // nothing is loading after a short grace period.
  const cityReady = graceOver && !loading;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setPhase("welcome");
      setGraceOver(false);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== "map") {
      setGraceOver(false);
      return;
    }
    const timer = window.setTimeout(() => setGraceOver(true), 800);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      if (phase === "map") {
        setPhase("welcome");
        return;
      }
      onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, onClose, phase]);

  const enterMap = useCallback(() => {
    playUiSelectSound();
    setPhase("map");
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="knowme-modal-backdrop knowme-night-backdrop"
      role="presentation"
    >
      <div
        className="knowme-night-fullscreen"
        role="dialog"
        aria-modal="true"
        aria-label={knowMeWorldMeta.title}
      >
        <button
          type="button"
          className="knowme-night-exit"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {phase === "welcome" ? (
          <WelcomeScreen onExplore={enterMap} />
        ) : (
          <div className="knowme-world-stage">
            <KnowMeWorldScene />

            {!cityReady && <LoadingOverlay />}

            {cityReady && (
              <div className="knowme-hud-controls" aria-hidden>
                <span className="knowme-hud-key">WASD</span> fly
                <span className="knowme-hud-sep">·</span>
                <span className="knowme-hud-key">SPACE</span> up
                <span className="knowme-hud-sep">·</span>
                <span className="knowme-hud-key">SHIFT</span> down
                <span className="knowme-hud-sep">·</span>
                <span className="knowme-hud-key">ESC</span> back
              </div>
            )}

            <p className="knowme-night-credit">{KNOWME_MAP_CREDIT}</p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
