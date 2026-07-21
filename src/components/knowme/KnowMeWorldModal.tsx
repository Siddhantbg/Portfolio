"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { knowMeWorldMeta, type KnowMeLandmark } from "@/data/knowMeWorld";
import { playUiSelectSound } from "@/lib/sfx";

const KnowMeWorldScene = dynamic(
  () =>
    import("@/components/knowme/KnowMeWorldScene").then(
      (mod) => mod.KnowMeWorldScene,
    ),
  { ssr: false },
);

/* ------------------------------------------------------------------ */
/* Loading screen — modern football matchday loader                    */
/* Center-circle + midline motif, big percentage, glowing progress bar */
/* ------------------------------------------------------------------ */
function KnowMeLoader({ progress }: { progress: number }) {
  const pct = Math.min(100, Math.round(progress));
  return (
    <div className="knowme-loader" role="status" aria-label="Loading 3D world">
      <div className="knowme-loader-inner">
        <p className="knowme-loader-kicker">MATCHDAY · LOADING WORLD</p>
        <h3 className="knowme-loader-title">KNOW ME</h3>

        <div className="knowme-loader-pitch" aria-hidden>
          <div className="knowme-loader-line">
            <div
              className="knowme-loader-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="knowme-loader-circle">
            <span className="knowme-loader-ball">⚽</span>
          </div>
        </div>

        <p className="knowme-loader-pct">
          {pct}
          <span>%</span>
        </p>
        <p className="knowme-loader-hint">warming up the night world…</p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- */
/* Click-to-start — hand-drawn text over the idle world         */
/* ----------------------------------------------------------- */
function ClickToStart({ onStart }: { onStart: () => void }) {
  return (
    <button type="button" className="knowme-start-overlay" onClick={onStart}>
      <span className="knowme-start-note" aria-hidden>
        <svg
          className="knowme-start-arrow"
          viewBox="0 0 90 70"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M82 8 C 60 30, 40 34, 14 44" />
          <path d="M26 34 L 12 45 L 30 52" />
        </svg>
        <span className="knowme-start-text">
          CLICK TO
          <br />
          START
        </span>
        <span className="knowme-start-sound">🔊 sound on</span>
      </span>
    </button>
  );
}

interface KnowMeWorldModalProps {
  open: boolean;
  onClose: () => void;
}

export function KnowMeWorldModal({ open, onClose }: KnowMeWorldModalProps) {
  const [started, setStarted] = useState(false);
  const [graceOver, setGraceOver] = useState(false);
  const [nearest, setNearest] = useState<KnowMeLandmark | null>(null);
  const [active, setActive] = useState<KnowMeLandmark | null>(null);
  const { progress, active: loading } = useProgress();

  // Assets may be cached from a previous visit and never report progress,
  // so also consider the world ready once nothing is loading after a beat.
  const ready = graceOver && !loading;

  useEffect(() => {
    if (!open) {
      setStarted(false);
      setGraceOver(false);
      setNearest(null);
      setActive(null);
      return;
    }
    const timer = window.setTimeout(() => setGraceOver(true), 700);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      if (active) {
        setActive(null);
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
  }, [open, onClose, active]);

  const activateLandmark = useCallback((landmark: KnowMeLandmark) => {
    playUiSelectSound();
    setActive(landmark);
    window.open(landmark.href, "_blank", "noopener,noreferrer");
  }, []);

  if (!open) return null;

  return (
    <div
      className="knowme-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="knowme-modal-panel knowme-world-panel knowme-night-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="knowme-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="knowme-modal-close knowme-night-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="knowme-night-frame">
          <header className="knowme-night-hud">
            <div>
              <p className="knowme-night-kicker">3D Night World</p>
              <h2 id="knowme-modal-title" className="knowme-night-title">
                {knowMeWorldMeta.title}
              </h2>
            </div>
            <span className="knowme-night-chip">
              {nearest ? (
                <>
                  Near <strong>{nearest.label}</strong>
                </>
              ) : (
                <>{knowMeWorldMeta.controls}</>
              )}
            </span>
          </header>

          <div className="knowme-world-stage">
            <KnowMeWorldScene
              paused={!started || active !== null}
              nearestId={nearest?.id ?? null}
              onNearestChange={setNearest}
              onActivate={activateLandmark}
            />

            {!ready && <KnowMeLoader progress={progress} />}

            {ready && !started && (
              <ClickToStart
                onStart={() => {
                  playUiSelectSound();
                  setStarted(true);
                }}
              />
            )}

            {started && nearest && !active && (
              <div className="knowme-night-prompt">
                <span className="knowme-night-prompt-key">⏎</span>
                OPEN {nearest.label.toUpperCase()}
              </div>
            )}

            {active && (
              <div
                className="knowme-night-panel-backdrop"
                onClick={() => setActive(null)}
                role="presentation"
              >
                <div
                  className="knowme-night-card"
                  role="dialog"
                  aria-label={active.label}
                  onClick={(event) => event.stopPropagation()}
                >
                  <header className="knowme-night-card-header">
                    <div>
                      <p className="knowme-night-card-kicker">Resume stone</p>
                      <h3 className="knowme-night-card-title">{active.label}</h3>
                    </div>
                    <button
                      type="button"
                      className="knowme-night-card-close"
                      onClick={() => {
                        playUiSelectSound();
                        setActive(null);
                      }}
                    >
                      CLOSE
                    </button>
                  </header>
                  <p className="knowme-night-card-sub">{active.subtitle}</p>
                  <a
                    href={active.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="knowme-night-card-link"
                    onClick={() => playUiSelectSound()}
                  >
                    Open link ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
