"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import candidatePhoto from "@/assets/Educational/2026.jpg";
import {
  profile,
  careerProfile,
  careerStatistics,
} from "@/data/portfolio";
import { cn } from "@/lib/cn";

interface HireMeModalProps {
  open: boolean;
  onClose: () => void;
}

function InBadge({ className }: { className?: string }) {
  return (
    <span className={cn("hire-in-badge", className)} aria-hidden="true">
      in
    </span>
  );
}

export function HireMeModal({ open, onClose }: HireMeModalProps) {
  const penRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const sigRef = useRef<SVGSVGElement>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (!open) return;

    setSigning(false);
    setSigned(false);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const handleSign = () => {
    if (signing) return;

    const pen = penRef.current;
    const anchor = anchorRef.current;

    if (pen && anchor) {
      const penRect = pen.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const tipX = penRect.left + penRect.width / 2;
      const tipY = penRect.bottom - 6;
      pen.style.setProperty("--pen-tx", `${anchorRect.left - tipX}px`);
      pen.style.setProperty("--pen-ty", `${anchorRect.top - tipY}px`);
    }

    sigRef.current
      ?.querySelectorAll<SVGPathElement>(".hire-sign-stroke")
      .forEach((path) => {
        const len = path.getTotalLength();
        path.style.setProperty("--len", `${len}`);
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len}`;
      });

    setSigned(false);
    setSigning(true);
  };

  const handlePenAnimEnd = () => {
    sigRef.current
      ?.querySelectorAll<SVGPathElement>(".hire-sign-stroke")
      .forEach((path) => {
        path.style.strokeDashoffset = "0";
      });
    setSigning(false);
    setSigned(true);
  };

  if (!open) return null;

  return (
    <div className="hire-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={cn(
          "hire-modal-panel",
          signing && "is-signing",
          signed && "is-signed",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hire-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="hire-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="hire-offer-grid">
          {/* ── Left: candidate info ── */}
          <section className="hire-col hire-col-left">
            <header className="hire-col-head">
              <InBadge />
              <h2 id="hire-modal-title" className="hire-col-title">
                Candidate Info
              </h2>
            </header>

            <div className="hire-player-card">
              <div className="hire-player-card-head">
                <InBadge className="hire-in-badge-sm" />
                <div className="hire-player-name-block">
                  <p className="hire-player-name">
                    {profile.name
                      .split(" ")
                      .map((p) => p.charAt(0) + p.slice(1).toLowerCase())
                      .join(" ")}
                  </p>
                  <p className="hire-player-club">Open to Work</p>
                </div>
              </div>

              <div className="hire-player-card-body">
                <div className="hire-player-photo-wrap">
                  <Image
                    src={candidatePhoto}
                    alt={profile.name}
                    fill
                    className="hire-player-photo"
                    sizes="120px"
                  />
                </div>

                <div className="hire-player-stats">
                  <div className="hire-stat-row hire-stat-row-head">
                    <span>OVR</span>
                    <span>POS</span>
                    <span>EXP</span>
                  </div>
                  <div className="hire-stat-row hire-stat-row-values">
                    <span>{careerProfile.overallRating}</span>
                    <span>{careerProfile.roleAbbr}</span>
                    <span>3y</span>
                  </div>
                  <div className="hire-stat-line">
                    <span className="hire-stat-line-label">VALUE</span>
                    <span className="hire-stat-line-value">Open to hire</span>
                  </div>
                  <div className="hire-stat-line">
                    <span className="hire-stat-line-label">FORM</span>
                    <span className="hire-stat-line-value hire-positive">
                      On Fire
                    </span>
                  </div>
                  <div className="hire-stat-line">
                    <span className="hire-stat-line-label">MORALE</span>
                    <span className="hire-stat-line-value hire-positive">
                      Very Motivated
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hire-contract">
              <h3 className="hire-subhead">Current Status</h3>
              <dl className="hire-contract-rows">
                <div>
                  <dt>Notice Period</dt>
                  <dd>Available {profile.gradYear}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{careerProfile.location}</dd>
                </div>
                <div>
                  <dt>Preferred Role</dt>
                  <dd>AI / ML · Full-Stack</dd>
                </div>
                <div>
                  <dt>Work Type</dt>
                  <dd>Remote / Onsite</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* ── Middle: pen + divider ── */}
          <div className="hire-divider" aria-hidden="true">
            <span className="hire-divider-line" />
            <div
              ref={penRef}
              className="hire-pen"
              onAnimationEnd={handlePenAnimEnd}
            >
              <svg viewBox="0 0 18 120" className="hire-pen-svg">
                <rect x="6" y="4" width="6" height="86" rx="3" fill="#0a66c2" />
                <rect x="6" y="4" width="3" height="86" rx="1.5" fill="#378fe9" />
                <rect x="5" y="88" width="8" height="10" rx="2" fill="#1b1f23" />
                <polygon points="6,98 12,98 9,116" fill="#1b1f23" />
                <polygon points="8.2,109 9.8,109 9,116" fill="#ffd966" />
                <rect x="6" y="14" width="6" height="4" rx="2" fill="#e8b923" />
              </svg>
            </div>
          </div>

          {/* ── Right: transfer offer ── */}
          <section className="hire-col hire-col-right">
            <header className="hire-col-head">
              <InBadge />
              <h2 className="hire-col-title">Transfer Offer</h2>
            </header>

            <p className="hire-comments-label">Recruiter Comments:</p>
            <p className="hire-comments">
              {profile.name.split(" ")[0]} is one of the best in his field. We
              should reach out to discuss roles, projects, or collaboration
              before someone else closes the deal.
            </p>

            <div className="hire-action-row">
              <a
                href={`mailto:${profile.email}?subject=Hiring%20Inquiry`}
                className="hire-action-btn"
              >
                <span className="hire-key">L1</span> EMAIL
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hire-action-btn"
              >
                <span className="hire-key">R1</span> LINKEDIN
              </a>
            </div>

            <dl className="hire-budget-rows">
              <div>
                <dt>Projects Shipped</dt>
                <dd>{careerStatistics[0]?.value}</dd>
              </div>
              <div>
                <dt>Response Time</dt>
                <dd>&lt; 24 hours</dd>
              </div>
              <div>
                <dt>Internships</dt>
                <dd>{careerStatistics[1]?.value}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>{profile.education.period.split("–")[1]?.trim() ?? "2026"}</dd>
              </div>
            </dl>

            <div className="hire-signature-area">
              <div className="hire-signature-line">
                <span ref={anchorRef} className="hire-sign-anchor" />
                <svg
                  ref={sigRef}
                  viewBox="0 0 130 44"
                  className="hire-signature-svg"
                  aria-hidden="true"
                >
                  <path
                    className="hire-sign-stroke"
                    d="M2 32 C 10 10, 20 8, 24 28 S 38 46, 46 24 C 52 8, 62 10, 68 30 C 72 42, 84 42, 94 22 C 102 8, 116 14, 122 30"
                    fill="none"
                    stroke="#0a66c2"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <path
                    className="hire-sign-stroke"
                    d="M6 40 C 40 48, 92 48, 126 36"
                    fill="none"
                    stroke="#0a66c2"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="hire-signature-labels">
                <span>Candidate</span>
                <span>Recruiter</span>
              </div>
            </div>

            <button
              type="button"
              className={cn("hire-submit-btn", signed && "is-done")}
              onClick={handleSign}
              disabled={signing}
            >
              {signed ? "✓ OFFER SIGNED" : signing ? "SIGNING…" : "✗ SUBMIT OFFER"}
            </button>

            {signed && (
              <p className="hire-signed-note">
                Let&apos;s connect —{" "}
                <a href={`mailto:${profile.email}`}>send an email</a>
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
