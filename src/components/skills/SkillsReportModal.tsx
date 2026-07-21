"use client";

import { useEffect } from "react";
import Image from "next/image";
import playerPhoto from "@/assets/Educational/2026.jpg";
import skillsReport from "@/data/skillsReport.json";
import { cn } from "@/lib/cn";

interface SkillsReportModalProps {
  open: boolean;
  onClose: () => void;
}

const { report, categories, attributeGroups } = skillsReport;

function ratingClass(value: number) {
  if (value >= 90) return "skill-chip-elite";
  if (value >= 85) return "skill-chip-high";
  if (value >= 80) return "skill-chip-mid";
  if (value >= 70) return "skill-chip-low";
  return "skill-chip-weak";
}

function CategoryIcon({ name }: { name: string }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "languages":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
      );
    case "frontend":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M3 9h18M8 21h8" />
        </svg>
      );
    case "backend":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="6" rx="1.5" />
          <rect x="3" y="14" width="18" height="6" rx="1.5" />
          <path d="M7 7h.01M7 17h.01" />
        </svg>
      );
    case "databases":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="6" rx="8" ry="3" />
          <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
        </svg>
      );
    case "aiml":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
        </svg>
      );
    case "tools":
      return (
        <svg {...common}>
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2 2.3-2.3z" />
        </svg>
      );
    case "testing":
      return (
        <svg {...common}>
          <path d="M9 11l3 3 8-8" />
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
  }
}

export function SkillsReportModal({ open, onClose }: SkillsReportModalProps) {
  useEffect(() => {
    if (!open) return;

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

  if (!open) return null;

  return (
    <div className="skills-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="skills-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skills-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="skills-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="skills-report-grid">
          {/* ── Left: Squad Report ── */}
          <section className="skills-left">
            <h2 id="skills-modal-title" className="skills-report-title">
              {report.title}
            </h2>

            <div className="skills-player-card">
              <div className="skills-player-head">
                <span className="skills-player-initials">{report.initials}</span>
                <div className="skills-player-id">
                  <p className="skills-player-name">{report.name}</p>
                  <p className="skills-player-subtitle">{report.subtitle}</p>
                </div>
              </div>

              <div className="skills-player-body">
                <div className="skills-player-photo-wrap">
                  <Image
                    src={playerPhoto}
                    alt={report.name}
                    fill
                    className="skills-player-photo"
                    sizes="120px"
                  />
                </div>

                <div className="skills-player-stats">
                  <div className="skills-stat-grid skills-stat-grid-head">
                    <span>OVR</span>
                    <span>ROLE</span>
                    <span>EXP</span>
                  </div>
                  <div className="skills-stat-grid skills-stat-grid-values">
                    <span className="skills-ovr">{report.ovr}</span>
                    <span className="skills-role">{report.role}</span>
                    <span className="skills-exp">{report.exp}</span>
                  </div>
                  <div className="skills-stat-line">
                    <span className="skills-stat-key">VALUE</span>
                    <span className="skills-stat-val">{report.value}</span>
                  </div>
                  <div className="skills-stat-line">
                    <span className="skills-stat-key">FOCUS</span>
                    <span className="skills-stat-val">{report.focus}</span>
                  </div>
                  <div className="skills-stat-line">
                    <span className="skills-stat-key">FORM</span>
                    <span className="skills-stat-val skills-positive">
                      {report.form}
                    </span>
                  </div>
                  <div className="skills-stat-line">
                    <span className="skills-stat-key">MORALE</span>
                    <span className="skills-stat-val skills-positive">
                      {report.morale}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="skills-cat-table">
              <div className="skills-cat-row skills-cat-head">
                <span>Category</span>
                <span>Skills</span>
              </div>
              {categories.map((category) => (
                <div key={category.name} className="skills-cat-row">
                  <span className="skills-cat-name">
                    <span className="skills-cat-icon">
                      <CategoryIcon name={category.icon} />
                    </span>
                    {category.name}
                  </span>
                  <span className="skills-cat-skills">
                    {category.skills.join(", ")}
                  </span>
                </div>
              ))}
            </div>

            <div className="skills-keystrength">
              <span className="skills-keystrength-mark">✕</span>
              Key Strength: {report.keyStrength}
            </div>
          </section>

          {/* ── Right: Attributes ── */}
          <section className="skills-right">
            <header className="skills-attr-head">
              <span className="skills-key-pill">L1</span>
              <span className="skills-key-pill">R1</span>
              <h3 className="skills-attr-title">Attributes</h3>
              <span className="skills-attr-dots">
                <span className="skills-attr-dot" />
                <span className="skills-attr-dot skills-attr-dot-active" />
              </span>
            </header>

            <div className="skills-attr-scroll">
              {attributeGroups.map((group) => (
                <div key={group.name} className="skills-attr-group">
                  <p className="skills-attr-group-title">{group.name}:</p>
                  <div className="skills-attr-grid">
                    {group.attributes.map((attr) => (
                      <div key={attr.label} className="skills-attr-row">
                        <span className="skills-attr-label">{attr.label}</span>
                        <span
                          className={cn(
                            "skill-chip",
                            group.type === "count"
                              ? "skill-chip-count"
                              : ratingClass(Number(attr.value)),
                          )}
                        >
                          {attr.value}
                        </span>
                        <span className="skills-attr-caret">▾</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
