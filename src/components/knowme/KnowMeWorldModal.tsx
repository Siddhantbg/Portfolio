"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { knowMeWorldMeta, type KnowMeEgg } from "@/data/knowMeWorld";
import { playUiSelectSound } from "@/lib/sfx";

const KnowMeWorldScene = dynamic(
  () =>
    import("@/components/knowme/KnowMeWorldScene").then(
      (mod) => mod.KnowMeWorldScene,
    ),
  { ssr: false },
);

interface KnowMeWorldModalProps {
  open: boolean;
  onClose: () => void;
}

export function KnowMeWorldModal({ open, onClose }: KnowMeWorldModalProps) {
  const [started, setStarted] = useState(false);
  const [nearest, setNearest] = useState<KnowMeEgg | null>(null);
  const [active, setActive] = useState<KnowMeEgg | null>(null);

  useEffect(() => {
    if (!open) {
      setStarted(false);
      setNearest(null);
      setActive(null);
    }
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

  const activateEgg = useCallback((egg: KnowMeEgg) => {
    playUiSelectSound();
    setActive(egg);
    window.open(egg.href, "_blank", "noopener,noreferrer");
  }, []);

  if (!open) return null;

  return (
    <div
      className="knowme-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="knowme-modal-panel knowme-world-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="knowme-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="knowme-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="knowme-rpg-frame knowme-world-frame">
          <header className="knowme-rpg-hud">
            <div>
              <p className="knowme-rpg-kicker">3D Field Explorer</p>
              <h2 id="knowme-modal-title" className="knowme-rpg-title">
                {knowMeWorldMeta.title}
              </h2>
            </div>
            <span className="knowme-stat-chip">
              {nearest ? (
                <>
                  Near <strong>{nearest.label}</strong>
                </>
              ) : (
                <>Roll to a mark</>
              )}
            </span>
          </header>

          <div className="knowme-world-stage">
            {!started ? (
              <div className="knowme-title-screen">
                <div className="outpost-title-bg knowme-world-title-bg" aria-hidden />
                <div className="knowme-title-card">
                  <p className="knowme-title-badge">FIELD MODE</p>
                  <h3 className="knowme-title-hero">{knowMeWorldMeta.title}</h3>
                  <p className="knowme-title-blurb">{knowMeWorldMeta.subtitle}</p>
                  <p className="outpost-controls-hint">
                    {knowMeWorldMeta.controls}
                  </p>
                  <button
                    type="button"
                    className="knowme-start-btn"
                    onClick={() => {
                      playUiSelectSound();
                      setStarted(true);
                    }}
                  >
                    PRESS START
                  </button>
                </div>
              </div>
            ) : (
              <>
                <KnowMeWorldScene
                  paused={active !== null}
                  nearestId={nearest?.id ?? null}
                  onNearestChange={setNearest}
                  onActivate={activateEgg}
                />

                {nearest && !active && (
                  <div className="outpost-prompt knowme-world-prompt">
                    <span className="outpost-prompt-key">⏎</span>
                    OPEN {nearest.label}
                  </div>
                )}

                {active && (
                  <div
                    className="outpost-panel-backdrop"
                    onClick={() => setActive(null)}
                    role="presentation"
                  >
                    <div
                      className="outpost-panel"
                      role="dialog"
                      aria-label={active.label}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <header className="outpost-panel-header">
                        <div>
                          <p className="outpost-panel-question">Resume mark</p>
                          <h3 className="outpost-panel-title">{active.label}</h3>
                        </div>
                        <button
                          type="button"
                          className="outpost-panel-close"
                          onClick={() => {
                            playUiSelectSound();
                            setActive(null);
                          }}
                        >
                          CLOSE
                        </button>
                      </header>
                      <p className="outpost-panel-flavor">{active.subtitle}</p>
                      <div className="outpost-chip-row">
                        <a
                          href={active.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="outpost-link"
                          onClick={() => playUiSelectSound()}
                        >
                          Open link ↗
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
